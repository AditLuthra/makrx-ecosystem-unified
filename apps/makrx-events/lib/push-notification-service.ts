import { liveAnnouncements, pushSubscriptions, userActivities } from '@shared/schema';
import { and, eq } from 'drizzle-orm';
import webpush from 'web-push';
import { db } from './db';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@makrx.events',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

export class PushNotificationService {
  static generateVAPIDKeys() {
    return webpush.generateVAPIDKeys();
  }

  static async subscribeUser(
    userId: string,
    subscription: {
      endpoint: string;
      p256dh: string;
      auth: string;
    },
    userAgent?: string,
  ) {
    try {
      // Remove existing subscription for this user/endpoint
      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, userId),
            eq(pushSubscriptions.endpoint, subscription.endpoint),
          ),
        );

      // Add new subscription
      const [newSubscription] = await db
        .insert(pushSubscriptions)
        .values({
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          userAgent,
          isActive: true,
        })
        .returning();

      return newSubscription;
    } catch (error) {
      console.error('Error subscribing user to push notifications:', error);
      throw error;
    }
  }

  static async unsubscribeUser(userId: string, endpoint: string) {
    try {
      await db
        .update(pushSubscriptions)
        .set({ isActive: false })
        .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
    } catch (error) {
      console.error('Error unsubscribing user from push notifications:', error);
      throw error;
    }
  }

  static async getUserSubscriptions(userId: string) {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.isActive, true)));
  }

  static async sendToUser(userId: string, payload: PushNotificationPayload) {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);

      const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          return await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        }),
      );

      // Handle failed subscriptions
      const failedSubscriptions = results
        .map((result, index) => ({ result, subscription: subscriptions[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ subscription }) => subscription);

      // Deactivate failed subscriptions
      if (failedSubscriptions.length > 0) {
        await Promise.all(
          failedSubscriptions.map((subscription) =>
            db
              .update(pushSubscriptions)
              .set({ isActive: false })
              .where(eq(pushSubscriptions.id, subscription.id)),
          ),
        );
      }

      return {
        sent: results.filter((r) => r.status === 'fulfilled').length,
        failed: failedSubscriptions.length,
      };
    } catch (error) {
      console.error('Error sending push notification to user:', error);
      throw error;
    }
  }

  static async sendToEventParticipants(
    eventId: string,
    payload: PushNotificationPayload,
    targetAudience: 'all' | 'participants' | 'organizers' = 'all',
  ) {
    try {
      // Get all active subscriptions for event participants
      let userIds: string[] = [];

      if (targetAudience === 'all' || targetAudience === 'participants') {
        // Get registered users for this event
        const registeredUsers = await db
          .select({ userId: eq(userActivities.userId, userActivities.userId) })
          .from(userActivities)
          .where(and(eq(userActivities.eventId, eventId), eq(userActivities.activity, 'register')));

        userIds = [...userIds, ...registeredUsers.map((u) => u.userId as string)];
      }

      // Remove duplicates (ES2015 compatible)
      userIds = Array.from(new Set(userIds));

      const results = await Promise.allSettled(
        userIds.map((userId) => this.sendToUser(userId, payload)),
      );

      const totalSent = results
        .filter((r) => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value?.sent || 0), 0);

      const totalFailed = results
        .filter((r) => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value?.failed || 0), 0);

      return {
        users: userIds.length,
        sent: totalSent,
        failed: totalFailed,
      };
    } catch (error) {
      console.error('Error sending push notifications to event participants:', error);
      throw error;
    }
  }

  static async sendAnnouncementNotification(
    announcementId: string,
    customPayload?: Partial<PushNotificationPayload>,
  ) {
    try {
      // Get announcement details
      const [announcement] = await db
        .select()
        .from(liveAnnouncements)
        .where(eq(liveAnnouncements.id, announcementId))
        .limit(1);

      if (!announcement || !announcement.sendPushNotification) {
        return { sent: 0, failed: 0 };
      }

      const safePriority = announcement.priority ?? 0;
      const payload: PushNotificationPayload = {
        title: announcement.title ?? '',
        body: announcement.message ?? '',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: `announcement-${announcementId}`,
        data: {
          announcementId,
          eventId: announcement.eventId,
          type: 'announcement',
          priority: safePriority,
        },
        requireInteraction: safePriority >= 3,
        ...customPayload,
      };

      // Add action buttons for high priority announcements
      if (safePriority >= 3) {
        payload.actions = [
          {
            action: 'view',
            title: 'View Details',
            icon: '/icons/view-icon.png',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icons/dismiss-icon.png',
          },
        ];
      }

      return await this.sendToEventParticipants(
        announcement.eventId,
        payload,
        announcement.targetAudience as 'all' | 'participants' | 'organizers',
      );
    } catch (error) {
      console.error('Error sending announcement notification:', error);
      throw error;
    }
  }

  static async testNotification(userId: string) {
    const payload: PushNotificationPayload = {
      title: 'Test Notification',
      body: 'This is a test notification from MakrX Events!',
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    };

    return await this.sendToUser(userId, payload);
  }
}

export default PushNotificationService;
