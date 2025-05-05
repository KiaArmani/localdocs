import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function getRawDocBySlug(slug: string[]): Promise<{ content: string; data: Record<string, any> }> {
  const filePath = path.join(process.cwd(), 'content', 'docs', ...slug) + '.mdx';
  try {
    const rawContent = await fs.readFile(filePath, 'utf-8');
    const { content, data } = matter(rawContent);
    return { content, data };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw new Error(`Could not read document for slug: ${slug.join('/')}`);
  }
} 