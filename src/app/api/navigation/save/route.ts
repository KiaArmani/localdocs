import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const navigationFilePath = path.join(process.cwd(), 'content', 'docs', 'navigation.json');

export async function POST(request: Request) {
  // Disallow saving in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Operation not allowed in production.' }, { status: 403 });
  }

  try {
    const navigationData = await request.json();

    if (!navigationData) {
        return NextResponse.json({ message: 'No navigation data provided.' }, { status: 400 });
    }

    // Optionally add validation logic here to ensure structure is correct

    const jsonData = JSON.stringify(navigationData, null, 2); // Pretty print JSON
    await fs.writeFile(navigationFilePath, jsonData, 'utf-8');

    return NextResponse.json({ success: true, message: 'Navigation saved successfully.' });

  } catch (error) {
    console.error("API Error saving navigation:", error);
    return NextResponse.json({ message: 'Internal Server Error saving navigation file.' }, { status: 500 });
  }
} 