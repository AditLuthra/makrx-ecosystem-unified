import { NextRequest, NextResponse } from 'next/server';
import { backgroundJobs } from '@/lib/background-jobs';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    switch (type) {
      case 'email':
        await backgroundJobs.processEmailQueue();
        break;
      case 'export':
        await backgroundJobs.processExportJobs();
        break;
      case 'communication':
        await backgroundJobs.processBulkCommunications();
        break;
      case 'all':
        await Promise.all([
          backgroundJobs.processEmailQueue(),
          backgroundJobs.processExportJobs(),
          backgroundJobs.processBulkCommunications(),
        ]);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid job type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type} jobs processed successfully`,
    });
  } catch (error) {
    console.error('Error processing background jobs:', error);
    return NextResponse.json(
      { error: 'Failed to process background jobs' },
      { status: 500 }
    );
  }
}