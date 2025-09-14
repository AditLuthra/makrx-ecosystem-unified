import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { emailService } from './email-service';

export class BackgroundJobProcessor {
  private emailService = emailService;

  async processEmailQueue() {
    try {
      // Get pending emails (limit 10 per batch)
      const pendingEmails = await db
        .select()
        .from(emailQueue)
        .where(eq(emailQueue.status, 'pending'))
        .limit(10);

      for (const email of pendingEmails) {
        try {
          // Mark as processing
          await db
            .update(emailQueue)
            .set({ status: 'processing' })
            .where(eq(emailQueue.id, email.id));

          // Send email
          const success = await this.sendEmail(email);

          // Update status
          await db
            .update(emailQueue)
            .set({ 
              status: success ? 'sent' : 'failed',
              sentAt: success ? new Date() : null,
              error: success ? null : 'Failed to send email'
            })
            .where(eq(emailQueue.id, email.id));

        } catch (error) {
          await db
            .update(emailQueue)
            .set({ 
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            })
            .where(eq(emailQueue.id, email.id));
        }
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  async processExportJobs() {
    try {
      // Get queued export jobs (limit 5 per batch)
      const queuedJobs = await db
        .select()
        .from(exportJobs)
        .where(eq(exportJobs.status, 'queued'))
        .limit(5);

      for (const job of queuedJobs) {
        try {
          // Mark as processing
          await db
            .update(exportJobs)
            .set({ status: 'processing' })
            .where(eq(exportJobs.id, job.id));

          // Generate export
          const result = await this.generateExport(job);

          // Update with result
          await db
            .update(exportJobs)
            .set({
              status: 'completed',
              fileUrl: result.fileUrl,
              fileSize: result.fileSize,
              recordCount: result.recordCount,
              completedAt: new Date(),
            })
            .where(eq(exportJobs.id, job.id));

        } catch (error) {
          await db
            .update(exportJobs)
            .set({
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(exportJobs.id, job.id));
        }
      }
    } catch (error) {
      console.error('Error processing export jobs:', error);
    }
  }

  async processBulkCommunications() {
    try {
      // Get scheduled communications that are ready to send
      const now = new Date();
      const readyCommunications = await db
        .select()
        .from(bulkCommunications)
        .where(
          and(
            eq(bulkCommunications.status, 'scheduled'),
            eq(bulkCommunications.scheduledFor, now) // Use proper date comparison
          )
        )
        .limit(5);

      for (const communication of readyCommunications) {
        try {
          await this.sendBulkCommunication(communication);
        } catch (error) {
          console.error('Error sending bulk communication:', error);
        }
      }
    } catch (error) {
      console.error('Error processing bulk communications:', error);
    }
  }

  private async sendEmail(email: any): Promise<boolean> {
    try {
      // Use the email service to send
      if (email.templateId) {
        return await this.emailService.sendTemplateEmail(
          email.to,
          email.templateId,
          email.templateData
        );
      } else {
        return await this.emailService.sendPlainEmail(
          email.to,
          email.subject,
          email.htmlContent || email.textContent
        );
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private async generateExport(job: any): Promise<{ fileUrl: string; fileSize: number; recordCount: number }> {
    // Mock implementation - in real app, generate actual files
    const fileName = `export_${job.type}_${Date.now()}.${job.format}`;
    const fileUrl = `/exports/${fileName}`;
    
    // TODO: Implement actual export generation based on job.type
    // - attendees: Export participant data
    // - payments: Export payment transactions  
    // - analytics: Export event analytics
    // - certificates: Export certificate data
    
    return {
      fileUrl,
      fileSize: 1024 * 50, // Mock 50KB file
      recordCount: 100, // Mock 100 records
    };
  }

  private async sendBulkCommunication(communication: any): Promise<void> {
    try {
      // Mark as processing
      await db
        .update(bulkCommunications)
        .set({ status: 'sending' })
        .where(eq(bulkCommunications.id, communication.id));

      // Get recipients based on target audience
      const recipients = await this.getRecipients(communication);

      let sentCount = 0;
      let failedCount = 0;

      // Send to each recipient
      for (const recipient of recipients) {
        try {
          await this.emailService.sendPlainEmail(
            recipient.email,
            communication.title,
            communication.content
          );
          sentCount++;
        } catch (error) {
          failedCount++;
        }
      }

      // Update campaign status
      await db
        .update(bulkCommunications)
        .set({
          status: 'sent',
          totalRecipients: recipients.length,
          sentCount,
          failedCount,
          sentAt: new Date(),
        })
        .where(eq(bulkCommunications.id, communication.id));

    } catch (error) {
      await db
        .update(bulkCommunications)
        .set({ status: 'failed' })
        .where(eq(bulkCommunications.id, communication.id));
      throw error;
    }
  }

  private async getRecipients(communication: any): Promise<{ email: string; name: string }[]> {
    try {
      if (communication.targetAudience === 'all') {
        // Mock implementation - replace with actual database queries
        return [
          { email: 'user@example.com', name: 'Sample User' }
        ];
      }

      // TODO: Implement other audience types
      // - registered: Only registered participants
      // - teams: Team captains
      // - organizers: Event organizers

      return [];
    } catch (error) {
      console.error('Error getting recipients:', error);
      return [];
    }
  }
}

export const backgroundJobs = new BackgroundJobProcessor();