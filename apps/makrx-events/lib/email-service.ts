import nodemailer from 'nodemailer';
import { db } from './db';
import { emailTemplates, emailQueue } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor() {
    this.defaultFrom = process.env.SMTP_FROM || 'noreply@makrx.events';
    this.setupTransporter();
  }

  private setupTransporter() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: emailData.from || this.defaultFrom,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        bcc: emailData.bcc,
        attachments: emailData.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async queueEmail(emailData: EmailData & { 
    eventId?: string;
    userId?: string;
    templateId?: string;
    priority?: number;
    scheduledFor?: Date;
  }): Promise<string> {
    try {
      const [queuedEmail] = await db
        .insert(emailQueue)
        .values({
          eventId: emailData.eventId,
          userId: emailData.userId,
          templateId: emailData.templateId,
          recipient: Array.isArray(emailData.to) ? emailData.to[0] : emailData.to,
          subject: emailData.subject,
          htmlContent: emailData.html,
          textContent: emailData.text,
          priority: emailData.priority || 5,
          status: 'pending',
          scheduledFor: emailData.scheduledFor || new Date(),
          metadata: {
            bcc: emailData.bcc,
            attachments: emailData.attachments,
          },
        })
        .returning();

      return queuedEmail.id;
    } catch (error) {
      console.error('Error queuing email:', error);
      throw error;
    }
  }

  async processEmailQueue(): Promise<void> {
    try {
      const pendingEmails = await db
        .select()
        .from(emailQueue)
        .where(eq(emailQueue.status, 'pending'))
        .orderBy(emailQueue.priority, emailQueue.scheduledFor)
        .limit(10);

      for (const email of pendingEmails) {
        try {
          const success = await this.sendEmail({
            to: email.recipient,
            subject: email.subject,
            html: email.htmlContent || undefined,
            text: email.textContent || undefined,
            bcc: email.metadata?.bcc as string[],
            attachments: email.metadata?.attachments as any[],
          });

          await db
            .update(emailQueue)
            .set({
              status: success ? 'sent' : 'failed',
              sentAt: success ? new Date() : undefined,
              error: success ? null : 'Failed to send email',
              attempts: email.attempts + 1,
            })
            .where(eq(emailQueue.id, email.id));
        } catch (error) {
          await db
            .update(emailQueue)
            .set({
              status: 'failed',
              error: (error as Error).message,
              attempts: email.attempts + 1,
            })
            .where(eq(emailQueue.id, email.id));
        }
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    }
  }

  async sendRegistrationConfirmation(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    registrationDetails: any
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Registration Confirmed! 🎉</h2>
        <p>Hi ${userName},</p>
        <p>You have successfully registered for <strong>${eventTitle}</strong>!</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          ${registrationDetails.location ? `<p><strong>Location:</strong> ${registrationDetails.location}</p>` : ''}
          ${registrationDetails.fee ? `<p><strong>Registration Fee:</strong> ₹${registrationDetails.fee}</p>` : ''}
        </div>

        <p>We're excited to see you at the event! You'll receive more details as the event approaches.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            The MakrX Events Team
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `Registration Confirmed - ${eventTitle}`,
      html,
      text: `Hi ${userName}, you have successfully registered for ${eventTitle} on ${eventDate}. We're excited to see you there!`,
    });
  }

  async sendEventReminder(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    hoursUntilEvent: number
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Reminder: Event Starting Soon! ⏰</h2>
        <p>Hi ${userName},</p>
        <p>This is a friendly reminder that <strong>${eventTitle}</strong> is starting in ${hoursUntilEvent} hours!</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
        </div>

        <p>Make sure you're ready and see you there!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            The MakrX Events Team
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: `Reminder: ${eventTitle} starts in ${hoursUntilEvent} hours`,
      html,
      text: `Hi ${userName}, reminder that ${eventTitle} is starting in ${hoursUntilEvent} hours on ${eventDate}!`,
    });
  }

  async sendBulkEmail(
    recipients: string[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    eventId?: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Process in batches of 50 to avoid overwhelming the email server
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        await this.sendEmail({
          to: this.defaultFrom, // Send to self
          bcc: batch, // Use BCC for privacy
          subject,
          html: htmlContent,
          text: textContent,
        });
        sent += batch.length;
      } catch (error) {
        console.error('Batch email failed:', error);
        failed += batch.length;
      }

      // Wait between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { sent, failed };
  }

  async getEmailTemplate(templateId: string): Promise<any> {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, templateId))
      .limit(1);

    return template;
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<{
    subject: string;
    html: string;
    text: string;
  }> {
    const template = await this.getEmailTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Simple template variable replacement
    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent || '';

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return { subject, html, text };
  }
}

export const emailService = new EmailService();
export default EmailService;
