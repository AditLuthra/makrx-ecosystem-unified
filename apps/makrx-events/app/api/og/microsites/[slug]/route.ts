/** @jsx React.createElement */
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import React from 'react';
import { db } from '@/lib/db';
import { microsites } from '@shared/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// GET /api/og/microsites/[slug] - Generate Open Graph image for microsite
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const [microsite] = await db
      .select()
      .from(microsites)
      .where(eq(microsites.slug, slug))
      .limit(1);

    if (!microsite) {
      return NextResponse.json({ error: 'Microsite not found' }, { status: 404 });
    }

    const requestedTitle = searchParams.get('title');
    const requestedSubtitle = searchParams.get('subtitle');
    const requestedBackground = searchParams.get('bg');

    const title = requestedTitle ?? microsite.title ?? slug;
    const subtitle = requestedSubtitle ?? microsite.subtitle ?? microsite.description ?? '';

    const startDate = microsite.startsAt ? new Date(microsite.startsAt) : null;
    const endDate = microsite.endsAt ? new Date(microsite.endsAt) : null;
    let dateRange = 'Dates coming soon';
    if (startDate && endDate) {
      dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (startDate) {
      dateRange = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const settings = (microsite.settings ?? {}) as Record<string, unknown>;
    const heroImage = requestedBackground || (microsite.heroImage as string | null);
    const theme = (settings.theme as { primary?: string; accent?: string } | undefined) ?? {};

    const backgroundImage = heroImage
      ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroImage})`
      : `linear-gradient(135deg, ${theme.primary ?? '#3B82F6'}, ${theme.accent ?? '#8B5CF6'})`;

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
            backgroundImage,
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
            title,
          ),
          subtitle
            ? React.createElement(
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
                subtitle,
              )
            : null,
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
              `📅 ${dateRange}`,
            ),
            microsite.location
              ? React.createElement(
                  'div',
                  {
                    style: {
                      fontSize: '24px',
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                  },
                  `📍 ${microsite.location}`,
                )
              : null,
          ),
          React.createElement(
            'div',
            {
              style: {
                marginTop: '40px',
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.85)',
              },
            },
            'Powered by MakrX.events',
          ),
        ),
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('Failed to generate microsite OG image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
