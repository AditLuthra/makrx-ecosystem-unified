'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQContent {
  title: string;
  description?: string;
  items: FAQItem[];
  categories?: string[];
}

interface FAQProps {
  id: string;
  content: FAQContent;
  variant?: string;
  micrositeSlug: string;
  theme?: {
    tokens: Record<string, string>;
    assets: Record<string, string>;
  };
}

export default function FAQ({ content, variant = 'accordion', theme }: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const primaryColor = theme?.tokens?.primary || '#3B82F6';

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const filteredItems =
    selectedCategory === 'all'
      ? content.items
      : content.items.filter((item) => item.category === selectedCategory);

  const categories = content.categories || [
    'all',
    ...Array.from(new Set(content.items.map((item) => item.category).filter(Boolean))),
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">{content.title}</h2>
          {content.description && (
            <p className="text-xl text-muted-foreground">{content.description}</p>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? primaryColor : 'transparent',
                  border: `1px solid ${selectedCategory === category ? primaryColor : 'var(--border)'}`,
                }}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-6 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground pr-4">{item.question}</h3>
                  <div className="flex-shrink-0">
                    {openItems.has(index) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {openItems.has(index) && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-lg font-medium mb-2">No questions found</h3>
              <p className="text-sm">Try selecting a different category or check back later.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
