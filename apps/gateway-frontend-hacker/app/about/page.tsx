'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Users,
  Target,
  Award,
  Heart,
  Globe,
  Zap,
  Shield,
  TrendingUp,
  Building2,
  ShoppingCart,
  GraduationCap,
  ArrowRight,
  Star,
  CheckCircle,
  Lightbulb,
  Rocket,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { ThreeBackground } from '@/components/ThreeBackground';
import { SEOStructuredData } from '@/components/SEOStructuredData';

interface ValueCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <div className="text-center group card-cyberpunk p-6">
      <div className="w-16 h-16 bg-makr-blue/10 border border-makr-blue/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-makr-blue/20 group-hover:shadow-neon transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gradient-cyberpunk mb-4 font-mono">{title}</h3>
      <p className="text-dark-text-secondary leading-relaxed font-mono">{description}</p>
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
}

function TeamMember({ name, role, bio }: TeamMemberProps) {
  return (
    <div className="card-cyberpunk p-8 hover:shadow-neon-lg transition-all">
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-makr-blue rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-neon font-mono">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gradient-cyberpunk font-mono">{name}</h3>
          <p className="text-makr-yellow font-medium font-mono">{role}</p>
        </div>
      </div>
      <p className="text-dark-text-secondary leading-relaxed font-mono">{bio}</p>
    </div>
  );
}

interface MilestoneProps {
  year: string;
  title: string;
  description: string;
}

