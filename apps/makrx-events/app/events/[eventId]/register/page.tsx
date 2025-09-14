import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/header";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface RegisterPageProps {
  params: {
    eventId: string;
  };
}

// Mock event data - same as main event page
const getEventData = (eventId: string) => {
  const events = {
    "maker-fest-2024": {
      id: "maker-fest-2024",
      title: "Maker Fest 2024",
      type: "festival",
      date: "March 15-17, 2024",
      location: "Moscone Center, San Francisco, CA",
      attendees: 2500,
      price: "Free",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3",
      registrationType: "individual"
    },
    "robotics-championship": {
      id: "robotics-championship", 
      title: "Robotics Championship 2024",
      type: "competition",
      date: "April 20, 2024",
      location: "MIT Campus, Boston, MA",
      attendees: 150,
      price: "$200/team",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3",
      registrationType: "team"
    },
    "3d-printing-workshop": {
      id: "3d-printing-workshop",
      title: "3D Printing Mastery Workshop", 
      type: "workshop",
      date: "May 5, 2024",
      location: "Austin Maker Space, Austin, TX",
      attendees: 50,
      price: "$120",
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3",
      registrationType: "individual"
    }
  };
  
  return events[eventId as keyof typeof events] || null;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { eventId } = await params;
  const event = getEventData(eventId);
  
  if (!event) {
    notFound();
  }

  const isCompetition = event.type === "competition";
  const isWorkshop = event.type === "workshop";
  const isFestival = event.type === "festival";
  const isTeamRegistration = event.registrationType === "team";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link 
          href={`/events/${event.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {event.title}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {isCompetition ? "Competition Registration" : 
                   isWorkshop ? "Workshop Enrollment" : "Event Registration"}
                </CardTitle>
                <CardDescription>
                  {isTeamRegistration ? 
                    "Register your team for this competition" :
                    "Complete your registration below"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>

                  {/* Team Information for competitions */}
                  {isTeamRegistration && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Team Information</h3>
                      <div>
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input id="teamName" placeholder="Enter your team name" />
                      </div>
                      <div>
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 members</SelectItem>
                            <SelectItem value="4">4 members</SelectItem>
                            <SelectItem value="5">5 members</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="teamMembers">Team Members</Label>
                        <Textarea 
                          id="teamMembers" 
                          placeholder="List all team members (name, email, role)"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Experience Level */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Experience</h3>
                    <div>
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(isCompetition || isWorkshop) && (
                      <div>
                        <Label htmlFor="background">
                          {isCompetition ? "Relevant Competition Experience" : "Technical Background"}
                        </Label>
                        <Textarea 
                          id="background" 
                          placeholder={
                            isCompetition ? 
                            "Describe any previous robotics/competition experience..." :
                            "Tell us about your technical background and what you hope to learn..."
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Workshop-specific preferences */}
                  {isWorkshop && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Workshop Preferences</h3>
                      <div>
                        <Label>Dietary Restrictions (lunch included)</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="vegetarian" />
                            <Label htmlFor="vegetarian">Vegetarian</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="vegan" />
                            <Label htmlFor="vegan">Vegan</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="glutenFree" />
                            <Label htmlFor="glutenFree">Gluten-free</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input id="emergencyName" placeholder="Emergency contact name" />
                      </div>
                      <div>
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input id="emergencyPhone" placeholder="Emergency contact phone" />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="updates" />
                      <Label htmlFor="updates" className="text-sm">
                        I would like to receive updates about future events
                      </Label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className={`w-full ${
                      isCompetition ? 'bg-red-600 hover:bg-red-700' :
                      isWorkshop ? 'bg-green-600 hover:bg-green-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {event.price === "Free" ? "Register Now" : `Register & Pay ${event.price}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Event Summary Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{event.attendees} {isTeamRegistration ? 'participants' : 'attendees'}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="font-semibold">{event.price}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">
                    Registration includes:
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {isFestival && (
                      <>
                        <li>• Access to all workshops</li>
                        <li>• Maker marketplace</li>
                        <li>• Networking events</li>
                        <li>• Welcome kit</li>
                      </>
                    )}
                    {isCompetition && (
                      <>
                        <li>• Competition entry</li>
                        <li>• Workspace access</li>
                        <li>• Meals & refreshments</li>
                        <li>• Certificate of participation</li>
                      </>
                    )}
                    {isWorkshop && (
                      <>
                        <li>• All materials included</li>
                        <li>• Software licenses</li>
                        <li>• Lunch & refreshments</li>
                        <li>• Take-home projects</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}