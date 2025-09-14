'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Car, Train, Plane, Wifi, Coffee, Utensils, Accessibility } from 'lucide-react';

interface VenueContent {
  title: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  description: string;
  images?: string[];
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  mapEmbedUrl?: string;
  transportation?: {
    parking?: string;
    publicTransport?: string;
    airport?: string;
    directions?: string;
  };
  amenities?: Array<{
    name: string;
    icon: string;
    description?: string;
  }>;
  rooms?: Array<{
    name: string;
    capacity: number;
    description: string;
    features?: string[];
  }>;
}

interface VenueProps {
  id: string;
  content: VenueContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function Venue({ content, variant = 'default', theme }: VenueProps) {
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  const getTransportIcon = (type: string) => {
    const icons = {
      parking: Car,
      'public transport': Train,
      airport: Plane
    };
    return icons[type as keyof typeof icons] || MapPin;
  };

  const formatAddress = () => {
    const { street, city, state, country, postalCode } = content.address;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {content.title}
          </h2>
          <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
            {content.name}
          </h3>
          <p className="text-lg text-muted-foreground">
            {formatAddress()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Info */}
          <div className="space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About the Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {content.description}
                </p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            {content.contact && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={`tel:${content.contact.phone}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {content.contact.phone}
                      </a>
                    </div>
                  )}
                  {content.contact.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={content.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      Open in Maps
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transportation */}
            {content.transportation && (
              <Card>
                <CardHeader>
                  <CardTitle>Getting There</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.transportation.parking && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Parking</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-7">
                        {content.transportation.parking}
                      </p>
                    </div>
                  )}
                  {content.transportation.publicTransport && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Train className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Public Transport</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-7">
                        {content.transportation.publicTransport}
                      </p>
                    </div>
                  )}
                  {content.transportation.airport && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Plane className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Nearest Airport</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-7">
                        {content.transportation.airport}
                      </p>
                    </div>
                  )}
                  {content.transportation.directions && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        {content.transportation.directions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {content.amenities && content.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {content.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-lg">{amenity.icon}</span>
                        <span className="text-sm font-medium">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Visual */}
          <div className="space-y-8">
            {/* Images */}
            {content.images && content.images.length > 0 && (
              <div className="space-y-4">
                <img
                  src={content.images[0]}
                  alt={`${content.name} - Main`}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {content.images.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {content.images.slice(1, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${content.name} - ${index + 2}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Map */}
            {content.mapEmbedUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <iframe
                  src={content.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${content.name}`}
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Interactive map coming soon</p>
                </div>
              </div>
            )}

            {/* Rooms */}
            {content.rooms && content.rooms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Spaces</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.rooms.map((room, index) => (
                    <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{room.name}</h4>
                        <Badge variant="outline">
                          Capacity: {room.capacity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {room.description}
                      </p>
                      {room.features && room.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {room.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}