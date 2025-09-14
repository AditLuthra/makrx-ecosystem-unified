'use client';

import React from "react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

export default function PlaceholderPageSimple({ title, description, comingSoon = true }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            {title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {description}
          </p>
          
          {comingSoon && (
            <div className="bg-makrx-yellow/10 border border-makrx-yellow/20 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-makrx-blue mb-2">Coming Soon</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We're working hard to bring you this feature. Stay tuned for updates!
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-makrx-blue text-white rounded-lg font-semibold hover:bg-makrx-blue/90 transition-colors">
              Back to Home
            </button>
            <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-makrx-blue text-makrx-blue rounded-lg font-semibold hover:bg-makrx-blue hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
