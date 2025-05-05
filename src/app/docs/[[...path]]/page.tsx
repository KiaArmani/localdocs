import Cards from '@/components/cards'
import { Toc } from '@/components/navigation/toc'
import { InlineMdxEditor } from '@/components/editor/InlineMdxEditor'
import { getRawDocBySlug } from 'content-collections'
import { mdxComponents } from '@prose-ui/next'
import { allPages } from 'content-collections'
import { Metadata } from 'next'
import pathModule from 'path'

type Params = { path: string[] }
type Props = {
  params: Params
}

const findPage = (pathArr: string[]) => {
  const path = pathArr ? `/${pathArr.join('/')}` : '/'
  return allPages.find((page) => page.path === path)
}

export async function generateStaticParams() {
  return allPages.map((page) => ({
    path: page.path.slice(1).split('/'),
  }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const path = params.path ?? []
  let page = findPage(path)
  const title = page ? `${page.title} - Prose UI Docs Starter` : 'Prose UI Docs Starter'
  return {
    title,
  }
}

export default async function Page({ params }: { params: Params }) {
  const pagePathArray = params.path ?? []

  let pageMeta = findPage(pagePathArray)

  let rawDoc
  try {
    const slugToFetch = pagePathArray.length === 0 ? ['index'] : pagePathArray
    rawDoc = await getRawDocBySlug(slugToFetch)
  } catch (error) {
    console.error("Failed to load raw doc:", error)
    return (
      <div className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <p>Error loading document content.</p>
      </div>
    )
  }

  if (!pageMeta) {
    pageMeta = {
      title: pathModule.basename(pagePathArray.join('/') || 'index'),
      toc: [],
    } as any
  }

  return (
    <>
      <article className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <InlineMdxEditor markdown={rawDoc.content} />
      </article>

      <div className="sticky top-[var(--topnav-height)] hidden h-[calc(100vh-var(--topnav-height))] w-[var(--toc-width)] shrink-0 flex-col pt-[var(--article-padding-t)] lg:flex">
        <Toc sections={pageMeta.toc} />
      </div>
    </>
  )
}
