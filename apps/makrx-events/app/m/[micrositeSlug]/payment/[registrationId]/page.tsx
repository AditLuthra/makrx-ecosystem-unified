'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Clock,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface Registration {
  id: string;
  eventId: string | null;
  subEventId: string | null;
  userId: string | null;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  participantName: string;
  email?: string;
  amount: number;
  currency: string;
  status: string;
  expiresAt: string | null;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const micrositeSlug = params.micrositeSlug as string;
  const registrationId = params.registrationId as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isCheckoutLoading, setCheckoutLoading] = useState(false);
  const [isRazorpayReady, setRazorpayReady] = useState(false);

  const fetchRegistration = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/registrations/${registrationId}`);
      if (!response.ok) {
        throw new Error('Registration not found');
      }
      const data = (await response.json()) as { registration: Registration };
      setRegistration({ ...data.registration, amount: Number(data.registration.amount || 0) });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registration');
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  useEffect(() => {
    const scriptId = 'razorpay-checkout-js';

    if (typeof window === 'undefined') return;
    if (document.getElementById(scriptId)) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => setError('Unable to load Razorpay checkout. Please refresh and try again.');
    document.body.appendChild(script);
  }, []);

  const confirmRegistration = useCallback(
    async (paymentId: string, transactionId: string) => {
      const response = await fetch(`/api/registrations/${registrationId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentId,
          status: 'paid',
          paymentMethod: 'razorpay',
          transactionId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to update registration');
      }

      setPaymentCompleted(true);
      setTimeout(() => {
        router.push(`/m/${micrositeSlug}/registration-success/${registrationId}`);
      }, 2000);
    },
    [micrositeSlug, registrationId, router],
  );

  const handleFreeRegistration = useCallback(async () => {
    try {
      setCheckoutLoading(true);
      await confirmRegistration(`free_${Date.now()}`, `free_${registrationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm registration');
    } finally {
      setCheckoutLoading(false);
    }
  }, [confirmRegistration, registrationId]);

  const startRazorpayCheckout = useCallback(async () => {
    if (!registration) return;
    if (!window.Razorpay || !isRazorpayReady) {
      setError('Payment gateway is still loading. Please wait a moment and retry.');
      return;
    }

    if (!registration.userId || !(registration.eventId || registration.subEventId)) {
      setError('Missing registration metadata. Contact support for assistance.');
      return;
    }

    if (registration.amount <= 0) {
      await handleFreeRegistration();
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          amount: Number(registration.amount),
          currency: registration.currency || 'INR',
          eventId: registration.eventId || registration.subEventId,
          userId: registration.userId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to initiate payment.');
      }

      const order = (await response.json()) as {
        orderId: string;
        amount: number;
        currency: string;
        key: string;
        transactionId: string;
      };

      if (!order?.orderId || !order?.transactionId) {
        throw new Error('Received incomplete order details.');
      }

      const checkout = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: registration.eventTitle,
        description: `Registration for ${registration.eventTitle}`,
        order_id: order.orderId,
        notes: {
          registrationId,
        },
        prefill: {
          name: registration.participantName,
          email: registration.email || undefined,
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: async (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...paymentResponse,
                transactionId: order.transactionId,
                eventId: registration.eventId,
                userId: registration.userId,
              }),
            });

            if (!verifyResponse.ok) {
              const payload = await verifyResponse.json().catch(() => ({}));
              throw new Error(payload.error || 'Payment verification failed.');
            }

            await confirmRegistration(paymentResponse.razorpay_payment_id, order.transactionId);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment confirmation failed.');
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
          },
        },
      });

      checkout.on('payment.failed', async (failure: any) => {
        const reason = failure?.error?.description || 'Payment was not completed.';
        setError(reason);
        setCheckoutLoading(false);
      });

      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch payment gateway.');
      setCheckoutLoading(false);
    }
  }, [confirmRegistration, handleFreeRegistration, isRazorpayReady, registration, registrationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button asChild>
                <Link href={`/m/${micrositeSlug}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Event
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registration) {
    return null;
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your registration has been confirmed. You'll receive a confirmation email shortly.
              </p>
              <div className="animate-pulse text-sm text-gray-500">
                Redirecting to confirmation page...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expiryDate = registration.expiresAt ? new Date(registration.expiresAt) : null;
  const minutesLeft = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60)))
    : null;
  const hasExpired = minutesLeft !== null && minutesLeft <= 0;

  let amountDisplay = `${registration.currency?.toUpperCase() || 'INR'} ${registration.amount.toFixed(2)}`;
  try {
    amountDisplay = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: (registration.currency || 'INR').toUpperCase(),
    }).format(registration.amount || 0);
  } catch (err) {
    // Fallback defined above
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href={`/m/${micrositeSlug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Event
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Complete Your Registration</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
                <CardDescription>
                  Complete your payment to confirm your registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{registration.eventTitle}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {registration.eventDate
                        ? new Date(registration.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Date to be announced'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {registration.eventLocation}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {registration.participantName}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold">{amountDisplay}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Payment Window</p>
                    <p className="text-sm text-gray-600">
                      {minutesLeft === null ? (
                        <>Complete payment at your convenience</>
                      ) : minutesLeft > 0 ? (
                        <>Complete payment within {minutesLeft} minutes</>
                      ) : (
                        <span className="text-red-600">Payment window expired</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Secure Razorpay Checkout</p>
                  <p className="text-blue-700">
                    Payments are processed securely by Razorpay. We do not store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {hasExpired ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Payment Window Expired</h3>
                    <p className="text-gray-600 mb-4">
                      The payment window for this registration has expired. Please register again.
                    </p>
                    <Button asChild>
                      <Link href={`/m/${micrositeSlug}`}>Register Again</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pay with Razorpay</span>
                    <Badge variant="secondary">Preferred</Badge>
                  </CardTitle>
                  <CardDescription>
                    You will be redirected to the secure Razorpay checkout to complete your payment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Payment summary:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Amount due: {amountDisplay}</li>
                      <li>Gateway: Razorpay (cards, UPI, netbanking)</li>
                      <li>Registered email: {registration.email || 'Not provided'}</li>
                    </ul>
                  </div>

                  {!isRazorpayReady && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs">
                      Initializing payment gateway...
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={startRazorpayCheckout}
                    disabled={isCheckoutLoading || !isRazorpayReady}
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay with Razorpay
                      </>
                    )}
                  </Button>

                  {registration.amount <= 0 && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={isCheckoutLoading}
                      onClick={handleFreeRegistration}
                    >
                      Confirm Free Registration
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
