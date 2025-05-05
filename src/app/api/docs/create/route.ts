import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const contentDocsPath = path.join(process.cwd(), 'content', 'docs');

// Simple function to generate a URL-safe slug segment from a title
function slugify(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json(); // Only expect title

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ message: 'Invalid title provided.' }, { status: 400 });
    }

    const pageSlug = slugify(title);
    const fullSlug = pageSlug; // Create at root level

    const filePath = path.join(contentDocsPath, `${fullSlug}.mdx`);
    const dirPath = path.dirname(filePath); // Still needed for root level file

    // Check if file already exists
    try {
      await fs.access(filePath);
      // If access doesn't throw, file exists
      return NextResponse.json({ message: `File already exists at ${fullSlug}.mdx` }, { status: 409 }); // 409 Conflict
    } catch (accessError) {
      // File doesn't exist, proceed
    }

    // Ensure directory exists (important even for root, though less likely to be needed)
    await fs.mkdir(dirPath, { recursive: true });

    // Create basic MDX content
    const fileContent = `---
title: ${title}
---

# ${title}

New page content goes here.
`;

    // Write the file
    await fs.writeFile(filePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true, message: `Page created at ${fullSlug}.mdx. Remember to add it to navigation.json manually.`, path: `/docs/${fullSlug}` });

  } catch (error: any) {
    console.error("API Error creating page:", error);
    // Update error message
    const errorMessage = error.message || 'Internal Server Error creating page.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
} 