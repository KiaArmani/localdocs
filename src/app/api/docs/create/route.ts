import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Define NavigationNode structure (mirroring context/frontend)
interface NavigationNode {
    type: 'category' | 'folder' | 'link';
    name: string;
    href?: string;
    children?: NavigationNode[];
}

const contentDocsPath = path.join(process.cwd(), 'content', 'docs');
const navigationFilePath = path.join(contentDocsPath, 'navigation.json');

// Simple function to generate a URL-safe slug segment from a title
function slugify(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

// Recursive function to find and insert the new node (simplified logic)
// NOTE: This simplified logic might not handle deeply nested paths correctly.
// It primarily looks for the first segment match.
function findAndInsertNode(nodes: NavigationNode[], parentPathSegments: string[], newNode: NavigationNode): boolean {
    if (!nodes) return false;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // If the current node is the target parent (first segment match)
        if ((node.type === 'category' || node.type === 'folder') && slugify(node.name) === parentPathSegments[0]) {
             // If this is the final parent segment, insert here
            if (parentPathSegments.length === 1) {
                node.children = node.children || [];
                if (!node.children.some(child => child.href === newNode.href)) {
                    node.children.push(newNode);
                    return true; // Inserted
                }
                return false; // Already exists here
            }
             // Otherwise, recurse into children with remaining segments
             if (node.children) {
                if (findAndInsertNode(node.children, parentPathSegments.slice(1), newNode)) {
                    return true;
                }
             }
        }

        // Also check children even if current node name doesn't match (covers nested folders under different category names)
        if (node.children) {
           if (findAndInsertNode(node.children, parentPathSegments, newNode)) {
               return true;
           }
        }
    }
    return false; // Parent path not found at this level or deeper
}

export async function POST(request: Request) {
  try {
    const { title, parentPath } = await request.json(); // Expect title and parentPath

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ message: 'Invalid title provided.' }, { status: 400 });
    }
    if (parentPath === undefined || typeof parentPath !== 'string') {
       return NextResponse.json({ message: 'Invalid parentPath provided.' }, { status: 400 });
    }

    const pageSlug = slugify(title);
    const fullSlug = parentPath ? `${parentPath}/${pageSlug}` : pageSlug;

    if (fullSlug.includes('..') || !/^[a-z0-9-/]*$/.test(fullSlug)) {
       return NextResponse.json({ message: 'Invalid generated slug.' }, { status: 400 });
    }

    const filePath = path.join(contentDocsPath, `${fullSlug}.mdx`);
    const dirPath = path.dirname(filePath);

    // Create MDX File
    try {
      await fs.access(filePath);
      return NextResponse.json({ message: `File already exists at ${fullSlug}.mdx` }, { status: 409 });
    } catch (accessError) { /* OK */ }
    await fs.mkdir(dirPath, { recursive: true });
    const fileContent = `---
title: ${title}
---

# ${title}

New page content goes here.
`;
    await fs.writeFile(filePath, fileContent, 'utf-8');

    // Update Navigation JSON
    let navigationData: NavigationNode[] = [];
    try {
        const jsonData = await fs.readFile(navigationFilePath, 'utf-8');
        navigationData = JSON.parse(jsonData);
    } catch (readError) {
        console.error("Could not read navigation.json for update:", readError);
        throw new Error("Could not read navigation file to add new page.");
    }

    const newNode: NavigationNode = {
        type: 'link',
        name: title,
        href: `/docs/${fullSlug}`
    };

    const parentPathSegments = parentPath ? parentPath.split('/') : [];
    let inserted = false;

    if (parentPathSegments.length === 0) {
        if (!navigationData.some(node => node.href === newNode.href)) {
            navigationData.push(newNode);
            inserted = true;
        }
    } else {
        inserted = findAndInsertNode(navigationData, parentPathSegments, newNode);
    }

    if (!inserted) {
        console.warn(`Could not insert node into navigation structure for parent '${parentPath}' (maybe duplicate or parent not found?). Adding to root as fallback.`);
        // Fallback: Add to root if insertion failed
         if (!navigationData.some(node => node.href === newNode.href)) {
            navigationData.push(newNode);
         }
    }

    try {
        const updatedJsonData = JSON.stringify(navigationData, null, 2);
        await fs.writeFile(navigationFilePath, updatedJsonData, 'utf-8');
    } catch (writeError) {
         console.error("Could not write updated navigation.json:", writeError);
         throw new Error("MDX file created, but failed to save updated navigation file.");
    }

    return NextResponse.json({ success: true, message: `Page created at ${fullSlug}.mdx and navigation updated.`, path: `/docs/${fullSlug}` });

  } catch (error: any) {
    console.error("API Error creating page or updating navigation:", error);
    const errorMessage = error.message || 'Internal Server Error creating page or updating navigation.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
} 