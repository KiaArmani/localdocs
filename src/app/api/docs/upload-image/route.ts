export const runtime = 'nodejs';

import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'img', 'uploads');

// Ensure upload directory exists
async function ensureUploadDirExists() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    // Directory doesn't exist, create it
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      console.log(`Created upload directory: ${UPLOAD_DIR}`);
    } catch (mkdirError) {
      console.error(`Failed to create upload directory: ${UPLOAD_DIR}`, mkdirError);
      throw new Error('Server setup error: Could not create upload directory.');
    }
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'API only available in development mode.' }, { status: 403 });
  }

  // Ensure the upload directory exists before processing the request
  try {
    await ensureUploadDirExists();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload directory error.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No image file provided.' }, { status: 400 });
    }

    // Validate file type (optional but recommended)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
       return NextResponse.json({ success: false, message: `Invalid file type: ${file.type}. Only JPG, PNG, GIF, WEBP allowed.` }, { status: 400 });
    }

    // Generate a unique filename (e.g., timestamp + original name)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const originalFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, ''); // Sanitize
    const filename = `${uniqueSuffix}-${originalFilename}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Convert file buffer and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Construct the public URL
    const publicUrl = `/img/uploads/${filename}`;

    console.log(`Image uploaded successfully: ${publicUrl}`);

    // Return the public URL
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error: unknown) {
    console.error("API Error uploading image:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error uploading image.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 