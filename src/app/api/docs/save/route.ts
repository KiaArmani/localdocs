export const runtime = 'edge';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import matter from 'gray-matter'; // To potentially preserve existing frontmatter

const contentDocsPath = path.join(process.cwd(), 'content', 'docs');

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'API only available in development mode.' }, { status: 403 });
  }

  try {
    const { slug, content, frontmatter } = await req.json();

    // Adjust validation: Allow empty slug array (represents root/index)
    if (!slug || !Array.isArray(slug) || typeof content !== 'string') { // Removed slug.length === 0 check
      return NextResponse.json({ message: 'Invalid request body - slug missing or content not string' }, { status: 400 });
    }

    // Reconstruct the file path (same logic as GET route)
    const effectiveSlug = slug.length === 0 ? ['index'] : slug;
    const filePath = `${path.join(contentDocsPath, ...effectiveSlug)}.mdx`;

    // Combine frontmatter and content using gray-matter
    // This preserves existing frontmatter if passed, or adds new if needed
    // Ensure frontmatter is an object, default to empty if undefined/null
    const fileContent = matter.stringify(content, frontmatter || {});

    // Write the updated content back to the file
    await fs.writeFile(filePath, fileContent, 'utf-8');

    console.log(`Successfully saved: ${filePath}`); // Server-side log
    return NextResponse.json({ success: true, message: 'File saved successfully' });

  } catch (error: unknown) {
    console.error("API Error saving document:", error);
    // Provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 