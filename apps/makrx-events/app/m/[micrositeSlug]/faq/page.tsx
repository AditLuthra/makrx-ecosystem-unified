import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";

interface MicrositeFAQPageProps {
  params: {
    micrositeSlug: string;
  };
}

// FAQ Component to handle client-side interactions
function FAQSection({ faqs }: { faqs: Array<{ id: string; question: string; answer: string; category: string }> }) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{category}</h2>
          <div className="space-y-3">
            {faqs
              .filter(faq => faq.category === category)
              .map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                      {openItems.has(faq.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {openItems.has(faq.id) && (
                      <div className="px-6 pb-6">
                        <div className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function MicrositeFAQPage({ params }: MicrositeFAQPageProps) {
  const { micrositeSlug } = await params;
  
  // Mock data - would fetch from database
  const microsite = {
    slug: micrositeSlug,
    title: "MakerFest 2024"
  };

  const faqs = [
    {
      id: "1",
      category: "General Information",
      question: "What is MakerFest 2024?",
      answer: "MakerFest 2024 is a three-day festival celebrating makers, inventors, and technology enthusiasts. It features hands-on workshops, competitions, exhibitions, and networking opportunities for the maker community."
    },
    {
      id: "2", 
      category: "General Information",
      question: "When and where is the event?",
      answer: "MakerFest 2024 takes place March 15-17, 2024 at the Moscone Center in San Francisco, California. The event runs from 9 AM to 8 PM each day."
    },
    {
      id: "3",
      category: "Registration",
      question: "How do I register for the event?",
      answer: "You can register through our website by clicking the 'Register Now' button. We offer different ticket types including general admission, workshop passes, and VIP packages."
    },
    {
      id: "4",
      category: "Registration", 
      question: "What's included in my ticket?",
      answer: "General admission includes access to the exhibition floor, keynote presentations, and networking areas. Workshop tickets include access to specific hands-on sessions. VIP tickets include all of the above plus exclusive networking events and priority seating."
    },
    {
      id: "5",
      category: "Registration",
      question: "Can I get a refund if I can't attend?",
      answer: "Yes, we offer full refunds up to 30 days before the event, 50% refunds up to 14 days before, and no refunds within 14 days of the event unless there are exceptional circumstances."
    },
    {
      id: "6", 
      category: "Workshops & Competitions",
      question: "Do I need to bring my own materials for workshops?",
      answer: "No, all materials and tools for workshops are provided. However, you're welcome to bring your own laptop or tablet if you prefer to work on your own device."
    },
    {
      id: "7",
      category: "Workshops & Competitions", 
      question: "How do I register for specific workshops?",
      answer: "Workshop registration opens with your event ticket purchase. You can select specific workshops during the registration process or add them later through your attendee dashboard."
    },
    {
      id: "8",
      category: "Workshops & Competitions",
      question: "Can I participate in multiple competitions?",
      answer: "Yes, you can participate in multiple competitions as long as the schedules don't conflict. Each competition has its own registration process and requirements."
    },
    {
      id: "9",
      category: "Logistics",
      question: "Is parking available at the venue?",
      answer: "Yes, the Moscone Center has parking available. We also recommend public transportation as the venue is accessible via BART and Muni. Bike parking is also available."
    },
    {
      id: "10",
      category: "Logistics",
      question: "Are meals provided?", 
      answer: "Light breakfast and lunch are included for all attendees. We'll have a variety of food trucks and vendors available throughout the day. Dietary restrictions can be accommodated with advance notice."
    },
    {
      id: "11",
      category: "Logistics",
      question: "What should I bring to the event?",
      answer: "Bring a valid ID, comfortable shoes, and a notebook for taking notes. All workshop materials are provided, but you may want to bring a laptop or tablet for certain sessions."
    },
    {
      id: "12", 
      category: "Safety & Policies",
      question: "What are your COVID-19 safety protocols?",
      answer: "We follow all local health guidelines and CDC recommendations. Hand sanitizing stations are available throughout the venue, and we encourage attendees to stay home if feeling unwell."
    },
    {
      id: "13",
      category: "Safety & Policies", 
      question: "Is the event family-friendly?",
      answer: "Yes! We welcome attendees of all ages. Children under 12 attend free with a paying adult. We have special family-friendly workshop sessions and activities."
    },
    {
      id: "14",
      category: "Safety & Policies",
      question: "What is your code of conduct?",
      answer: "We are committed to providing a harassment-free experience for everyone. Our full code of conduct is available on our website and covers expected behavior, reporting procedures, and consequences for violations."
    }
  ];

  if (!microsite) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Microsite Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/m/${micrositeSlug}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {microsite.title}
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href={`/m/${micrositeSlug}/events`} className="text-gray-700 hover:text-primary">
                Events
              </Link>
              <Link href={`/m/${micrositeSlug}/schedule`} className="text-gray-700 hover:text-primary">
                Schedule
              </Link>
              <Link href={`/m/${micrositeSlug}/about`} className="text-gray-700 hover:text-primary">
                About
              </Link>
              <Link href={`/m/${micrositeSlug}/faq`} className="text-primary font-medium">
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about {microsite.title}
          </p>
        </div>

        {/* FAQ Sections */}
        <FAQSection faqs={faqs} />

        {/* Contact for More Help */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions about {microsite.title}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="mailto:support@makerfest.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/m/${micrositeSlug}/contact`}>
                  Contact Form
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}