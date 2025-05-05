import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

async function getRawDocBySlug(slug: string[]): Promise<{ content: string; data: Record<string, any> } | null> {
  // Construct the file path, handling the potential "index" case
  const effectiveSlug = slug.length === 0 || (slug.length === 1 && slug[0] === 'index') ? ['index'] : slug;
  const filePath = path.join(process.cwd(), 'content', 'docs', ...effectiveSlug) + '.mdx';

  try {
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const { content, data } = matter(rawContent);
    return { content, data };
  } catch (error: any) {
    // Log the error for server-side debugging
    console.error(`Error reading file ${filePath}:`, error);
    // Check if the error is because the file doesn't exist
    if (error.code === 'ENOENT') {
      return null; // Return null specifically for Not Found errors
    } else {
      // For other errors, re-throw or handle differently if needed
      // Throwing here will result in a 500 error response
      throw new Error(`Could not read document for slug: ${slug.join('/')}`);
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  // Explicitly get slug from params here
  const slug = params.path || [];

  try {
    // Use the already defined slug variable
    const doc = await getRawDocBySlug(slug);

    if (!doc) {
      // Return a 404 response if the document is not found
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    // Return the document content and data
    return NextResponse.json(doc);

  } catch (error) {
    // Log the error and return a 500 response for unexpected errors
    console.error("API Error fetching document:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 