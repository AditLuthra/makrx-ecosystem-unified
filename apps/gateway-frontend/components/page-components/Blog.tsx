'use client';

import React from 'react';
import { Calendar, User, Tag } from 'lucide-react';

export default function Blog() {
  // Mock blog posts
  const posts = [
    {
      id: 1,
      title: "The Future of Digital Manufacturing in India",
      excerpt: "Exploring how digital fabrication is transforming the maker ecosystem and enabling rapid innovation across industries.",
      author: "Team MakrX",
      date: "2024-01-15",
      category: "Industry Insights",
      image: "/blog/manufacturing-future.jpg"
    },
    {
      id: 2,
      title: "Building Your First IoT Project: A Complete Guide",
      excerpt: "Step-by-step tutorial on creating connected devices using Arduino, sensors, and cloud platforms available through MakrX.",
      author: "Priya Sharma",
      date: "2024-01-10",
      category: "Tutorials",
      image: "/blog/iot-guide.jpg"
    },
    {
      id: 3,
      title: "Spotlight: Mumbai Makerspace Success Story",
      excerpt: "How TechSpace Mumbai transformed from a small community workshop to a thriving innovation hub using MakrCave.",
      author: "Raj Kumar",
      date: "2024-01-05",
      category: "Success Stories",
      image: "/blog/mumbai-makerspace.jpg"
    },
    {
      id: 4,
      title: "3D Printing Revolution: Materials and Techniques",
      excerpt: "Discover the latest materials and printing techniques that are pushing the boundaries of additive manufacturing.",
      author: "Dr. Ananya Patel",
      date: "2024-01-02",
      category: "Technology",
      image: "/blog/3d-printing-materials.jpg"
    },
    {
      id: 5,
      title: "From Prototype to Production: A Maker's Journey",
      excerpt: "Follow the inspiring story of how a weekend project became a successful product through the MakrX ecosystem.",
      author: "Vikash Singh",
      date: "2023-12-28",
      category: "Success Stories",
      image: "/blog/prototype-to-production.jpg"
    },
    {
      id: 6,
      title: "Laser Cutting Tips for Beginners",
      excerpt: "Essential tips and tricks for getting started with laser cutting, from material selection to design optimization.",
      author: "Sarah Chen",
      date: "2023-12-25",
      category: "Tutorials",
      image: "/blog/laser-cutting-tips.jpg"
    }
  ];

  const categories = ['All', 'Industry Insights', 'Tutorials', 'Success Stories', 'Technology'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            MakrX Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center max-w-3xl mx-auto">
            Insights, tutorials, and stories from the maker community. 
            Stay updated with the latest in digital fabrication and innovation.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors
                  bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                  hover:bg-makrx-blue hover:text-white dark:hover:bg-makrx-blue
                  first:bg-makrx-blue first:text-white"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Featured Article</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 aspect-video md:aspect-auto bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">Featured Blog Image</span>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(posts[0].date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {posts[0].category}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white hover:text-makrx-blue dark:hover:text-makrx-yellow transition-colors cursor-pointer">
                  {posts[0].title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {posts[0].excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    {posts[0].author}
                  </div>
                  <button className="px-6 py-2 bg-makrx-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Read Article
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <article key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">Blog Image</span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {post.category}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white hover:text-makrx-blue dark:hover:text-makrx-yellow transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <button className="text-makrx-blue dark:text-makrx-yellow font-medium hover:text-blue-700 dark:hover:text-yellow-300 transition-colors">
                      Read More →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-makrx-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-makrx-blue dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-white/90 dark:text-gray-300 mb-8">
            Get the latest maker insights, tutorials, and community stories delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-makrx-yellow bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button className="px-6 py-3 bg-makrx-yellow text-makrx-blue font-semibold rounded-lg hover:bg-yellow-300 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
