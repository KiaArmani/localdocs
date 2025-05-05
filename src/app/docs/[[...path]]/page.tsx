'use client';

import Cards from '@/components/cards'
import { Toc } from '@/components/navigation/toc'
import { InlineMdxEditor } from '@/components/editor/InlineMdxEditor'
import { mdxComponents } from '@prose-ui/next'
import { allPages } from 'content-collections'
import pathModule from 'path'
import { useEditMode } from '@/contexts/EditModeContext'
import React, { useEffect, useState, useRef } from 'react'

type PageProps = {
  params: { path: string[] }
}

export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const pagePathArray = resolvedParams.path ?? [];
  const joinedPath = pagePathArray.join('/');

  const { isEditing } = useEditMode();

  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`Page Render #${renderCount.current}: Path Array =`, pagePathArray, `Joined Path = "${joinedPath}"`);

  const [rawDoc, setRawDoc] = useState<{ content: string; data: Record<string, any> } | null>(null);
  const [pageMeta, setPageMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const slugPath = pagePathArray.join('/') || 'index';
      const apiPath = `/api/docs/content/${slugPath}`;

      try {
        const response = await fetch(apiPath);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document not found.');
          } else {
            throw new Error(`API error: ${response.statusText}`);
          }
        }
        const fetchedRawDoc = await response.json();
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

      } catch (err: any) {
        console.error("Failed to load doc data:", err);
        setError(err.message || "Error loading document content.");
        setRawDoc(null);
        setPageMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [joinedPath]);

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
