"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Clock, CheckCircle,
  Building2, HelpCircle, MessageSquare, ArrowRight
} from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { SEOStructuredData } from "@/components/SEOStructuredData";


interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  contact: string;
  href: string;
}

const ContactCard = ({ icon, title, description, contact, href }: ContactCardProps) => (
  <div className="card-cyberpunk p-8 hover:shadow-neon-lg transition-all group">
    <div className="w-16 h-16 bg-makr-blue/10 border border-makr-blue/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-makr-blue/20 group-hover:shadow-neon transition-all">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gradient-cyberpunk mb-3 font-mono">{title}</h3>
    <p className="text-dark-text-secondary mb-4 leading-relaxed font-mono">{description}</p>
    <a href={href} className="text-makr-blue font-semibold hover:text-makr-yellow transition-colors font-mono">
      {contact}
    </a>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="card-cyberpunk overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left hover:bg-makr-blue/5 transition-colors focus:outline-none focus:ring-2 focus:ring-makr-blue/20"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gradient-cyberpunk pr-8 font-mono">{question}</h3>
          <div className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <svg className="w-5 h-5 text-makr-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 bg-dark-bg-secondary/50">
          <p className="text-dark-text-secondary leading-relaxed font-mono">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
    priority: "normal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const faqs = [
    {
      question: "How do I get access to a makerspace?",
      answer:
        "You can browse available makerspaces on our MakrCave platform, check their schedules, and book time slots directly. Most spaces offer day passes, monthly memberships, or project-based access.",
    },
    {
      question: "What equipment is available in makerspaces?",
      answer:
        "Our makerspaces are equipped with 3D printers, laser cutters, CNC machines, electronics workbenches, wood workshops, and more. Each space has a detailed equipment list available on their profile page.",
    },
    {
      question: "Do you offer training and workshops?",
      answer:
        "Yes! We have comprehensive learning programs including hands-on workshops, online courses, and certification programs for all skill levels from beginner to advanced.",
    },
    {
      question: "How does the 3D printing service work?",
      answer:
        "Upload your design file, get an instant quote, choose materials and quality settings, then place your order. We'll match you with the best provider in our network and handle everything from printing to delivery.",
    },
    {
      question: "What safety measures are in place?",
      answer:
        "All makerspaces follow strict safety protocols including equipment training requirements, protective gear provision, emergency procedures, and certified operator supervision for high-risk equipment.",
    },
    {
      question: "Can I host events or workshops at makerspaces?",
      answer:
        "Absolutely! Many of our partner makerspaces offer event hosting services. Contact the specific makerspace or reach out to our team to discuss your requirements and availability.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <SEOStructuredData type="website" data={{
        name: "MakrX Contact",
        url: "https://makrx.org/contact"
      }} />
      <ThreeBackground />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-br from-makr-blue/20 via-purple-600/20 to-makr-yellow/10 border-b border-makr-blue/30">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-terminal-green/20 border border-terminal-green/30 text-terminal-green text-sm font-medium mb-6 font-mono">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Us
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient-cyberpunk mb-6 font-mono">Get in Touch</h1>
            <p className="text-xl md:text-2xl text-dark-text-secondary mb-8 max-w-3xl mx-auto font-mono">
              Have questions? Need support? Want to partner with us? We're here to help you succeed in your maker journey.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-20 bg-dark-bg-secondary border-t border-makr-blue/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ContactCard
                icon={<Mail className="w-8 h-8 text-makr-blue" />}
                title="General Inquiries"
                description="Questions about our platform, services, or getting started"
                contact="hello@makrx.org"
                href="mailto:hello@makrx.org"
              />
              <ContactCard
                icon={<HelpCircle className="w-8 h-8 text-makr-blue" />}
                title="Technical Support"
                description="Need help with equipment, software, or technical issues"
                contact="support@makrx.org"
                href="mailto:support@makrx.org"
              />
              <ContactCard
                icon={<Building2 className="w-8 h-8 text-makr-blue" />}
                title="Partnership"
                description="Interested in partnering with us or becoming a makerspace host"
                contact="partners@makrx.org"
                href="mailto:partners@makrx.org"
              />
              <ContactCard
                icon={<Phone className="w-8 h-8 text-makr-blue" />}
                title="Call Us"
                description="Speak directly with our team for immediate assistance"
                contact="+91 12345 67890"
                href="tel:+911234567890"
              />
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-dark-bg-primary border-t border-makr-blue/30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-6 font-mono">Send Us a Message</h2>
              <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto font-mono">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>

            {isSubmitted ? (
              <div className="card-cyberpunk p-12 text-center">
                <CheckCircle className="w-16 h-16 text-terminal-green mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gradient-cyberpunk mb-4 font-mono">Message Sent!</h3>
                <p className="text-dark-text-secondary mb-6 font-mono">
                  Thank you for reaching out. We've received your message and will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", category: "", message: "", priority: "normal" });
                  }}
                  className="btn-cyberpunk px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 font-mono"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-cyberpunk p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-dark-text-primary mb-2 font-mono">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-dark-bg-secondary border border-makr-blue/30 rounded-xl text-dark-text-primary placeholder-dark-text-muted focus:ring-2 focus:ring-makr-yellow/50 focus:border-makr-yellow transition-all font-mono"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-dark-text-primary mb-2 font-mono">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-dark-bg-secondary border border-makr-blue/30 rounded-xl text-dark-text-primary placeholder-dark-text-muted focus:ring-2 focus:ring-makr-yellow/50 focus:border-makr-yellow transition-all font-mono"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-dark-text-primary mb-2 font-mono">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-dark-bg-secondary border border-makr-blue/30 rounded-xl text-dark-text-primary focus:ring-2 focus:ring-makr-yellow/50 focus:border-makr-yellow transition-all font-mono"
                    >
                      <option value="">Select a category</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-dark-text-primary mb-2 font-mono">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-dark-bg-secondary border border-makr-blue/30 rounded-xl text-dark-text-primary focus:ring-2 focus:ring-makr-yellow/50 focus:border-makr-yellow transition-all font-mono"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-semibold text-dark-text-primary mb-2 font-mono">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-dark-bg-secondary border border-makr-blue/30 rounded-xl text-dark-text-primary placeholder-dark-text-muted focus:ring-2 focus:ring-makr-yellow/50 focus:border-makr-yellow transition-all font-mono"
                    placeholder="Briefly describe your inquiry"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-semibold text-dark-text-primary mb-2 font-mono">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-dark-bg-secondary border border-makr-blue/30 rounded-xl text-dark-text-primary placeholder-dark-text-muted focus:ring-2 focus:ring-makr-yellow/50 focus:border-makr-yellow transition-all font-mono"
                    placeholder="Provide more details about your request"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-dark-text-muted font-mono">We typically respond within 24 hours.</div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-cyberpunk px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 font-mono disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-dark-bg-secondary border-t border-makr-blue/30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-6 font-mono">Frequently Asked Questions</h2>
              <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto font-mono">
                Find quick answers to common questions about MakrX
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
            <div className="text-center mt-12">
              <p className="text-dark-text-secondary mb-4 font-mono">Can't find what you're looking for?</p>
              <Link href="/help" className="inline-flex items-center text-makr-blue font-semibold hover:text-makr-yellow transition-colors font-mono">
                Visit our Help Center
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-20 bg-dark-bg-primary border-t border-makr-blue/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-6 font-mono">Visit Our Offices</h2>
              <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto font-mono">We have offices across major cities in India</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { city: "Bangalore", address: "HSR Layout, Sector 2\nBangalore, Karnataka 560102", phone: "+91 80 4567 8901", email: "bangalore@makrx.org", hours: "Mon-Sat: 9 AM - 8 PM" },
                { city: "Mumbai", address: "Bandra West, Off SV Road\nMumbai, Maharashtra 400050", phone: "+91 22 4567 8902", email: "mumbai@makrx.org", hours: "Mon-Sat: 9 AM - 8 PM" },
                { city: "Delhi", address: "Connaught Place\nNew Delhi, Delhi 110001", phone: "+91 11 4567 8903", email: "delhi@makrx.org", hours: "Mon-Sat: 9 AM - 8 PM" },
              ].map((office, index) => (
                <div key={index} className="card-cyberpunk p-8">
                  <h3 className="text-2xl font-bold text-gradient-cyberpunk mb-6 font-mono">{office.city}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-makr-blue mr-3 mt-1 flex-shrink-0" />
                      <p className="text-dark-text-secondary whitespace-pre-line font-mono">{office.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-makr-blue mr-3 flex-shrink-0" />
                      <a href={`tel:${office.phone.replace(/\s/g, "")}`} className="text-dark-text-secondary hover:text-makr-blue transition-colors font-mono">
                        {office.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-makr-blue mr-3 flex-shrink-0" />
                      <a href={`mailto:${office.email}`} className="text-dark-text-secondary hover:text-makr-blue transition-colors font-mono">
                        {office.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-makr-blue mr-3 flex-shrink-0" />
                      <p className="text-dark-text-secondary font-mono">{office.hours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
