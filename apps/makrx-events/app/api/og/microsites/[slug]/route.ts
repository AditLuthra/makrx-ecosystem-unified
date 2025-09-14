/** @jsx React.createElement */
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import React from 'react';

export const runtime = 'edge';

// GET /api/og/microsites/[slug] - Generate Open Graph image for microsite
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Optional query parameters for customization
    const title = searchParams.get('title') || 'MakerFest 2024';
    const subtitle = searchParams.get('subtitle') || 'Join the largest maker community event';
    const theme = searchParams.get('theme') || 'festival-classic';
    const bgImage = searchParams.get('bg');

    // Mock microsite data - replace with actual database query
    const mockMicrosite = {
      slug,
      title: title,
      subtitle: subtitle,
      description:
        'Experience the future of making with hands-on workshops, competitions, and exhibitions.',
      theme: {
        primary: '#3B82F6',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        foreground: '#1F2937',
      },
      heroImage: bgImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      startsAt: '2024-04-15T09:00:00Z',
      endsAt: '2024-04-17T18:00:00Z',
      venue: 'MakerSpace Convention Center',
    };

    // Format dates
    const startDate = new Date(mockMicrosite.startsAt);
    const endDate = new Date(mockMicrosite.endsAt);
    const dateRange = `${startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} - ${endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;

    const bgImage = mockMicrosite.heroImage
      ? 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(' +
        mockMicrosite.heroImage +
        ')'
      : 'linear-gradient(135deg, ' +
        mockMicrosite.theme.primary +
        ', ' +
        mockMicrosite.theme.accent +
        ')';

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: mockMicrosite.theme.background,
            backgroundImage: bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            fontSize: 32,
            fontWeight: 600,
          },
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
              maxWidth: '800px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '24px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.1,
              },
            },
            mockMicrosite.title,
          ),
          React.createElement(
            'div',
            {
              style: {
                fontSize: '36px',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '32px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                fontWeight: 400,
              },
            },
            mockMicrosite.subtitle,
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '32px 48px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '28px',
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
              '📅 ' + dateRange,
            ),
            React.createElement(
              'div',
              {
                style: {
                  fontSize: '24px',
                  color: 'rgba(255, 255, 255, 0.9)',
                },
              },
              '📍 ' + mockMicrosite.venue,
            ),
          ),
          React.createElement(
            'div',
            {
              style: {
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '20px',
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  width: '32px',
                  height: '32px',
                  backgroundColor: mockMicrosite.theme.primary,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
              'M',
            ),
            'MakrX.events',
          ),
        ),
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Failed to generate image', { status: 500 });
  }
}
