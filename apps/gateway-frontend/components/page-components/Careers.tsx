'use client';

import React from 'react';
import Link from 'next/link';
import {
    MapPin,
    Clock,
    DollarSign,
    Users,
    Heart,
    Zap,
    Code,
    Coffee,
    Star,
    Globe,
} from 'lucide-react';

export default function Careers() {
    const openRoles = [
        {
            id: 1,
            title: 'Full Stack Developer',
            department: 'Engineering',
            location: 'Bangalore',
            type: 'Full-time',
            description:
                'Join our engineering team to build the next generation of maker tools and platforms.',
        },
        {
            id: 2,
            title: 'UX/UI Designer',
            department: 'Design',
            location: 'Remote',
            type: 'Full-time',
            description:
                'Design intuitive interfaces for makers, creators, and makerspace operators across our platform.',
        },
        {
            id: 3,
            title: 'Community Manager',
            department: 'Marketing',
            location: 'Mumbai',
            type: 'Full-time',
            description:
                'Build and nurture our growing community of makers, educators, and innovation enthusiasts.',
        },
        {
            id: 4,
            title: 'DevOps Engineer',
            department: 'Engineering',
            location: 'Bangalore',
            type: 'Full-time',
            description:
                'Scale our infrastructure to support millions of makers and thousands of makerspaces worldwide.',
        },
    ];

    const benefits = [
        {
            icon: <Heart className="w-8 h-8" />,
            title: 'Health & Wellness',
            description:
                'Comprehensive health insurance, wellness programs, and mental health support.',
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Learning & Growth',
            description:
                'Conference budget, online courses, and dedicated time for skill development.',
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Team Culture',
            description: 'Collaborative environment with regular team events and celebrations.',
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: 'Remote Flexibility',
            description:
                'Hybrid work options with modern office spaces and home office allowances.',
        },
        {
            icon: <Coffee className="w-8 h-8" />,
            title: 'Work-Life Balance',
            description: 'Flexible hours, unlimited PTO, and emphasis on sustainable productivity.',
        },
        {
            icon: <Star className="w-8 h-8" />,
            title: 'Equity & Impact',
            description:
                'Stock options, competitive salary, and the chance to revolutionize digital manufacturing.',
        },
    ];

    const values = [
        {
            title: 'Innovation First',
            description:
                'We push boundaries and think differently about manufacturing and maker tools.',
        },
        {
            title: 'Community Driven',
            description:
                'Everything we build serves our community of makers, educators, and creators.',
        },
        {
            title: 'Quality Matters',
            description:
                'We take pride in delivering excellent products and exceptional experiences.',
        },
        {
            title: 'Inclusive Growth',
            description:
                'We believe in diversity, equity, and creating opportunities for everyone.',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-makrx-blue to-purple-900 py-20">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Build the Future of Making
                    </h1>
                    <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                        Join our team of passionate builders, designers, and innovators as we create
                        the platform that empowers millions of makers worldwide.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#open-roles"
                            className="px-8 py-4 bg-makrx-yellow text-makrx-blue font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                        >
                            View Open Positions
                        </a>
                        <a
                            href="#culture"
                            className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-makrx-blue transition-colors"
                        >
                            Learn About Our Culture
                        </a>
                    </div>
                </div>
            </section>

            {/* Company Values */}
            <section id="culture" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            What drives us every day and shapes how we work together
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl"
                            >
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Join MakrX?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Competitive benefits and a culture that supports your growth
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                            >
                                <div className="w-16 h-16 bg-makrx-blue/10 dark:bg-makrx-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <div className="text-makrx-blue dark:text-makrx-yellow">
                                        {benefit.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Roles */}
            <section id="open-roles" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Open Positions
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Find your next opportunity to make an impact
                        </p>
                    </div>

                    <div className="space-y-6">
                        {openRoles.map((role) => (
                            <div
                                key={role.id}
                                className="p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-makrx-blue dark:hover:border-makrx-yellow transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <div className="flex flex-wrap items-center gap-4 mb-3">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {role.title}
                                            </h3>
                                            <span className="px-3 py-1 bg-makrx-blue/10 dark:bg-makrx-yellow/10 text-makrx-blue dark:text-makrx-yellow rounded-full text-sm font-medium">
                                                {role.department}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6 mb-4 text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {role.location}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {role.type}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300">
                                            {role.description}
                                        </p>
                                    </div>

                                    <div className="md:ml-8">
                                        <Link
                                            href="/contact"
                                            className="inline-flex items-center px-6 py-3 bg-makrx-blue text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Apply Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Don't see a role that fits? We're always looking for exceptional talent.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center px-6 py-3 border-2 border-makrx-blue text-makrx-blue dark:text-makrx-yellow dark:border-makrx-yellow rounded-xl font-medium hover:bg-makrx-blue hover:text-white dark:hover:bg-makrx-yellow dark:hover:text-makrx-blue transition-colors"
                        >
                            Send Us Your Resume
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-makrx-blue dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Ready to Shape the Future?
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Join a team that's building the infrastructure for the next generation of
                        makers and creators.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-makrx-yellow text-makrx-blue font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                        >
                            Get in Touch
                        </Link>
                        <Link
                            href="/about"
                            className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-makrx-blue transition-colors"
                        >
                            Learn More About Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
