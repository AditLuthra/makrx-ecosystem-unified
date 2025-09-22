import { db } from '@/lib/db';
import { isMockMode, safeDbCall } from '@/lib/runtime-guards';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'mock',
        api: 'operational',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
  }
  try {
    // Check database connection (use drizzle sql)
    await safeDbCall(() => db.execute(sql`SELECT 1`), undefined);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);

    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'operational',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(health, { status: 503 });
  }
}
