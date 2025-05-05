import { extractMetadata } from '@/lib/extract-metadata'
import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { remarkPlugins } from '@prose-ui/core'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'

const pages = defineCollection({
  name: 'pages',
  directory: 'content/docs',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.optional(z.string()),
  }),
  transform: async (page, ctx) => {
    const { toc, title } = await extractMetadata(page.content)
    const content = await compileMDX(ctx, page, {
      remarkPlugins: remarkPlugins(),
    })
    let path
    if (page._meta.path === 'index') {
      path = ''
    } else if (page._meta.path.endsWith('/index')) {
      path = page._meta.path.slice(0, -6)
    } else {
      path = page._meta.path
    }
    return {
      ...page,
      path: `/${path}`,
      toc,
      title: page.title ?? title,
      content,
    }
  },
})

export default defineConfig({
  collections: [pages],
})

export async function getRawDocBySlug(slug: string[]): Promise<{ content: string; data: Record<string, any> }> {
  const filePath = path.join(process.cwd(), 'content', 'docs', ...slug) + '.mdx'
  try {
    const rawContent = await fs.readFile(filePath, 'utf-8')
    const { content, data } = matter(rawContent)
    return { content, data }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    throw new Error(`Could not read document for slug: ${slug.join('/')}`)
  }
}
