"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Twitter, Linkedin, Instagram, Youtube, Github, ArrowRight, Heart } from 'lucide-react';

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
    { title: 'Ecosystem', links: [
      { name: 'MakrCave', href: '/makrcave', description: 'Premium makerspaces' },
      { name: 'MakrX Store', href: '/store', description: 'Tools & materials' },
      { name: '3D Store', href: '/3d-store', description: 'Custom printing' },
      { name: 'Service Providers', href: '/service-providers', description: 'Freelance makers' },
    ]},
    { title: 'Resources', links: [
      { name: 'Documentation', href: '/docs', description: 'API & guides' },
      { name: 'Learning Hub', href: '/learn', description: 'Courses & tutorials' },
      { name: 'Events', href: '/events', description: 'Workshops & meetups' },
      { name: 'Blog', href: '/blog', description: 'News & insights' },
    ]},
    { title: 'Support', links: [
      { name: 'Help Center', href: '/support', description: 'Get assistance' },
      { name: 'Status', href: '/status', description: 'System status' },
      { name: 'Contact Us', href: '/contact', description: 'Get in touch' },
      { name: 'Safety Guidelines', href: '/safety', description: 'Stay safe' },
    ]},
    { title: 'Company', links: [
      { name: 'About Us', href: '/about', description: 'Our story' },
      { name: 'Careers', href: '/careers', description: 'Join our team' },
      { name: 'Press Kit', href: '/press', description: 'Media resources' },
      { name: 'Partners', href: '/partners', description: 'Collaboration' },
    ]},
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/makrx', color: 'hover:text-makr-blue' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/makrx', color: 'hover:text-makr-blue' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/makrx', color: 'hover:text-makr-yellow' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@makrx', color: 'hover:text-terminal-green' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/makrx', color: 'hover:text-makr-blue' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ];

  return (
    <footer className="bg-dark-bg-secondary border-t border-makr-blue/30 text-dark-text-primary transition-colors relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-makr-blue/5 via-transparent to-makr-yellow/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-makr-blue/10 rounded-full blur-3xl animate-pulse-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-4">
            <div className="mb-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-makr-blue rounded-lg flex items-center justify-center shadow-neon transition-all group-hover:shadow-neon-lg">
                  <span className="text-white font-bold text-sm font-mono">M</span>
                </div>
                <div className="text-2xl font-mono font-bold">
                  <span className="text-dark-text-primary">Makr</span>
                  <span className="text-makr-yellow">X</span>
                </div>
              </Link>
            </div>

            <p className="text-dark-text-secondary mb-6 leading-relaxed font-mono">
              India's largest maker ecosystem connecting creators, innovators, and entrepreneurs through premium makerspaces, cutting-edge tools, and comprehensive learning resources.
            </p>

            <div className="space-y-3 text-sm text-dark-text-muted font-mono">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-makr-blue" />
                <span>Bangalore, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-makr-blue" />
                <a href="tel:+918047258000" className="hover:text-makr-blue">+91 80472 58000</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-makr-blue" />
                <a href="mailto:hello@makrx.org" className="hover:text-makr-blue">hello@makrx.org</a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-makr-blue" />
                <a href="https://makrx.org" target="_blank" rel="noopener noreferrer" className="hover:text-makr-blue">makrx.org</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold mb-4 text-gradient-cyberpunk font-mono">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="group flex flex-col text-dark-text-muted hover:text-makr-blue transition-colors">
                          <span className="font-medium font-mono group-hover:text-makr-yellow transition-colors">{link.name}</span>
                          <span className="text-xs text-dark-text-muted mt-1 font-mono">{link.description}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-makr-blue/30 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4 text-gradient-cyberpunk font-mono">Stay Updated with MakrX</h3>
            <p className="text-dark-text-secondary mb-6 font-mono">Get the latest maker news, workshop announcements, and exclusive insights delivered to your inbox.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter subscription</label>
              <input id="newsletter-email" type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg bg-dark-surface border border-makr-blue/30 text-dark-text-primary placeholder-dark-text-muted focus:border-makr-yellow focus:outline-none focus:shadow-neon font-mono" aria-required="true" aria-describedby="newsletter-description" required />
              <button type="submit" className="btn-cyberpunk px-6 py-3 font-mono font-semibold" aria-label="Subscribe to newsletter">
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </button>
            </form>
            <p id="newsletter-description" className="text-xs text-dark-text-muted mt-3 font-mono">
              No spam, unsubscribe anytime. Read our{' '}
              <Link href="/privacy" className="text-makr-yellow hover:text-makr-blue transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>

        <div className="border-t border-makr-blue/30 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-dark-text-muted text-sm font-mono">Follow us:</span>
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg bg-dark-surface border border-makr-blue/30 text-makr-blue ${social.color} transition-all hover:scale-110 hover:shadow-neon`} aria-label={`Follow us on ${social.name}`}>
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-dark-text-muted font-mono">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-terminal-green fill-current animate-pulse" />
              <span>in India</span>
            </div>
          </div>
        </div>

        <div className="border-t border-makr-blue/30 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-sm text-dark-text-muted font-mono">
              <p>© {currentYear} Botness Technologies Pvt Ltd. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link href={link.href} className="text-dark-text-muted hover:text-makr-blue transition-colors font-mono">{link.name}</Link>
                  {index < legalLinks.length - 1 && <span className="text-makr-blue">|</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="text-sm text-dark-text-muted font-mono">
              <p>GST: 29ABCDE1234F1Z5 | CIN: U72900KA2020PTC123456</p>
            </div>
          </div>
        </div>

        <div className="border-t border-makr-blue/30 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-xs text-dark-text-muted font-mono">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-terminal-green rounded-full animate-pulse"></div><span>ISO 27001 Certified</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-makr-blue rounded-full animate-pulse"></div><span>GDPR Compliant</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-makr-yellow rounded-full animate-pulse"></div><span>SOC 2 Type II</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div><span>99.9% Uptime SLA</span></div>
          </div>
        </div>
      </div>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 p-3 btn-cyberpunk rounded-full shadow-neon hover:shadow-neon-lg transition-all hover:scale-110 z-40" aria-label="Scroll to top">
        <ArrowRight className="w-5 h-5 rotate-[-90deg]" />
      </button>
    </footer>
  );
}