function Milestone({ year, title, description }: MilestoneProps) {
  return (
    <div className="flex items-start group">
      <div className="flex-shrink-0 w-20 h-20 bg-makr-blue border border-makr-blue/30 rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-6 group-hover:bg-makr-yellow group-hover:text-dark-bg-primary transition-all shadow-neon font-mono">
        {year}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gradient-cyberpunk mb-2 font-mono">{title}</h3>
        <p className="text-dark-text-secondary leading-relaxed font-mono">{description}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen relative z-10">
      <SEOStructuredData
        type="organization"
        data={{
          name: 'MakrX',
          url: 'https://makrx.org',
          sameAs: ['https://github.com/makrx', 'https://www.youtube.com/@makrx'],
        }}
      />
      <ThreeBackground />

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-makr-blue/20 via-purple-900/20 to-makr-yellow/20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300BCD4' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-makr-yellow/20 border border-makr-yellow/30 text-makr-yellow text-sm font-medium mb-6 font-mono">
              <Heart className="w-4 h-4 mr-2" />
              Our Story
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-dark-text-primary mb-6 leading-tight font-mono">
            Empowering the
            <span className="block text-gradient-cyberpunk">Maker Revolution</span>
          </h1>

          <p className="text-xl md:text-2xl text-dark-text-secondary mb-12 max-w-4xl mx-auto leading-relaxed font-mono">
            We're on a mission to democratize innovation by making world-class fabrication tools,
            learning resources, and collaborative spaces accessible to every creator in India.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-makr-yellow mb-2 font-mono">50+</div>
              <div className="text-dark-text-muted font-mono">Makerspaces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-makr-yellow mb-2 font-mono">10K+</div>
              <div className="text-dark-text-muted font-mono">Active Makers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-makr-yellow mb-2 font-mono">25+</div>
              <div className="text-dark-text-muted font-mono">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-dark-bg-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-6 font-mono">
              Our Mission & Vision
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-3xl mx-auto font-mono">
              Building the future where every idea has the tools and support to become reality
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="group card-cyberpunk p-8">
              <div className="w-16 h-16 bg-makr-blue border border-makr-blue/30 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-makr-yellow group-hover:border-makr-yellow/50 group-hover:scale-110 transition-all shadow-neon">
                <Target className="w-8 h-8 text-white group-hover:text-dark-bg-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gradient-cyberpunk mb-6 font-mono">
                Our Mission
              </h3>
              <p className="text-lg text-dark-text-secondary leading-relaxed mb-6 font-mono">
                To democratize innovation by providing accessible, affordable, and comprehensive
                maker resources that empower individuals and communities to transform their ideas
                into reality.
              </p>
              <ul className="space-y-3">
                {[
                  'Make professional fabrication tools accessible to everyone',
                  'Foster collaborative learning and knowledge sharing',
                  'Support entrepreneurship and innovation',
                  'Build sustainable maker communities',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-terminal-green mr-3 mt-1 flex-shrink-0" />
                    <span className="text-dark-text-secondary font-mono">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group card-cyberpunk p-8">
              <div className="w-16 h-16 bg-purple-600 border border-purple-600/30 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-makr-yellow group-hover:border-makr-yellow/50 group-hover:scale-110 transition-all shadow-neon">
                <Rocket className="w-8 h-8 text-white group-hover:text-dark-bg-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gradient-cyberpunk mb-6 font-mono">
                Our Vision
              </h3>
              <p className="text-lg text-dark-text-secondary leading-relaxed mb-6 font-mono">
                To be the leading ecosystem that transforms India into a global innovation
                powerhouse, where every maker has the tools, knowledge, and community support to
                create extraordinary things.
              </p>
              <ul className="space-y-3">
                {[
                  'India as a global hub for hardware innovation',
                  'Every student with access to hands-on learning',
                  'Thriving local manufacturing ecosystem',
                  'Sustainable and circular design practices',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Star className="w-5 h-5 text-makr-yellow mr-3 mt-1 flex-shrink-0" />
                    <span className="text-dark-text-secondary font-mono">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-6 font-mono">
              Our Values
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-3xl mx-auto font-mono">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <ValueCard
              icon={<Lightbulb className="w-8 h-8 text-makr-blue" />}
              title="Innovation"
              description="We constantly push boundaries and embrace new technologies to create better solutions for makers."
            />
            <ValueCard
              icon={<Users className="w-8 h-8 text-makr-blue" />}
              title="Community"
              description="We believe in the power of collaboration and building supportive communities that help everyone grow."
            />
            <ValueCard
              icon={<Shield className="w-8 h-8 text-makr-blue" />}
              title="Quality"
              description="We maintain the highest standards in everything we do, from equipment to education to customer service."
            />
            <ValueCard
              icon={<Globe className="w-8 h-8 text-makr-blue" />}
              title="Accessibility"
              description="We work to make maker resources available to everyone, regardless of background or economic status."
            />
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-24 bg-dark-bg-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-6 font-mono">
              Our Journey
            </h2>
            <p className="text-xl text-dark-text-secondary max-w-3xl mx-auto font-mono">
              From a simple idea to India's largest maker ecosystem
            </p>
          </div>

          <div className="space-y-16">
            <Milestone
              year="2020"
              title="The Beginning"
              description="Started with a vision to make professional fabrication tools accessible to students and entrepreneurs. Opened our first makerspace in Bangalore with just 5 3D printers and a dream."
            />
            <Milestone
              year="2021"
              title="Rapid Growth"
              description="Expanded to 10 cities across India, launched MakrX Store for tools and materials, and introduced our learning platform with hands-on workshops and courses."
            />
            <Milestone
              year="2022"
              title="Community Building"
              description="Reached 5,000 active makers, launched the MakrCave network, and started our mentorship program connecting experienced makers with newcomers."
            />
            <Milestone
              year="2023"
              title="Innovation Focus"
              description="Introduced advanced manufacturing services, AI-powered project recommendations, and partnerships with leading educational institutions across India."
            />
            <Milestone
              year="2024"
              title="Scale & Impact"
              description="50+ makerspaces, 10,000+ makers, and expanding internationally. Proud to be India's leading maker ecosystem with global recognition."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-makr-blue/30 to-purple-700/30 border-t border-makr-blue/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-cyberpunk mb-6 font-mono">
            Join the Maker Revolution
          </h2>
          <p className="text-xl text-dark-text-secondary mb-12 leading-relaxed font-mono">
            Be part of India's largest maker community and transform your ideas into reality.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="https://auth.makrx.org/register"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyberpunk px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 font-mono"
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-makr-blue/30 text-makr-blue hover:bg-makr-blue/10 transition-all duration-300 font-mono"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
