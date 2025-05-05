import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import matter from 'gray-matter'; // To potentially preserve existing frontmatter

export async function POST(request: Request) {
  try {
    const { slug, content, frontmatter } = await request.json();

    // Validate input
    if (!slug || !Array.isArray(slug) || slug.length === 0 || typeof content !== 'string') {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    // Reconstruct the file path (similar to GET route)
    const effectiveSlug = slug.length === 0 || (slug.length === 1 && slug[0] === 'index') ? ['index'] : slug;
    const filePath = path.join(process.cwd(), 'content', 'docs', ...effectiveSlug) + '.mdx';

    // Combine frontmatter and content using gray-matter
    // This preserves existing frontmatter if passed, or adds new if needed
    // Ensure frontmatter is an object, default to empty if undefined/null
    const fileContent = matter.stringify(content, frontmatter || {});

    // Write the updated content back to the file
    await fs.writeFile(filePath, fileContent, 'utf-8');

    console.log(`Successfully saved: ${filePath}`); // Server-side log
    return NextResponse.json({ success: true, message: 'File saved successfully' });

  } catch (error: any) {
    console.error("API Error saving document:", error);
    // Provide a more specific error message if possible
    const errorMessage = error.message || 'Internal Server Error';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 