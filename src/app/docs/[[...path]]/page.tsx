'use client';

import Cards from '@/components/cards'
import { Toc } from '@/components/navigation/toc'
import { InlineMdxEditor } from '@/components/editor/InlineMdxEditor'
import { getRawDocBySlug } from '@/lib/docs'
import { mdxComponents } from '@prose-ui/next'
import { allPages } from 'content-collections'
import pathModule from 'path'
import { useEditMode } from '@/contexts/EditModeContext'
import React, { useEffect, useState } from 'react'

type PageProps = {
  params: { path: string[] }
}

export default function Page({ params }: PageProps) {
  const { isEditing } = useEditMode();
  const pagePathArray = params.path ?? [];

  const [rawDoc, setRawDoc] = useState<{ content: string; data: Record<string, any> } | null>(null);
  const [pageMeta, setPageMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const slugToFetch = pagePathArray.length === 0 ? ['index'] : pagePathArray;
        const fetchedRawDoc = await getRawDocBySlug(slugToFetch);
        setRawDoc(fetchedRawDoc);

        const path = pagePathArray.length > 0 ? `/${pagePathArray.join('/')}` : '/'
        let fetchedPageMeta = allPages.find((page) => page.path === path);

        if (!fetchedPageMeta) {
          fetchedPageMeta = {
            title: pathModule.basename(pagePathArray.join('/') || 'index'),
            toc: [],
            path: path
          } as any;
        }
        setPageMeta(fetchedPageMeta);

      } catch (err) {
        console.error("Failed to load doc data:", err);
        setError("Error loading document content.");
        setRawDoc(null);
        setPageMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagePathArray]);

  if (loading) {
    return (
      <div className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !rawDoc) {
    return (
      <div className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <p>{error || "Document not found."}</p>
      </div>
    );
  }

  const tocSections = pageMeta?.toc ?? [];

  return (
    <>
      <article className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <InlineMdxEditor
          key={pagePathArray.join('/')}
          markdown={rawDoc.content}
          slug={pagePathArray}
          isEditing={isEditing}
        />
      </article>

      <div className="sticky top-[var(--topnav-height)] hidden h-[calc(100vh-var(--topnav-height))] w-[var(--toc-width)] shrink-0 flex-col pt-[var(--article-padding-t)] lg:flex">
        <Toc sections={tocSections} />
      </div>
    </>
  )
}
