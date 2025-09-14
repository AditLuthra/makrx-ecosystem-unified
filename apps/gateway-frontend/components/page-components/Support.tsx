'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    HelpCircle,
    Search,
    MessageCircle,
    Mail,
    Phone,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Send,
    FileText,
    Video,
    Users,
    Zap,
    Clock,
    CheckCircle,
} from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
    category: string;
}

interface SupportArticle {
    title: string;
    description: string;
    category: string;
    href: string;
    type: 'article' | 'video' | 'guide';
}

export default function Support() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general',
    });

    const faqs: FAQ[] = [
        {
            question: 'How do I get started with MakrX?',
            answer: "Getting started is easy! First, create your account at auth.makrx.org. Choose your role (Maker, Makerspace Owner, or Service Provider) and you'll be guided through the appropriate onboarding process. Check out our Quick Start Guide for detailed instructions.",
            category: 'Getting Started',
        },
        {
            question: "What's included in a MakrCave subscription?",
            answer: 'MakrCave subscriptions include equipment booking, inventory management, member billing, project tracking, and analytics. Pricing varies by makerspace size and features needed. Contact our sales team for a custom quote.',
            category: 'Billing',
        },
        {
            question: 'How do I place a custom manufacturing order?',
            answer: 'Upload your design files to our Store platform and get an instant quote. You can choose from 3D printing, CNC machining, laser cutting, and PCB assembly services. Our global provider network ensures competitive pricing and fast delivery.',
            category: 'Orders',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards, UPI, net banking, and wire transfers. Enterprise customers can also request invoice-based billing with payment terms. All transactions are secured with bank-level encryption.',
            category: 'Billing',
        },
        {
            question: 'How do I book equipment at a makerspace?',
            answer: "Browse available makerspaces in your area, view their equipment and availability, then book time slots directly through our platform. You'll receive confirmation and access instructions via email and SMS.",
            category: 'Bookings',
        },
        {
            question: 'Can I integrate MakrX with my existing systems?',
            answer: 'Yes! We offer REST APIs and webhooks for integration with existing tools. Enterprise customers also get access to our dedicated integration support team. Check our developer documentation for detailed guides.',
            category: 'Technical',
        },
    ];

    const supportArticles: SupportArticle[] = [
        {
            title: 'Getting Started with MakrCave',
            description: 'Complete guide to setting up your makerspace on our platform',
            category: 'Makerspace Management',
            href: '#',
            type: 'guide',
        },
        {
            title: 'Order Management Tutorial',
            description: 'Learn how to track and manage your custom manufacturing orders',
            category: 'Store',
            href: '#',
            type: 'video',
        },
        {
            title: 'API Integration Guide',
            description: 'Technical documentation for integrating with MakrX APIs',
            category: 'Developer',
            href: '#',
            type: 'article',
        },
        {
            title: 'Equipment Booking Best Practices',
            description: 'Tips for optimizing equipment scheduling and usage',
            category: 'Operations',
            href: '#',
            type: 'guide',
        },
        {
            title: 'Billing and Invoicing',
            description: 'Understanding pricing, billing cycles, and payment options',
            category: 'Billing',
            href: '#',
            type: 'article',
        },
        {
            title: 'Safety Guidelines',
            description: 'Important safety protocols for makerspace operations',
            category: 'Safety',
            href: '#',
            type: 'guide',
        },
    ];

    const contactOptions = [
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: 'Live Chat',
            description: 'Get instant help from our support team',
            action: 'Start Chat',
            available: '24/7',
        },
        {
            icon: <Mail className="w-8 h-8" />,
            title: 'Email Support',
            description: 'Send us a detailed message about your issue',
            action: 'Send Email',
            available: 'support@makrx.org',
        },
        {
            icon: <Phone className="w-8 h-8" />,
            title: 'Phone Support',
            description: 'Talk directly with our technical experts',
            action: 'Call Now',
            available: '+91-80-4567-8900',
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Community Forum',
            description: 'Connect with other makers and get peer support',
            action: 'Join Discussion',
            available: 'community.makrx.org',
        },
    ];

    const filteredFAQs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const filteredArticles = supportArticles.filter(
        (article) =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Contact form submitted:', contactForm);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="w-5 h-5" />;
            case 'guide':
                return <FileText className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-makrx-blue to-purple-900 py-20">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        How Can We Help?
                    </h1>
                    <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                        Find answers, get support, and learn how to make the most of MakrX platforms
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for help articles, FAQs, tutorials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-makrx-yellow bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </section>

            {/* Contact Options */}
            <section className="py-20 -mt-12 relative z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactOptions.map((option, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow"
                            >
                                <div className="w-16 h-16 bg-makrx-blue/10 dark:bg-makrx-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <div className="text-makrx-blue dark:text-makrx-yellow">
                                        {option.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {option.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                    {option.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    {option.available}
                                </p>
                                <button className="w-full px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    {option.action}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Articles */}
            <section className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
                        Popular Help Articles
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.slice(0, 6).map((article, index) => (
                            <Link
                                key={index}
                                href={article.href}
                                className="group p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-makrx-blue dark:text-makrx-yellow">
                                            {getTypeIcon(article.type)}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {article.type}
                                        </span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-makrx-blue dark:group-hover:text-makrx-yellow transition-colors" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-makrx-blue dark:group-hover:text-makrx-yellow transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                    {article.description}
                                </p>
                                <span className="text-xs text-makrx-blue dark:text-makrx-yellow font-medium">
                                    {article.category}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4">
                        {filteredFAQs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedFAQ(expandedFAQ === index ? null : index)
                                    }
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            {faq.question}
                                        </h3>
                                        <span className="text-sm text-makrx-blue dark:text-makrx-yellow">
                                            {faq.category}
                                        </span>
                                    </div>
                                    {expandedFAQ === index ? (
                                        <ChevronDown className="w-6 h-6 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="w-6 h-6 text-gray-500" />
                                    )}
                                </button>

                                {expandedFAQ === index && (
                                    <div className="px-6 pb-6">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Still Need Help?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Send us a message and we'll get back to you within 24 hours
                        </p>
                    </div>

                    <form
                        onSubmit={handleContactSubmit}
                        className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8"
                    >
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.name}
                                    onChange={(e) =>
                                        setContactForm({ ...contactForm, name: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={contactForm.email}
                                    onChange={(e) =>
                                        setContactForm({ ...contactForm, email: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={contactForm.category}
                                    onChange={(e) =>
                                        setContactForm({ ...contactForm, category: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                >
                                    <option value="general">General Support</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="billing">Billing Question</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="partnership">Partnership</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.subject}
                                    onChange={(e) =>
                                        setContactForm({ ...contactForm, subject: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Message *
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={contactForm.message}
                                onChange={(e) =>
                                    setContactForm({ ...contactForm, message: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-makrx-blue bg-white dark:bg-gray-600 text-gray-900 dark:text-white resize-none"
                                placeholder="Please describe your issue or question in detail..."
                            />
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-makrx-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}
