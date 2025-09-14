import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Calendar,
  MapPin,
  Users,
  QrCode,
  Mail,
  Download,
  Share2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface RegistrationSuccessPageProps {
  params: {
    micrositeSlug: string;
    registrationId: string;
  };
}

// Mock data - replace with real API call
async function getRegistrationData(registrationId: string) {
  // In real app, fetch from database
  return {
    id: registrationId,
    eventTitle: "MakerFest 2024 - Arduino Workshop",
    eventDate: "March 15, 2024",
    eventTime: "10:00 AM - 4:00 PM PST",
    eventLocation: "TechHub San Francisco, 123 Innovation St",
    participantName: "John Smith",
    email: "john.smith@example.com",
    status: "confirmed",
    registrationType: "paid",
    amount: 45,
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    confirmationCode: "MF2024-ARD-001",
    benefits: [
      "Access to all workshop sessions",
      "Arduino starter kit included",
      "Networking lunch",
      "Digital certificate of completion"
    ],
    nextSteps: [
      "Check your email for detailed event information",
      "Add the event to your calendar",
      "Join our event WhatsApp group for updates",
      "Bring a laptop and arrive 15 minutes early"
    ],
    contactInfo: {
      organizer: "Sarah Chen",
      email: "sarah@makerfest.com",
      phone: "+1 (555) 123-4567"
    }
  };
}

export default async function RegistrationSuccessPage({ params }: RegistrationSuccessPageProps) {
  const { micrositeSlug, registrationId } = await params;
  
  const registration = await getRegistrationData(registrationId);

  if (!registration) {
    notFound();
  }

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
            <h1 className="text-xl font-semibold">Registration Confirmed</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Registration Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                You're all set for <strong>{registration.eventTitle}</strong>
              </p>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {registration.status === 'confirmed' ? 'Confirmed' : 'Pending Payment'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{registration.eventTitle}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {registration.eventDate} • {registration.eventTime}
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
                    <span className="font-medium">Confirmation Code</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {registration.confirmationCode}
                    </code>
                  </div>
                </div>

                {registration.registrationType === 'paid' && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Amount Paid</span>
                      <span className="text-lg font-bold text-green-600">
                        ${registration.amount}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {registration.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Event Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Organizer:</strong> {registration.contactInfo.organizer}</p>
                  <p><strong>Email:</strong> {registration.contactInfo.email}</p>
                  <p><strong>Phone:</strong> {registration.contactInfo.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  Your Check-in Code
                </CardTitle>
                <CardDescription>
                  Show this QR code for quick check-in at the event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 inline-block">
                    <img 
                      src={registration.qrCode} 
                      alt="Check-in QR Code" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Save this image or screenshot for easy access
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <a 
                    href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20240315T170000Z
DTEND:20240316T000000Z
SUMMARY:${registration.eventTitle}
DESCRIPTION:Registration confirmed for ${registration.eventTitle}
LOCATION:${registration.eventLocation}
END:VEVENT
END:VCALENDAR`}
                    download="event.ics"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${registration.contactInfo.email}?subject=Question about ${registration.eventTitle}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Organizer
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {registration.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">
              We're excited to see you at the event! 🚀
            </h3>
            <p className="text-blue-700 text-sm">
              A confirmation email has been sent to <strong>{registration.email}</strong> with all the details. 
              If you don't see it, please check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}