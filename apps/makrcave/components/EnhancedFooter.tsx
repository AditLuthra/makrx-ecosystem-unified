'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, Phone, Mail, Globe, Twitter, Linkedin, Instagram, 
  Youtube, Github, ArrowRight, Heart, ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      console.log('Newsletter subscription:', newsletterEmail);
      setIsSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerSections = [
    {
      title: 'Ecosystem',
      links: [
        { name: 'MakrCave', href: '/dashboard', description: 'Makerspace management' },
        { name: 'MakrX Store', href: 'https://makrx.store', description: 'Tools & materials' },
        { name: '3D Store', href: 'https://3d.makrx.store', description: 'Custom printing' },
        { name: 'Service Providers', href: '/service-providers', description: 'Freelance makers' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs', description: 'API & guides' },
        { name: 'Learning Hub', href: '/learning-center', description: 'Courses & tutorials' },
        { name: 'Events', href: '/events', description: 'Workshops & meetups' },
        { name: 'Community', href: '/community', description: 'Connect with makers' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/support', description: 'Get assistance' },
        { name: 'Contact Us', href: '/contact', description: 'Get in touch' },
        { name: 'Safety Guidelines', href: '/safety', description: 'Stay safe' },
        { name: 'System Health', href: '/system-health', description: 'Platform status' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about', description: 'Our story' },
        { name: 'Careers', href: '/careers', description: 'Join our team' },
        { name: 'Partners', href: '/partners', description: 'Collaboration' },
        { name: 'Blog', href: '/blog', description: 'Latest updates' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/makrx', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/makrx', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/makrx', color: 'hover:text-purple-400' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@makrx', color: 'hover:text-red-400' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/makrx', color: 'hover:text-blue-400' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ];

  return (
    <footer className="bg-slate-900 border-t border-blue-500/30 text-white transition-colors relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        {/* Top Section with Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Company Information */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:shadow-xl">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className="text-2xl font-bold">
                  <span className="text-white">Makr</span>
                  <span className="text-blue-400">Cave</span>
                </div>
              </Link>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Advanced makerspace management platform connecting creators, innovators, and entrepreneurs 
              through premium makerspaces, cutting-edge tools, and comprehensive learning resources.
            </p>

            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Bangalore, Mumbai, Delhi, Pune & 25+ cities across India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="tel:+918047258000" className="hover:text-blue-400 transition-colors">
                  +91 80472 58000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:hello@makrx.org" className="hover:text-blue-400 transition-colors">
                  hello@makrx.org
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>An initiative by Botness Technologies Pvt Ltd.</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold mb-4 text-blue-400">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="group flex flex-col text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <span className="font-medium group-hover:text-white transition-colors">
                            {link.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {link.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-blue-500/30 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Stay Updated with MakrCave</h3>
            <p className="text-gray-300 mb-6">
              Get the latest maker news, workshop announcements, and exclusive insights delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-blue-500/30 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                required
              />
              <Button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-blue-500/30 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Follow us:</span>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg bg-slate-800 border border-blue-500/30 text-blue-400 ${social.color} transition-all hover:scale-110 hover:shadow-lg`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
              <span>in India</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-500/30 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              <p>© {currentYear} Botness Technologies Pvt Ltd. All rights reserved.</p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-blue-500">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}