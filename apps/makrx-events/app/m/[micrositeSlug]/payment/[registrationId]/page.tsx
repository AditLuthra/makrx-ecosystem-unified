'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StripePaymentForm from '@/components/payment/StripePaymentForm';
import { 
  CreditCard, 
  Clock, 
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Registration {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  participantName: string;
  amount: number;
  currency: string;
  status: string;
  expiresAt: string;
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

  useEffect(() => {
    fetchRegistration();
  }, [registrationId]);

  const fetchRegistration = async () => {
    try {
      const response = await fetch(`/api/registrations/${registrationId}`);
      if (!response.ok) {
        throw new Error('Registration not found');
      }
      const data = await response.json();
      setRegistration(data.registration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registration');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Update registration status
      const response = await fetch(`/api/registrations/${registrationId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          status: 'paid',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update registration');
      }

      setPaymentCompleted(true);
      
      // Redirect to success page after a delay
      setTimeout(() => {
        router.push(`/m/${micrositeSlug}/registration-success/${registrationId}`);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment confirmation failed');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

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

  if (error || !registration) {
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

  const timeUntilExpiry = new Date(registration.expiresAt).getTime() - Date.now();
  const minutesLeft = Math.max(0, Math.floor(timeUntilExpiry / (1000 * 60)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          {/* Registration Summary */}
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
                      {new Date(registration.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
                    <span className="text-2xl font-bold">
                      ${registration.amount.toFixed(2)} {registration.currency.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Timer */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Payment Window</p>
                    <p className="text-sm text-gray-600">
                      {minutesLeft > 0 ? (
                        <>Complete payment within {minutesLeft} minutes</>
                      ) : (
                        <span className="text-red-600">Payment window expired</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Secure Payment</p>
                  <p className="text-blue-700">
                    Your payment is processed securely through Stripe. We never store your credit card information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            {minutesLeft > 0 ? (
              <StripePaymentForm
                amount={registration.amount}
                currency={registration.currency}
                description={`Registration for ${registration.eventTitle}`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Payment Window Expired</h3>
                    <p className="text-gray-600 mb-4">
                      The payment window for this registration has expired. Please register again.
                    </p>
                    <Button asChild>
                      <Link href={`/m/${micrositeSlug}`}>
                        Register Again
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}