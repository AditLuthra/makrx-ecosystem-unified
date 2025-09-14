import nodemailer from 'nodemailer';

// Create SMTP transporter
const createTransporter = () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn('SMTP configuration incomplete, email functionality disabled');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface RegistrationEmailData {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventSlug: string;
  participantName: string;
  registrationType: string;
  registrationId: string;
  paymentStatus?: string;
}

export async function sendRegistrationConfirmationEmail(to: string, data: RegistrationEmailData) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('SMTP not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://makrx.events'}/events/${data.eventSlug}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .status-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
          <p>You're all set for an amazing maker experience</p>
        </div>
        
        <div class="content">
          <p>Hi ${data.participantName},</p>
          
          <p>Great news! Your registration for <strong>${data.eventTitle}</strong> has been confirmed. We can't wait to see you there!</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${data.eventDate}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
            <p><strong>Registration Type:</strong> ${data.registrationType}</p>
            <p><strong>Registration ID:</strong> ${data.registrationId}</p>
            ${data.paymentStatus ? `<p><strong>Payment Status:</strong> <span class="status-badge">${data.paymentStatus}</span></p>` : ''}
          </div>
          
          <h3>🛠️ What to Expect</h3>
          <ul>
            <li>Hands-on workshops and maker activities</li>
            <li>Networking with fellow makers and innovators</li>
            <li>Access to tools, materials, and expert guidance</li>
            <li>Opportunities to showcase your projects</li>
          </ul>
          
          <h3>📱 Next Steps</h3>
          <ul>
            <li>Check in when you arrive at the event</li>
            <li>Bring any required materials or projects</li>
            <li>Connect with other participants</li>
            <li>Have fun and learn something new!</li>
          </ul>
          
          <a href="${eventUrl}" class="button">View Event Details</a>
          
          <p>If you have any questions or need to make changes to your registration, please contact the event organizers.</p>
          
          <p>See you at the event!</p>
          <p><strong>The MakrX.events Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>MakrX.events - Connecting Makers, Inspiring Innovation</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Registration Confirmed!
    
    Hi ${data.participantName},
    
    Your registration for ${data.eventTitle} has been confirmed!
    
    Event Details:
    - Event: ${data.eventTitle}
    - Date: ${data.eventDate}
    - Location: ${data.eventLocation}
    - Registration Type: ${data.registrationType}
    - Registration ID: ${data.registrationId}
    ${data.paymentStatus ? `- Payment Status: ${data.paymentStatus}` : ''}
    
    View full event details at: ${eventUrl}
    
    We can't wait to see you there!
    
    The MakrX.events Team
  `;

  try {
    await transporter.sendMail({
      from: {
        name: 'MakrX.events',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@makrx.events',
      },
      to,
      subject: `Registration Confirmed: ${data.eventTitle}`,
      text: textContent,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
