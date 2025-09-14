'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, Target, Award, Heart, Globe, Zap, Shield, 
  TrendingUp, Building2, ShoppingCart, GraduationCap,
  ArrowRight, Star, CheckCircle, Lightbulb, Rocket,
  MapPin, Calendar, ExternalLink
} from 'lucide-react';

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description }) => (
  <div className="text-center group">
    <div className="w-16 h-16 bg-makrx-blue/10 dark:bg-makrx-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-makrx-blue/20 dark:group-hover:bg-makrx-blue/30 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
  </div>
);

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  image?: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, bio, image }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 bg-makrx-blue rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
        {name.charAt(0)}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
        <p className="text-makrx-blue font-medium">{role}</p>
      </div>
    </div>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{bio}</p>
  </div>
);

interface MilestoneProps {
  year: string;
  title: string;
  description: string;
}

const Milestone: React.FC<MilestoneProps> = ({ year, title, description }) => (
  <div className="flex items-start group">
    <div className="flex-shrink-0 w-20 h-20 bg-makrx-blue rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-6 group-hover:bg-makrx-yellow group-hover:text-makrx-blue transition-colors">
      {year}
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-makrx-blue via-makrx-blue/90 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-makrx-yellow/20 text-makrx-yellow text-sm font-medium mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Our Story
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Empowering the
            <span className="block bg-gradient-to-r from-makrx-yellow to-yellow-300 bg-clip-text text-transparent">
              Maker Revolution
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            We&apos;re on a mission to democratize innovation by making world-class fabrication tools, 
            learning resources, and collaborative spaces accessible to every creator in India.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-makrx-yellow mb-2">50+</div>
              <div className="text-white/80">Makerspaces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-makrx-yellow mb-2">10K+</div>
              <div className="text-white/80">Active Makers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-makrx-yellow mb-2">25+</div>
              <div className="text-white/80">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission & Vision
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Building the future where every idea has the tools and support to become reality
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="bg-makrx-blue/5 dark:bg-makrx-blue/10 rounded-3xl p-8 mb-8">
                <Target className="w-12 h-12 text-makrx-blue mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  To democratize access to digital fabrication tools and knowledge, 
                  enabling creators across India to turn their ideas into reality through 
                  our network of makerspaces, educational resources, and collaborative community.
                </p>
              </div>

              <div className="bg-makrx-yellow/5 dark:bg-makrx-yellow/10 rounded-3xl p-8">
                <Lightbulb className="w-12 h-12 text-makrx-yellow mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  A future where geographical boundaries don&apos;t limit innovation potential. 
                  Where every student, entrepreneur, and creator has access to world-class 
                  fabrication facilities and a supportive community to bring their visions to life.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ValueCard
                icon={<Globe className="w-8 h-8 text-makrx-blue" />}
                title="Global Standards"
                description="World-class equipment and safety protocols in every makerspace"
              />
              <ValueCard
                icon={<Users className="w-8 h-8 text-makrx-blue" />}
                title="Community First"
                description="Building connections between makers, mentors, and industry experts"
              />
              <ValueCard
                icon={<GraduationCap className="w-8 h-8 text-makrx-blue" />}
                title="Education Focus"
                description="Comprehensive learning resources and hands-on workshops"
              />
              <ValueCard
                icon={<Shield className="w-8 h-8 text-makrx-blue" />}
                title="Safety & Quality"
                description="Rigorous safety standards and quality assurance processes"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From a small idea to India&apos;s largest maker ecosystem
            </p>
          </div>

          <div className="space-y-12">
            <Milestone
              year="2019"
              title="The Beginning"
              description="Started with a vision to make fabrication tools accessible to every creator in India. Opened our first makerspace in Bangalore with basic 3D printing and laser cutting facilities."
            />

            <Milestone
              year="2020"
              title="Digital Transformation"
              description="Launched MakrCave digital platform and expanded to 5 cities. Introduced online booking system and virtual workshops during the pandemic, serving 1000+ makers."
            />

            <Milestone
              year="2021"
              title="Ecosystem Growth"
              description="Launched MakrX.Store for tools and components. Reached 15 makerspaces across India and formed partnerships with educational institutions and corporates."
            />

            <Milestone
              year="2022"
              title="Service Excellence"
              description="Introduced 3D.MakrX.Store for custom fabrication services. Achieved 95% customer satisfaction rate and expanded to 25+ cities with specialized equipment."
            />

            <Milestone
              year="2023"
              title="Innovation Hub"
              description="Became India's largest maker network with 50+ locations. Launched advanced programs in IoT, robotics, and sustainable manufacturing technologies."
            />

            <Milestone
              year="2024"
              title="Future Ready"
              description="Leading the maker revolution with AI-powered tools, industry 4.0 integration, and partnerships with global technology companies to shape the future of making."
            />
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the visionaries building the future of manufacturing in India
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamMember
              name="Rajesh Kumar"
              role="Founder & CEO"
              bio="Former IIT professor with 15+ years in manufacturing technology. Passionate about democratizing access to fabrication tools across India."
            />

            <TeamMember
              name="Priya Sharma"
              role="CTO"
              bio="Ex-Google engineer specializing in IoT and automation. Leading our digital transformation and platform development initiatives."
            />

            <TeamMember
              name="Amit Patel"
              role="COO"
              bio="Operations expert with deep understanding of supply chain and logistics. Ensuring seamless experiences across all our makerspaces."
            />

            <TeamMember
              name="Sarah Johnson"
              role="VP of Community"
              bio="Community builder with passion for education and mentorship. Developing programs that connect makers with industry experts."
            />

            <TeamMember
              name="Vikram Singh"
              role="Head of Engineering"
              bio="Mechanical engineer with expertise in advanced manufacturing. Overseeing equipment standards and technical training programs."
            />

            <TeamMember
              name="Meera Gupta"
              role="VP of Partnerships"
              bio="Business development leader building strategic relationships with educational institutions, corporates, and government agencies."
            />
          </div>
        </div>
      </section>

      {/* Impact & Numbers */}
      <section className="py-24 bg-makrx-blue">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Impact
          </h2>
          <p className="text-xl text-white/90 mb-16 max-w-3xl mx-auto">
            Measurable results from our commitment to the maker community
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">50+</div>
              <div className="text-white/80">Makerspaces</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">10K+</div>
              <div className="text-white/80">Active Makers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">100K+</div>
              <div className="text-white/80">Projects Created</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">25+</div>
              <div className="text-white/80">Cities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">500+</div>
              <div className="text-white/80">Workshops</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">95%</div>
              <div className="text-white/80">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">1M+</div>
              <div className="text-white/80">Parts Printed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Join the Revolution
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Be part of India&apos;s fastest-growing maker community. Start creating, learning, 
            and innovating with like-minded individuals across the country.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/makerspaces"
              className="inline-flex items-center gap-2 px-8 py-4 bg-makrx-blue text-white rounded-xl font-semibold hover:bg-makrx-blue/90 transition-all transform hover:scale-105 shadow-lg"
            >
              Find a Makerspace
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-makrx-blue text-makrx-blue dark:text-makrx-blue rounded-xl font-semibold hover:bg-makrx-blue hover:text-white dark:hover:text-white transition-all"
            >
              Partner with Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
