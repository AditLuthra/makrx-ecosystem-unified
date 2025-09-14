import type { Metadata } from 'next';
import { Calendar, ExternalLink, Users, Clock, MapPin } from 'lucide-react';
import SEOStructuredData from '../../components/SEOStructuredData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Events & Workshops - Join the Maker Community | MakrX',
    description:
        'Discover maker workshops, community meetups, and events across India. Connect with fellow creators, learn new skills, and join the maker movement.',
    keywords: [
        'maker events',
        'workshops',
        'community meetups',
        'maker gatherings',
        'learn skills',
        'maker movement india',
    ],
    openGraph: {
        title: 'Events & Workshops - Join the Maker Community',
        description: 'Discover maker workshops, community meetups, and events across India.',
        url: 'https://makrx.org/events',
        type: 'website',
    },
    twitter: {
        title: 'MakrX Events & Workshops',
        description: 'Discover maker workshops, community meetups, and events across India.',
    },
};

export default function EventsPage() {
    return (
        <>
            <SEOStructuredData
                type="website"
                data={{
                    title: 'Events & Workshops',
                    description: 'Maker community events and workshops',
                }}
            />
            <div className="min-h-screen bg-gradient-to-br from-makrx-blue to-purple-900 dark:from-gray-900 dark:to-makrx-blue/20">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-12">
                            <div className="w-20 h-20 bg-makrx-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-10 h-10 text-makrx-yellow" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                MakrX Events
                            </h1>
                            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                                Discover workshops, meetups, and maker gatherings happening across
                                India. Connect with fellow creators, learn new skills, and build
                                amazing projects together.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <Users className="w-8 h-8 text-makrx-yellow mb-4 mx-auto" />
                                <h3 className="text-white font-semibold text-lg mb-2">
                                    Community Meetups
                                </h3>
                                <p className="text-white/80 text-sm">
                                    Join maker meetups in your city and connect with like-minded
                                    creators
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <Clock className="w-8 h-8 text-makrx-yellow mb-4 mx-auto" />
                                <h3 className="text-white font-semibold text-lg mb-2">Workshops</h3>
                                <p className="text-white/80 text-sm">
                                    Learn new skills through hands-on workshops led by industry
                                    experts
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <MapPin className="w-8 h-8 text-makrx-yellow mb-4 mx-auto" />
                                <h3 className="text-white font-semibold text-lg mb-2">
                                    Nationwide
                                </h3>
                                <p className="text-white/80 text-sm">
                                    Events happening across 25+ cities in India
                                </p>
                            </div>
                        </div>

                        {/* Main CTA */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Ready to join the maker community?
                            </h2>
                            <p className="text-white/80 mb-6 text-lg">
                                Explore upcoming events, register for workshops, and connect with
                                makers in your area.
                            </p>
                            <a
                                href="https://makrx.events"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-makrx-yellow text-makrx-blue font-bold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105 text-lg"
                            >
                                <Calendar className="w-6 h-6" />
                                Explore MakrX Events
                                <ExternalLink className="w-6 h-6" />
                            </a>
                        </div>

                        {/* Additional Info */}
                        <div className="text-white/70 text-sm">
                            <p>
                                Visit our dedicated events platform to discover all upcoming
                                activities, register for workshops, and stay updated with the latest
                                maker community news.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
