'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { CalendarDays, MapPin, Plus, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel data
  const heroSlides = [
    {
      id: 'main',
      title: 'Discover & Create',
      subtitle: 'Maker Events Worldwide',
      description:
        'Join the global maker movement. Find workshops, competitions, and exhibitions near you or create your own technical fest.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920',
      type: 'main',
    },
    {
      id: '1',
      title: 'Maker Fest 2024',
      subtitle: 'The Biggest Event of the Year',
      description:
        'Join us for the biggest maker event of the year with workshops, competitions, and networking!',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920',
      type: 'event',
      location: 'San Francisco, CA',
      date: '2024-09-15',
    },
    {
      id: '2',
      title: 'Global Robotics Championship',
      subtitle: 'Compete with the Best',
      description:
        'Show off your robotics skills in this international competition with amazing prizes.',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920',
      type: 'competition',
      location: 'Tokyo, Japan',
      date: '2024-10-01',
    },
    {
      id: '3',
      title: '3D Printing Workshop Series',
      subtitle: 'Master Advanced Techniques',
      description: 'Learn cutting-edge 3D printing techniques from industry experts.',
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1920',
      type: 'workshop',
      location: 'Berlin, Germany',
      date: '2024-09-25',
    },
  ];

  // Use static data for featured events
  const featuredEvents = [
    {
      id: '1',
      slug: 'maker-fest-2024',
      title: 'Maker Fest 2024',
      shortDescription: 'Join us for the biggest maker event of the year!',
      location: 'San Francisco, CA',
      startDate: '2024-09-15',
      featuredImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
    },
    {
      id: '2',
      slug: 'arduino-workshop',
      title: 'Arduino Workshop',
      shortDescription: 'Learn Arduino programming from scratch',
      location: 'New York, NY',
      startDate: '2024-09-20',
      featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    },
    {
      id: '3',
      slug: 'robotics-championship',
      title: 'Global Robotics Championship',
      shortDescription: 'Compete with robotics enthusiasts worldwide',
      location: 'Tokyo, Japan',
      startDate: '2024-10-01',
      featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    },
    {
      id: '4',
      slug: '3d-printing-workshop',
      title: '3D Printing Workshop',
      shortDescription: 'Master advanced 3D printing techniques',
      location: 'Berlin, Germany',
      startDate: '2024-09-25',
      featuredImage: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400',
    },
  ];

  const stats = {
    activeEvents: 150,
    globalCities: 45,
    registeredMakers: 2340,
    totalWorkshops: 890,
  };

  // No auto-advance - manual navigation only

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleEventClick = (slug: string) => {
    // In a real app, this would navigate to the event page
    // Navigate to event
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-secondary text-white relative overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{ backgroundImage: `url(${heroSlides[currentSlide]?.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] py-8 sm:py-12">
          <div className="text-center w-full opacity-100 transition-all duration-800 ease-in-out">
            {/* Content container with fixed heights to prevent layout shifts */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Badge area - fixed height */}
              <div className="h-10 flex items-center justify-center">
                {heroSlides[currentSlide]?.type !== 'main' && (
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold transition-all duration-800 ease-in-out ${
                      heroSlides[currentSlide]?.type === 'event'
                        ? 'bg-blue-500/20 border border-blue-400 text-blue-200'
                        : heroSlides[currentSlide]?.type === 'competition'
                          ? 'bg-red-500/20 border border-red-400 text-red-200'
                          : 'bg-green-500/20 border border-green-400 text-green-200'
                    }`}
                  >
                    {heroSlides[currentSlide]?.type === 'event'
                      ? 'Featured Event'
                      : heroSlides[currentSlide]?.type === 'competition'
                        ? 'Competition'
                        : 'Workshop'}
                  </span>
                )}
              </div>

              {/* Title area - responsive height */}
              <div className="min-h-16 sm:min-h-20 lg:min-h-24 flex items-center justify-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center transition-all duration-800 ease-in-out leading-tight">
                  <span className="block">
                    {heroSlides[currentSlide]?.title || 'Discover & Create'}
                  </span>
                  <span className="block text-yellow-300 mt-1">
                    {heroSlides[currentSlide]?.subtitle || 'Maker Events Worldwide'}
                  </span>
                </h1>
              </div>

              {/* Description area - responsive height */}
              <div className="min-h-8 sm:min-h-12 flex items-center justify-center">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto text-center transition-all duration-800 ease-in-out px-4">
                  {heroSlides[currentSlide]?.description ||
                    'Join the global maker movement. Find workshops, competitions, and exhibitions near you or create your own technical fest.'}
                </p>
              </div>

              {/* Event details area - responsive height */}
              <div className="min-h-8 sm:min-h-10 flex items-center justify-center">
                {heroSlides[currentSlide]?.type !== 'main' &&
                  heroSlides[currentSlide]?.location &&
                  heroSlides[currentSlide]?.date && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-gray-300 text-sm transition-all duration-800 ease-in-out">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {heroSlides[currentSlide]?.location}
                      </div>
                      <div className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {heroSlides[currentSlide]?.date &&
                          new Date(heroSlides[currentSlide].date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Buttons area - responsive height */}
            <div className="min-h-12 sm:min-h-14 flex items-center justify-center mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center items-center transition-all duration-800 ease-in-out w-full px-4 max-w-md sm:max-w-none">
                {heroSlides[currentSlide]?.type === 'main' ? (
                  // Main slide buttons
                  <>
                    <Button
                      size="lg"
                      className="bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shadow-lg border border-white/20 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-medium w-full sm:w-auto"
                      onClick={() =>
                        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
                      }
                    >
                      <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Find Events
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 text-gray-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-500 font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-yellow-300/50 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base w-full sm:w-auto"
                      onClick={() => (window.location.href = '/api/auth/login')}
                    >
                      <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Create Event
                    </Button>
                  </>
                ) : (
                  // Event-specific slide buttons
                  <>
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => {
                        const slug =
                          heroSlides[currentSlide]?.id === '1'
                            ? 'maker-fest-2024'
                            : heroSlides[currentSlide]?.id === '2'
                              ? 'robotics-championship'
                              : '3d-printing-workshop';
                        // Navigate to event info
                      }}
                    >
                      <CalendarDays className="mr-2 h-5 w-5" />
                      Learn More
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-green-300"
                      onClick={() => {
                        const slug =
                          heroSlides[currentSlide]?.id === '1'
                            ? 'maker-fest-2024'
                            : heroSlides[currentSlide]?.id === '2'
                              ? 'robotics-championship'
                              : '3d-printing-workshop';
                        // Navigate to registration
                        // In a real app, this would redirect to the registration page
                        window.location.href = '/api/auth/login'; // For now, redirect to login
                      }}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Register Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls - Smaller and less intrusive on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-1 sm:left-3 lg:left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/5 hover:bg-white/15 text-white rounded-full p-1 sm:p-2 lg:p-3 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 lg:hover:scale-105 touch-manipulation"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 sm:right-3 lg:right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/5 hover:bg-white/15 text-white rounded-full p-1 sm:p-2 lg:p-3 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 lg:hover:scale-105 touch-manipulation"
          onClick={nextSlide}
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </Button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the Global Maker Movement
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with makers worldwide and be part of something amazing
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center group cursor-pointer">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border border-gray-100">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stats.activeEvents}+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                  Active Events
                </div>
              </div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border border-gray-100">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stats.globalCities}+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                  Global Cities
                </div>
              </div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border border-gray-100">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stats.registeredMakers.toLocaleString()}+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                  Registered Makers
                </div>
              </div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border border-gray-100">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stats.totalWorkshops}+
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                  Total Workshops
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              Featured Events
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Discover Amazing
              <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Maker Events
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of makers, creators, and innovators at events happening around the
              world
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {featuredEvents.map((event, index) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer group bg-white border border-gray-100 rounded-xl sm:rounded-2xl"
                onClick={() => handleEventClick(event.slug)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.featuredImage}
                    alt={event.title}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/95 backdrop-blur-sm text-primary text-xs sm:text-sm font-semibold rounded-full shadow-lg border border-primary/20">
                      ⭐ Featured
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 leading-relaxed">
                    {event.shortDescription}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      View Details & Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
