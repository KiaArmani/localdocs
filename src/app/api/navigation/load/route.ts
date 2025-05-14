import { NextResponse } from 'next/server';
import { promises as fs } from 'fs'; 
import path from 'path';

export const dynamic = "force-static";

const navigationFilePath = path.join(process.cwd(), 'content', 'docs', 'navigation.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(navigationFilePath, 'utf-8');
    const jsonData = JSON.parse(fileContents);
    // The NavigationContext expects an object with an 'items' key holding the array
    return NextResponse.json({ items: jsonData });
  } catch (error) {
    console.error("API Error loading navigation from file:", error);
    // Handle file not found or other errors appropriately
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ message: 'Navigation file not found.', items: [] }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error reading navigation file.', items: [] }, { status: 500 });
  }
} 