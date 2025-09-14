'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Upload,
  FileText,
  Calculator,
  Printer,
  Package,
  Truck,
  Zap,
} from 'lucide-react';

export default function ThreeDStore() {
  const services = [
    {
      icon: <Printer className="w-8 h-8" />,
      name: '3D Printing',
      description: 'FDM, SLA, SLS printing with premium materials',
      materials: ['PLA', 'ABS', 'PETG', 'Resin', 'Nylon'],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      name: 'Laser Cutting',
      description: 'Precision cutting for wood, acrylic, metal sheets',
      materials: ['Wood', 'Acrylic', 'Steel', 'Aluminum', 'Cardboard'],
    },
    {
      icon: <Package className="w-8 h-8" />,
      name: 'CNC Machining',
      description: 'High-precision milling and turning services',
      materials: ['Aluminum', 'Steel', 'Brass', 'Plastic', 'Wood'],
    },
    {
      icon: <FileText className="w-8 h-8" />,
      name: 'PCB Assembly',
      description: 'Custom circuit board fabrication and assembly',
      materials: ['FR4', 'Flexible', 'Metal Core', 'Ceramic'],
    },
  ];

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: 'Instant Upload',
      description: 'Upload your designs and get quotes in minutes, not days.',
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Transparent Pricing',
      description: "See exactly what you'll pay with our detailed cost breakdown.",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Get your parts delivered in 2-7 days across India.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-gray-800 dark:to-purple-900 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Printer className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">3D.MakrX.Store</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Upload your 3D files and get instant quotes for custom fabrication. From rapid
            prototyping to production runs, we've got you covered.
          </p>
          <a
            href="https://3d.makrx.store/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105"
          >
            Upload a File
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Upload to Quote Workflow */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Simple Upload-to-Quote Process
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Upload File
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Drop your STL, OBJ, or other 3D files directly into our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Specify Details
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose materials, finish options, and quantity requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Get Quote
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive instant pricing from our network of verified manufacturers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Receive Parts
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your custom parts delivered directly to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Manufacturing Services
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="p-8 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                <div className="w-16 h-16 bg-makrx-blue/10 dark:bg-makrx-yellow/10 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-makrx-blue dark:text-makrx-yellow">{service.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.materials.map((material, materialIndex) => (
                    <span
                      key={materialIndex}
                      className="px-3 py-1 bg-makrx-blue/10 dark:bg-makrx-yellow/10 text-makrx-blue dark:text-makrx-yellow rounded-full text-sm font-medium"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Choose 3D.MakrX.Store?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-makrx-yellow/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="text-makrx-blue dark:text-makrx-yellow">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-makrx-blue dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Bring Your Ideas to Life?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of makers, engineers, and designers who trust us with their custom
            manufacturing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://3d.makrx.store/upload"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-makrx-yellow text-makrx-blue font-bold rounded-xl hover:bg-yellow-300 transition-colors"
            >
              Upload Your Design
              <ExternalLink className="w-5 h-5" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-makrx-blue transition-colors"
            >
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
