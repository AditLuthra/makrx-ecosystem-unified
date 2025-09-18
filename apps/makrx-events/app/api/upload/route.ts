import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const uploadsEnabled = () => process.env.ALLOW_LOCAL_UPLOADS === 'true';

export async function POST(request: NextRequest) {
  try {
    if (!uploadsEnabled()) {
      return NextResponse.json(
        {
          error:
            'File uploads are disabled. Configure an object storage integration and set ALLOW_LOCAL_UPLOADS=true only for local development.',
        },
        { status: 503 },
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type = data.get('type') as string; // 'logo', 'hero', 'favicon', 'event-image', 'certificate', 'export'
    const micrositeId = data.get('micrositeId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Validate file types and sizes for themes
    const validationRules = {
      logo: {
        types: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
        maxSize: 2 * 1024 * 1024, // 2MB
      },
      hero: {
        types: ['image/png', 'image/jpeg', 'image/webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
      favicon: {
        types: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
        maxSize: 512 * 1024, // 512KB
      },
      'event-image': {
        types: ['image/png', 'image/jpeg', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      },
      certificate: {
        types: ['application/pdf', 'image/png', 'image/jpeg'],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
      export: {
        types: ['text/csv', 'application/json'],
        maxSize: 50 * 1024 * 1024, // 50MB
      },
    };

    const rules = validationRules[type as keyof typeof validationRules];
    if (rules) {
      if (!rules.types.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type for ${type}. Allowed: ${rules.types.join(', ')}`,
          },
          { status: 400 },
        );
      }

      if (file.size > rules.maxSize) {
        return NextResponse.json(
          {
            error: `File too large. Maximum size: ${Math.round(rules.maxSize / 1024 / 1024)}MB`,
          },
          { status: 400 },
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create filename with timestamp and random string to avoid conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || '';
    const filename = `${type}_${timestamp}_${randomString}.${extension}`;

    // Define upload directory based on type
    let uploadDir = 'public/uploads';
    switch (type) {
      case 'logo':
      case 'hero':
      case 'favicon':
        uploadDir = `public/uploads/themes${micrositeId ? `/${micrositeId}` : ''}`;
        break;
      case 'event-image':
        uploadDir = 'public/uploads/events';
        break;
      case 'certificate':
        uploadDir = 'public/uploads/certificates';
        break;
      case 'export':
        uploadDir = 'public/uploads/exports';
        break;
      default:
        uploadDir = 'public/uploads/misc';
    }

    // Ensure directory exists
    const fullUploadDir = join(process.cwd(), uploadDir);
    if (!existsSync(fullUploadDir)) {
      await mkdir(fullUploadDir, { recursive: true });
    }

    const path = join(fullUploadDir, filename);
    await writeFile(path, buffer);

    const fileUrl = `/${uploadDir.replace('public/', '')}/${filename}`;

    // Enhanced response with metadata
    const uploadResult = {
      success: true,
      id: `upload_${timestamp}_${randomString}`,
      filename,
      originalName: file.name,
      url: fileUrl,
      size: buffer.length,
      type: file.type,
      category: type,
      micrositeId: micrositeId || null,
      metadata: {
        dimensions: file.type.startsWith('image/') ? 'Processing...' : null,
        uploadedAt: new Date().toISOString(),
      },
    };

    // TODO: In production, you might want to:
    // - Process images (resize, optimize, generate thumbnails)
    // - Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // - Generate CDN URLs
    // - Store metadata in database

    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// GET /api/upload - List uploaded files with filtering
export async function GET(request: NextRequest) {
  try {
    if (!uploadsEnabled()) {
      return NextResponse.json(
        {
          error:
            'File uploads are disabled. Configure an object storage integration and set ALLOW_LOCAL_UPLOADS=true only for local development.',
        },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const micrositeId = searchParams.get('micrositeId');

    // Mock file listing - replace with actual file system or database query
    const mockFiles = [
      {
        id: 'upload_1',
        filename: 'logo_1234567890_abc123.png',
        originalName: 'company-logo.png',
        url: '/uploads/themes/logo_1234567890_abc123.png',
        size: 45678,
        type: 'image/png',
        category: 'logo',
        micrositeId: 'ms_1',
        uploadedAt: '2024-02-01T10:30:00Z',
      },
    ];

    // Apply filters
    let filteredFiles = mockFiles;
    if (type) {
      filteredFiles = filteredFiles.filter((f) => f.category === type);
    }
    if (micrositeId) {
      filteredFiles = filteredFiles.filter((f) => f.micrositeId === micrositeId);
    }

    return NextResponse.json({
      files: filteredFiles,
      count: filteredFiles.length,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
