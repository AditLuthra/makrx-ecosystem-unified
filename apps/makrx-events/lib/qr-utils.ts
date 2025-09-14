import QRCode from 'qrcode';
import crypto from 'crypto';

const QR_SECRET = process.env.JWT_SIGNING_KEY || 'default-secret-key';

// QR Code data structure
interface QRData {
  registrationId: string;
  eventId: string;
  userId: string;
  timestamp: number;
  signature: string;
}

// Generate signed QR code payload
export function generateQRPayload(registrationId: string, eventId: string, userId: string): string {
  const timestamp = Date.now();
  const data = `${registrationId}:${eventId}:${userId}:${timestamp}`;

  const signature = crypto.createHmac('sha256', QR_SECRET).update(data).digest('hex');

  const qrData: QRData = {
    registrationId,
    eventId,
    userId,
    timestamp,
    signature,
  };

  return JSON.stringify(qrData);
}

// Verify QR code payload
export function verifyQRPayload(payload: string): {
  valid: boolean;
  data?: QRData;
  error?: string;
} {
  try {
    const qrData: QRData = JSON.parse(payload);
    const { registrationId, eventId, userId, timestamp, signature } = qrData;

    // Check if QR code is not too old (24 hours)
    const now = Date.now();
    const age = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (age > maxAge) {
      return { valid: false, error: 'QR code expired' };
    }

    // Verify signature
    const data = `${registrationId}:${eventId}:${userId}:${timestamp}`;
    const expectedSignature = crypto.createHmac('sha256', QR_SECRET).update(data).digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid QR code signature' };
    }

    return { valid: true, data: qrData };
  } catch (error) {
    return { valid: false, error: 'Invalid QR code format' };
  }
}

// Generate QR code image
export async function generateQRCodeImage(payload: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code image');
  }
}

// Generate QR code URL for registration
export function generateRegistrationQRUrl(
  registrationId: string,
  eventId: string,
  userId: string,
): string {
  const payload = generateQRPayload(registrationId, eventId, userId);
  const encodedPayload = encodeURIComponent(payload);
  return `${process.env.APP_BASE_URL || 'http://localhost:3000'}/qr/check-in?data=${encodedPayload}`;
}
