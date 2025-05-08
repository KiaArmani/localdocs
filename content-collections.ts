import { extractMetadata } from '@/lib/extract-metadata'
import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { remarkPlugins } from '@prose-ui/core'

const pages = defineCollection({
  name: 'pages',
  directory: 'content/docs',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.optional(z.string()),
  }),
  transform: async (page, ctx) => {
    const rawMarkdown = page.content;
    const { toc, title } = await extractMetadata(rawMarkdown);
    const compiledContent = await compileMDX(ctx, { ...page, content: rawMarkdown }, {
      remarkPlugins: remarkPlugins(),
    });
    let path: string;
    if (page._meta.path === 'index') {
      path = ''
    } else if (page._meta.path.endsWith('/index')) {
      path = page._meta.path.slice(0, -6)
    } else {
      path = page._meta.path
    }
    return {
      ...page,
      rawContent: rawMarkdown,
      content: compiledContent,
      path: `/${path}`,
      toc,
      title: page.title ?? title,
    }
  },
})

export default defineConfig({
  collections: [pages],
})
