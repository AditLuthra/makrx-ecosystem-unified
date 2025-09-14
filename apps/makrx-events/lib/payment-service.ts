import crypto from 'crypto';
import { db } from './db';
import { paymentTransactions, eventRegistrations } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface RazorpayOrderData {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

interface RazorpayPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface UPIPaymentData {
  vpa: string;
  amount: number;
  transactionId: string;
  merchantTransactionId: string;
}

class PaymentService {
  private razorpayKeyId: string;
  private razorpayKeySecret: string;

  constructor() {
    this.razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
    this.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  async createRazorpayOrder(orderData: RazorpayOrderData): Promise<any> {
    try {
      const auth = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString(
        'base64',
      );

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Razorpay API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async verifyRazorpayPayment(paymentData: RazorpayPaymentData): Promise<boolean> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayKeySecret)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      return false;
    }
  }

  async processRegistrationPayment(
    registrationId: string,
    amount: number,
    paymentMethod: 'razorpay' | 'upi',
    eventId: string,
    userId: string,
  ): Promise<{ orderId?: string; paymentUrl?: string }> {
    try {
      const receipt = `reg_${registrationId}_${Date.now()}`;

      // Create payment transaction record
      const [transaction] = await db
        .insert(paymentTransactions)
        .values({
          eventId,
          userId,
          amount: amount.toString(),
          currency: 'INR',
          status: 'pending',
          paymentMethod,
          transactionId: receipt,
          metadata: {
            registrationId,
            type: 'event_registration',
          },
        })
        .returning();

      if (paymentMethod === 'razorpay') {
        const order = await this.createRazorpayOrder({
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          receipt,
          notes: {
            eventId,
            userId,
            registrationId,
          },
        });

        // Update transaction with Razorpay order ID
        await db
          .update(paymentTransactions)
          .set({
            gatewayOrderId: order.id,
            metadata: {
              ...transaction.metadata,
              razorpayOrderId: order.id,
            },
          })
          .where(eq(paymentTransactions.id, transaction.id));

        return { orderId: order.id };
      } else if (paymentMethod === 'upi') {
        // Generate UPI payment URL
        const upiUrl = this.generateUPIUrl({
          vpa: 'makrxevents@paytm', // Replace with actual UPI ID
          amount,
          transactionId: receipt,
          merchantTransactionId: transaction.id,
        });

        return { paymentUrl: upiUrl };
      }

      return {};
    } catch (error) {
      console.error('Error processing registration payment:', error);
      throw error;
    }
  }

  private generateUPIUrl(upiData: UPIPaymentData): string {
    const { vpa, amount, transactionId, merchantTransactionId } = upiData;

    const params = new URLSearchParams({
      pa: vpa,
      pn: 'MakrX Events',
      tr: transactionId,
      tid: merchantTransactionId,
      am: amount.toString(),
      cu: 'INR',
      tn: 'Event Registration Payment',
    });

    return `upi://pay?${params.toString()}`;
  }

  async handlePaymentSuccess(
    transactionId: string,
    paymentData: RazorpayPaymentData | any,
  ): Promise<boolean> {
    try {
      const [transaction] = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.transactionId, transactionId))
        .limit(1);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      let verified = false;

      if (transaction.paymentMethod === 'razorpay') {
        verified = await this.verifyRazorpayPayment(paymentData);
      } else if (transaction.paymentMethod === 'upi') {
        // For UPI, we might get webhook data or manual verification
        verified = true; // Implement UPI verification logic
      }

      if (verified) {
        // Update transaction status
        await db
          .update(paymentTransactions)
          .set({
            status: 'completed',
            gatewayPaymentId: paymentData.razorpay_payment_id || paymentData.paymentId,
            completedAt: new Date(),
            metadata: {
              ...transaction.metadata,
              paymentResponse: paymentData,
            },
          })
          .where(eq(paymentTransactions.id, transaction.id));

        // Update registration status
        const registrationId = transaction.metadata?.registrationId;
        if (registrationId) {
          await db
            .update(eventRegistrations)
            .set({
              paymentStatus: 'paid',
              amountPaid: transaction.amount,
            })
            .where(eq(eventRegistrations.id, registrationId));
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  async handlePaymentFailure(transactionId: string, reason: string): Promise<void> {
    try {
      await db
        .update(paymentTransactions)
        .set({
          status: 'failed',
          error: reason,
          completedAt: new Date(),
        })
        .where(eq(paymentTransactions.transactionId, transactionId));
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw error;
    }
  }

  async getTransactionStatus(transactionId: string): Promise<any> {
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, transactionId))
      .limit(1);

    return transaction;
  }

  async refundPayment(transactionId: string, amount?: number): Promise<boolean> {
    try {
      const transaction = await this.getTransactionStatus(transactionId);

      if (!transaction || transaction.status !== 'completed') {
        throw new Error('Transaction not found or not completed');
      }

      if (transaction.paymentMethod === 'razorpay') {
        const auth = Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString(
          'base64',
        );

        const refundData = {
          amount: amount ? amount * 100 : parseInt(transaction.amount) * 100,
          speed: 'normal',
          notes: {
            reason: 'Event cancellation refund',
          },
        };

        const response = await fetch(
          `https://api.razorpay.com/v1/payments/${transaction.gatewayPaymentId}/refund`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(refundData),
          },
        );

        if (!response.ok) {
          throw new Error(`Razorpay refund error: ${response.statusText}`);
        }

        const refund = await response.json();

        // Update transaction status
        await db
          .update(paymentTransactions)
          .set({
            status: 'refunded',
            metadata: {
              ...transaction.metadata,
              refund,
            },
          })
          .where(eq(paymentTransactions.id, transaction.id));

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  async getPaymentAnalytics(eventId: string): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    paymentMethods: Record<string, number>;
  }> {
    try {
      const transactions = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.eventId, eventId));

      const analytics = {
        totalRevenue: 0,
        totalTransactions: transactions.length,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0,
        paymentMethods: {} as Record<string, number>,
      };

      for (const transaction of transactions) {
        if (transaction.status === 'completed') {
          analytics.successfulPayments++;
          analytics.totalRevenue += parseFloat(transaction.amount);
        } else if (transaction.status === 'failed') {
          analytics.failedPayments++;
        } else {
          analytics.pendingPayments++;
        }

        analytics.paymentMethods[transaction.paymentMethod] =
          (analytics.paymentMethods[transaction.paymentMethod] || 0) + 1;
      }

      return analytics;
    } catch (error) {
      console.error('Error getting payment analytics:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
export default PaymentService;
