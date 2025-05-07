import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

const navigationFilePath = path.join(process.cwd(), 'content', 'docs', 'navigation.json');

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'API only available in development mode.' }, { status: 403 });
  }

  try {
    const navigationData = await request.json();

    if (!navigationData) {
        return NextResponse.json({ success: false, message: 'No navigation data provided.' }, { status: 400 });
    }

    // Optionally add validation logic here to ensure structure is correct

    const jsonData = JSON.stringify(navigationData, null, 2); // Pretty print JSON
    await fs.writeFile(navigationFilePath, jsonData, 'utf-8');

    return NextResponse.json({ success: true, message: 'Navigation saved successfully.' });

  } catch (error: unknown) {
    console.error("API Error saving navigation:", error);
    const message = error instanceof Error ? error.message : 'Internal Server Error saving navigation file.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
} 