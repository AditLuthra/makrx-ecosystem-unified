import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import { db } from './db';
import { qrCodes, eventCheckIns, userActivities } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface QRCodeData {
  eventId: string;
  sessionId?: string;
  userId: string;
  type: 'event' | 'session';
}

export interface QRCodeGenerationOptions {
  expirationHours?: number;
  size?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export class QRCodeService {
  static async generateQRCode(
    data: QRCodeData,
    options: QRCodeGenerationOptions = {},
  ): Promise<{ qrCodeId: string; qrCodeUrl: string; rawCode: string }> {
    const {
      expirationHours = 24,
      size = 256,
      color = { dark: '#000000', light: '#FFFFFF' },
    } = options;

    // Generate unique code
    const rawCode = nanoid(16);

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Create QR code record
    const [qrCodeRecord] = await db
      .insert(qrCodes)
      .values({
        eventId: data.eventId,
        sessionId: data.sessionId,
        userId: data.userId,
        code: rawCode,
        type: data.type,
        status: 'active',
        expiresAt,
      })
      .returning();

    // Generate QR code data URL
    const qrCodeData = JSON.stringify({
      id: qrCodeRecord.id,
      code: rawCode,
      type: data.type,
      event: data.eventId,
      session: data.sessionId,
      user: data.userId,
    });

    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
      width: size,
      color,
      errorCorrectionLevel: 'M',
    });

    return {
      qrCodeId: qrCodeRecord.id,
      qrCodeUrl,
      rawCode,
    };
  }

  static async validateAndUseQRCode(
    qrCodeData: string,
    scannedBy: string,
  ): Promise<{
    success: boolean;
    message: string;
    checkInId?: string;
    eventId?: string;
    sessionId?: string;
  }> {
    try {
      const parsed = JSON.parse(qrCodeData);
      const { id, code, type, event: eventId, session: sessionId, user: userId } = parsed;

      // Find QR code record
      const [qrCodeRecord] = await db
        .select()
        .from(qrCodes)
        .where(and(eq(qrCodes.id, id), eq(qrCodes.code, code), eq(qrCodes.status, 'active')))
        .limit(1);

      if (!qrCodeRecord) {
        return { success: false, message: 'Invalid QR code' };
      }

      // Check expiration
      if (qrCodeRecord.expiresAt && new Date() > qrCodeRecord.expiresAt) {
        await db.update(qrCodes).set({ status: 'expired' }).where(eq(qrCodes.id, id));

        return { success: false, message: 'QR code has expired' };
      }

      // Check if already used
      if (qrCodeRecord.usedAt) {
        return { success: false, message: 'QR code already used' };
      }

      // Mark as used
      await db
        .update(qrCodes)
        .set({
          status: 'used',
          usedAt: new Date(),
        })
        .where(eq(qrCodes.id, id));

      // Create check-in record
      const [checkIn] = await db
        .insert(eventCheckIns)
        .values({
          eventId,
          userId,
          checkedInBy: scannedBy,
          notes: `QR Code check-in (${type})`,
        })
        .returning();

      // Track activity
      await db.insert(userActivities).values({
        userId,
        eventId,
        activity: 'check_in',
        metadata: {
          qrCodeId: id,
          checkInType: type,
          sessionId: sessionId || null,
          scannedBy,
        },
      });

      return {
        success: true,
        message: 'Check-in successful',
        checkInId: checkIn.id,
        eventId,
        sessionId,
      };
    } catch (error) {
      console.error('QR code validation error:', error);
      return { success: false, message: 'Invalid QR code format' };
    }
  }

  static async getUserQRCodes(userId: string, eventId?: string) {
    let query = db
      .select({
        id: qrCodes.id,
        eventId: qrCodes.eventId,
        sessionId: qrCodes.sessionId,
        code: qrCodes.code,
        type: qrCodes.type,
        status: qrCodes.status,
        expiresAt: qrCodes.expiresAt,
        usedAt: qrCodes.usedAt,
        createdAt: qrCodes.createdAt,
      })
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId));

    if (eventId) {
      query = query.where(and(eq(qrCodes.userId, userId), eq(qrCodes.eventId, eventId)));
    } else {
      query = query.where(eq(qrCodes.userId, userId));
    }

    return await query.orderBy(qrCodes.createdAt);
  }

  static async regenerateQRCode(
    qrCodeId: string,
    options: QRCodeGenerationOptions = {},
  ): Promise<{ qrCodeUrl: string; rawCode: string } | null> {
    // Get existing QR code
    const [existingQR] = await db.select().from(qrCodes).where(eq(qrCodes.id, qrCodeId)).limit(1);

    if (!existingQR) {
      return null;
    }

    // Mark old QR code as expired
    await db.update(qrCodes).set({ status: 'expired' }).where(eq(qrCodes.id, qrCodeId));

    // Generate new QR code
    const newQR = await this.generateQRCode(
      {
        eventId: existingQR.eventId,
        sessionId: existingQR.sessionId || undefined,
        userId: existingQR.userId,
        type: existingQR.type as 'event' | 'session',
      },
      options,
    );

    return {
      qrCodeUrl: newQR.qrCodeUrl,
      rawCode: newQR.rawCode,
    };
  }

  static async getEventQRCodeStats(eventId: string) {
    const stats = await db
      .select({
        total: qrCodes.id,
        status: qrCodes.status,
        type: qrCodes.type,
      })
      .from(qrCodes)
      .where(eq(qrCodes.eventId, eventId));

    const summary = {
      total: stats.length,
      active: stats.filter((s) => s.status === 'active').length,
      used: stats.filter((s) => s.status === 'used').length,
      expired: stats.filter((s) => s.status === 'expired').length,
      eventCodes: stats.filter((s) => s.type === 'event').length,
      sessionCodes: stats.filter((s) => s.type === 'session').length,
    };

    return summary;
  }
}
