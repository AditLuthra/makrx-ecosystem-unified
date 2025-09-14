import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Car, Train, Plane, Utensils, Wifi, Accessibility } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MicrositeVenuePageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeVenuePage({ params }: MicrositeVenuePageProps) {
  const { micrositeSlug } = await params;

  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: 'MakerFest 2024',
  };

  const venue = {
    name: 'Moscone Center',
    address: '747 Howard St, San Francisco, CA 94103',
    description:
      "The Moscone Center is San Francisco's premier convention and exhibition facility, located in the heart of the South of Market district. With state-of-the-art facilities and flexible spaces, it's the perfect venue for MakerFest 2024.",

    facilities: [
      {
        icon: Wifi,
        name: 'High-Speed WiFi',
        description: 'Complimentary WiFi throughout the venue',
      },
      {
        icon: Utensils,
        name: 'Food & Beverage',
        description: 'Multiple dining options and food trucks on-site',
      },
      {
        icon: Accessibility,
        name: 'Accessibility',
        description: 'Full ADA compliance and accessibility features',
      },
      {
        icon: Car,
        name: 'Parking',
        description: 'On-site parking garage with electric vehicle charging',
      },
    ],

    floorPlan: {
      mainHall: 'Exhibition floor with 100+ maker booths and sponsor displays',
      workshopRooms: '12 dedicated workshop rooms with complete tool setups',
      competitionArea: 'Main arena for robotics and hardware competitions',
      networkingSpace: 'Open areas for attendee networking and demonstrations',
      keynoteTheater: '500-seat theater for opening ceremonies and keynotes',
    },

    transportation: {
      bart: {
        name: 'BART (Bay Area Rapid Transit)',
        directions: 'Montgomery St or Powell St stations, then 10-minute walk or take Muni',
        icon: Train,
      },
      muni: {
        name: 'San Francisco Muni',
        directions: 'Multiple bus lines serve the area: 5, 6, 7, 9, 14, 19, 27, 30, 45',
        icon: Train,
      },
      driving: {
        name: 'Driving',
        directions:
          'From 101: Take I-80 W toward Bay Bridge, exit at 4th St. From 280: Take US-101 N, exit at 9th St',
        icon: Car,
      },
      airport: {
        name: 'San Francisco International Airport (SFO)',
        directions: '25 minutes by car, 45 minutes by BART to Montgomery/Powell + Muni',
        icon: Plane,
      },
    },

    nearbyHotels: [
      {
        name: 'Hotel Zephyr',
        distance: '0.8 miles',
        priceRange: '$200-300/night',
        website: 'https://hotelzephyr.com',
      },
      {
        name: 'The St. Regis San Francisco',
        distance: '0.3 miles',
        priceRange: '$400-600/night',
        website: 'https://stregissanfrancisco.com',
      },
      {
        name: "Hotel Zoe Fisherman's Wharf",
        distance: '1.2 miles',
        priceRange: '$150-250/night',
        website: 'https://hotelzoefw.com',
      },
    ],

    nearbyAttractions: [
      { name: 'Ferry Building Marketplace', distance: '0.5 miles', type: 'Food & Shopping' },
      { name: 'San Francisco Museum of Modern Art', distance: '0.3 miles', type: 'Museum' },
      { name: 'Union Square', distance: '0.8 miles', type: 'Shopping & Dining' },
      { name: 'Embarcadero Waterfront', distance: '0.6 miles', type: 'Recreation' },
    ],
  };

  if (!microsite) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Microsite Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={`/m/${micrositeSlug}`}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {microsite.title}
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link
                href={`/m/${micrositeSlug}/events`}
                className="text-gray-700 hover:text-primary"
              >
                Events
              </Link>
              <Link
                href={`/m/${micrositeSlug}/schedule`}
                className="text-gray-700 hover:text-primary"
              >
                Schedule
              </Link>
              <Link href={`/m/${micrositeSlug}/venue`} className="text-primary font-medium">
                Venue
              </Link>
              <Link href={`/m/${micrositeSlug}/faq`} className="text-gray-700 hover:text-primary">
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Venue Information</h1>
          <p className="text-xl text-gray-600">
            Everything you need to know about getting to and navigating {microsite.title}
          </p>
        </div>

        {/* Venue Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{venue.name}</CardTitle>
            <p className="text-gray-600 text-lg">{venue.address}</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">{venue.description}</p>

            {/* Embedded Map Placeholder */}
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-6">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive Map</p>
                <p className="text-sm text-gray-400">Google Maps Integration</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">Get Directions</Button>
              <Button variant="outline" className="flex-1">
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Venue Facilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Venue Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venue.facilities.map((facility, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <facility.icon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">{facility.name}</h3>
                    <p className="text-sm text-gray-600">{facility.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Floor Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Floor Plan & Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(venue.floorPlan).map(([space, description]) => (
                <div key={space} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 capitalize">
                    {space.replace(/([A-Z])/g, ' $1')}
                  </h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transportation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting There</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(venue.transportation).map(([key, transport]) => (
                <div key={key} className="flex items-start space-x-3">
                  <transport.icon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">{transport.name}</h3>
                    <p className="text-sm text-gray-600">{transport.directions}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nearby Hotels */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommended Hotels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {venue.nearbyHotels.map((hotel, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{hotel.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{hotel.distance} from venue</p>
                  <p className="text-sm text-gray-600 mb-3">{hotel.priceRange}</p>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                      View Hotel
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nearby Attractions */}
        <Card>
          <CardHeader>
            <CardTitle>Nearby Attractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venue.nearbyAttractions.map((attraction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{attraction.name}</h3>
                    <p className="text-sm text-gray-600">{attraction.type}</p>
                  </div>
                  <span className="text-sm text-gray-500">{attraction.distance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
