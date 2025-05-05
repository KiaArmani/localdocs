import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const navigationFilePath = path.join(process.cwd(), 'content', 'docs', 'navigation.json');

export async function GET() {
  try {
    const jsonData = await fs.readFile(navigationFilePath, 'utf-8');
    const navigationData = JSON.parse(jsonData);
    return NextResponse.json(navigationData);
  } catch (error) {
    console.error("API Error loading navigation:", error);
    // If file not found, maybe return a default structure or empty array?
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ message: 'Navigation file not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error reading navigation file.' }, { status: 500 });
  }
} 