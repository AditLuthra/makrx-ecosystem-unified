"use client";

import React from "react";
import Link from "next/link";
import {
  Printer,
  Scissors,
  Upload,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Wrench,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Simply drag and drop your STL, OBJ, or SVG files",
  },
  {
    icon: Zap,
    title: "Instant Quotes",
    description: "Get pricing and timeline estimates in seconds",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Vetted providers with ratings and reviews",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most orders completed within 24-48 hours",
  },
];

const services = [
  {
    id: "3d-printing",
    title: "3D Printing",
    description: "Professional 3D printing in various materials",
    icon: Printer,
    materials: ["PLA", "ABS", "PETG", "TPU", "Resin"],
    startingPrice: 150,
    turnaround: "24-48 hours",
    color: "bg-blue-500",
  },
  {
    id: "laser-engraving",
    title: "Laser Engraving",
    description: "Precise laser cutting and engraving services",
    icon: Scissors,
    materials: ["Wood", "Acrylic", "Metal", "Leather"],
    startingPrice: 100,
    turnaround: "12-24 hours",
    color: "bg-purple-500",
  },
];

const stats = [
  { label: "Orders Completed", value: "5,000+" },
  { label: "Happy Customers", value: "2,500+" },
  { label: "Provider Partners", value: "150+" },
  { label: "Average Rating", value: "4.8/5" },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Product Designer",
    content:
      "Amazing service! Got my prototype printed in just 24 hours with perfect quality.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Startup Founder",
    content:
      "The laser engraving quality exceeded my expectations. Will definitely use again.",
    rating: 5,
  },
  {
    name: "Tech Innovations Ltd",
    role: "Company",
    content:
      "Reliable partner for all our rapid prototyping needs. Highly recommended!",
    rating: 5,
  },
];

export default function ServicesHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Wrench className="h-8 w-8 text-makrx-teal" />
                <span className="text-2xl font-bold text-gray-900">
                  MakrX Services
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/3d-printing"
                className="text-gray-600 hover:text-gray-900"
              >
                3D Printing
              </Link>
              <Link
                href="/laser-engraving"
                className="text-gray-600 hover:text-gray-900"
              >
                Laser Engraving
              </Link>
              <Link
                href="/provider-dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Providers
              </Link>
              <Link
                href="/orders"
                className="text-gray-600 hover:text-gray-900"
              >
                My Orders
              </Link>
              <Link href="/3d-printing" className="services-button-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-makrx-teal to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Professional Manufacturing
              <span className="block text-makrx-orange">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Connect with verified providers for 3D printing, laser engraving,
              and custom manufacturing services. Fast, reliable, and affordable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/3d-printing"
                className="bg-white text-makrx-teal px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start 3D Printing Project
              </Link>
              <Link
                href="/laser-engraving"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-makrx-teal transition-colors"
              >
                Start Laser Project
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform makes professional manufacturing accessible to
              everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="services-card text-center">
                <div className="bg-makrx-teal bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-makrx-teal" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Professional manufacturing services at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="services-card hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${service.color} p-4 rounded-lg`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Materials
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {service.materials.slice(0, 3).map((material) => (
                            <span
                              key={material}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {material}
                            </span>
                          ))}
                          {service.materials.length > 3 && (
                            <span className="text-gray-500 text-xs">
                              +{service.materials.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Starting Price
                        </p>
                        <p className="text-lg font-bold text-makrx-teal">
                          ₹{service.startingPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.turnaround}
                      </div>
                      <Link
                        href={`/${service.id}`}
                        className="bg-makrx-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-makrx-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-gray-300">
              Join the growing community of makers and businesses
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-makrx-orange mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from real customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="services-card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-makrx-teal to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Upload your design and get an instant quote from verified providers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/3d-printing"
              className="bg-white text-makrx-teal px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start 3D Print Order
            </Link>
            <Link
              href="/laser-engraving"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-makrx-teal transition-colors"
            >
              Start Laser Order
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-6 w-6 text-makrx-teal" />
                <span className="text-xl font-bold">MakrX Services</span>
              </div>
              <p className="text-gray-400">
                Professional manufacturing services made simple and accessible.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/3d-printing" className="hover:text-white">
                    3D Printing
                  </Link>
                </li>
                <li>
                  <Link href="/laser-engraving" className="hover:text-white">
                    Laser Engraving
                  </Link>
                </li>
                <li>
                  <Link href="/cnc-machining" className="hover:text-white">
                    CNC Machining (Soon)
                  </Link>
                </li>
                <li>
                  <Link href="/injection-molding" className="hover:text-white">
                    Injection Molding (Soon)
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Providers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/provider-dashboard" className="hover:text-white">
                    Provider Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/become-provider" className="hover:text-white">
                    Become a Provider
                  </Link>
                </li>
                <li>
                  <Link href="/provider-resources" className="hover:text-white">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white">
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MakrX Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
