import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';
import slugify from 'slugify';
// import { findNavigationNode, NavLink, Navigation, NavigationNode as ImportedNavigationNode } from '@/lib/navigation-utils'; // Commented out missing import

// Define NavigationNode structure locally since import is missing
interface NavigationNode {
    type: 'category' | 'folder' | 'link';
    name: string;
    href?: string;
    children?: NavigationNode[];
}

const contentDocsPath = path.join(process.cwd(), 'content', 'docs');
const navigationFilePath = path.join(contentDocsPath, 'navigation.json');

// Removed local slugify function, will use imported 'slugify'

// Recursive function to find and insert the new node
function findAndInsertNode(nodes: NavigationNode[], parentPathSegments: string[], newNode: NavigationNode): boolean {
    if (!nodes) return false;

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // Use imported slugify for comparison if node.name needs slugification
        if ((node.type === 'category' || node.type === 'folder') && slugify(node.name.toLowerCase()) === parentPathSegments[0]) {
            if (parentPathSegments.length === 1) {
                node.children = node.children || [];
                if (!node.children.some(child => child.href === newNode.href)) {
                    node.children.push(newNode);
                    return true;
                }
                return false;
            }
            if (node.children) {
                if (findAndInsertNode(node.children, parentPathSegments.slice(1), newNode)) {
                    return true;
                }
            }
        }
        if (node.children) {
           if (findAndInsertNode(node.children, parentPathSegments, newNode)) {
               return true;
           }
        }
    }
    return false;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'API only available in development mode.' }, { status: 403 });
  }

  try {
    const { title, parentPath: rawParentPath } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ message: 'Invalid title provided.' }, { status: 400 });
    }
    // Ensure parentPath is a string, even if empty
    const parentPath = typeof rawParentPath === 'string' ? rawParentPath : '';

    const pageSlug = slugify(title.toLowerCase()); // Use imported slugify
    // Ensure fullSlug doesn't start with a slash if parentPath is empty
    const fullSlug = parentPath ? `${parentPath}/${pageSlug}` : pageSlug;

    if (fullSlug.includes('..') || !/^[a-z0-9-/]*$/.test(fullSlug)) {
       return NextResponse.json({ message: 'Invalid generated slug.' }, { status: 400 });
    }

    const filePath = path.join(contentDocsPath, `${fullSlug}.mdx`);
    const dirPath = path.dirname(filePath);

    try {
      await fs.access(filePath);
      return NextResponse.json({ message: `File already exists at ${fullSlug}.mdx` }, { status: 409 });
    } catch (accessError) { /* OK */ }
    await fs.mkdir(dirPath, { recursive: true });
    const fileContent = matter.stringify(`# ${title}\n\nNew page content goes here.`, { title }); // Use gray-matter to set frontmatter

    await fs.writeFile(filePath, fileContent, 'utf-8');

    let navigationData: NavigationNode[] = [];
    try {
        const jsonData = await fs.readFile(navigationFilePath, 'utf-8');
        navigationData = JSON.parse(jsonData);
    } catch (readError) {
        console.warn("Could not read navigation.json, starting with empty array:", readError); 
        // Initialize with empty array if file doesn't exist or is unreadable
        navigationData = [];
    }

    const newNode: NavigationNode = {
        type: 'link',
        name: title,
        href: `/docs/${fullSlug.startsWith('/') ? fullSlug.substring(1) : fullSlug}` // Ensure href doesn't start with //docs/
    };

    // Slugify segments of parent path for comparison
    const parentPathSegments = parentPath ? parentPath.split('/').map(seg => slugify(seg.toLowerCase())) : [];
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
        console.warn(`Could not insert node into navigation for parent '${parentPath}'. Adding to root.`);
        if (!navigationData.some(node => node.href === newNode.href)) {
            navigationData.push(newNode);
        }
    }

    try {
        const updatedJsonData = JSON.stringify(navigationData, null, 2);
        await fs.writeFile(navigationFilePath, updatedJsonData, 'utf-8');
    } catch (writeError) {
         console.error("Could not write updated navigation.json:", writeError);
         // Don't throw here if MDX was created, but log the error
    }

    return NextResponse.json({ success: true, message: `Page created at ${fullSlug}.mdx and navigation updated.`, path: `/docs/${fullSlug.startsWith('/') ? fullSlug.substring(1) : fullSlug}` });

  } catch (error: unknown) { // Changed any to unknown
    console.error("API Error creating page or updating navigation:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
} 