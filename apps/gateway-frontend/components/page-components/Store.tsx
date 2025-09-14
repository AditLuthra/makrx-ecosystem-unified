'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ShoppingCart,
  Package,
  Wrench,
  Cpu,
  ArrowRight,
  Star,
  Shield,
  Truck,
} from 'lucide-react';

interface CategoryCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, description, icon }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 group">
    <div className="w-16 h-16 bg-makrx-blue/10 dark:bg-makrx-yellow/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-makrx-blue/20 dark:group-hover:bg-makrx-yellow/20 transition-colors">
      <div className="text-makrx-blue dark:text-makrx-yellow">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{name}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
  </div>
);

export default function Store() {
  const categories = [
    {
      name: '3D Printers & Filaments',
      description:
        'Professional 3D printers, high-quality filaments, and printing accessories from trusted brands',
      icon: <Package className="w-8 h-8" />,
    },
    {
      name: 'Electronics & Components',
      description:
        'Arduino, Raspberry Pi, sensors, and electronic components for IoT and robotics projects',
      icon: <Cpu className="w-8 h-8" />,
    },
    {
      name: 'Hand Tools & Machines',
      description:
        'Precision tools, power tools, and fabrication equipment for professional makers',
      icon: <Wrench className="w-8 h-8" />,
    },
    {
      name: 'Materials & Supplies',
      description: 'Wood, metals, plastics, adhesives, and other materials for all your projects',
      icon: <ShoppingCart className="w-8 h-8" />,
    },
  ];

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Fast Delivery',
      description: 'Same-day delivery in major cities',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Quality Assured',
      description: 'Genuine products from verified suppliers',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Expert Support',
      description: 'Technical assistance from our team',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-makrx-blue via-makrx-blue/90 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-makrx-yellow/20 text-makrx-yellow text-sm font-medium mb-6">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shop Premium Tools
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            MakrX
            <span className="block bg-gradient-to-r from-makrx-yellow to-yellow-300 bg-clip-text text-transparent">
              Store
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            Your one-stop shop for high-quality tools, components, and materials. From 3D printers
            to electronics, we have everything makers need.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="https://makrx.store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-makrx-yellow text-makrx-blue rounded-xl font-bold text-lg hover:bg-makrx-yellow/90 transition-all transform hover:scale-105 shadow-lg"
            >
              Visit MakrX.Store
              <ExternalLink className="w-5 h-5" />
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all"
            >
              Bulk Orders
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-makrx-blue/10 dark:bg-makrx-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-makrx-blue dark:text-makrx-yellow">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Find exactly what you need from our curated selection of maker tools and materials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                name={category.name}
                description={category.description}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-makrx-blue">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">1000+</div>
              <div className="text-white/80">Products</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">500+</div>
              <div className="text-white/80">Brands</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">50K+</div>
              <div className="text-white/80">Orders</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-makrx-yellow mb-2">98%</div>
              <div className="text-white/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Start Shopping Today
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Join thousands of makers who trust MakrX.Store for their project needs
          </p>

          <a
            href="https://makrx.store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-makrx-blue dark:bg-makrx-yellow text-white dark:text-makrx-blue rounded-xl font-bold text-lg hover:bg-makrx-blue/90 dark:hover:bg-makrx-yellow/90 transition-all transform hover:scale-105 shadow-lg"
          >
            Browse Catalog
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
