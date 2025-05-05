'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Cards from '@/components/cards'
import { Toc } from '@/components/navigation/toc'
import { InlineMdxEditor } from '@/components/editor/InlineMdxEditor'
import { mdxComponents } from '@prose-ui/next'
import { allPages } from 'content-collections'
import pathModule from 'path'
import { useEditMode } from '@/contexts/EditModeContext'
import { useSaveContext } from '@/contexts/SaveContext'

// Define TocEntry used internally for parsing
interface TocEntry {
  text: string;
  id: string;
  level: number;
}

// Define the Section type expected by the actual Toc component
// (Ideally this would be imported from where Toc defines it)
interface Section {
  title: string;
  id: string;
  depth: number; // Changed from level
}

type PageProps = {
  params: Promise<{ path: string[] }>;
}

// Simple regex to find markdown headings
const headingRegex = /^(#{1,6})\s+(.*)/gm;

export default function Page({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const pagePathArray = resolvedParams.path ?? [];
  const joinedPath = pagePathArray.join('/');

  const { isEditing } = useEditMode();
  const { registerSaveHandler, setSaveStatus } = useSaveContext();

  // Lifted markdown state
  const [markdown, setMarkdown] = useState<string>('');
  const [frontmatter, setFrontmatter] = useState<Record<string, any>>({});
  const [tocSections, setTocSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setTocSections([]);
      const slugPath = joinedPath || 'index';
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
        if (isMounted) {
          setMarkdown(fetchedRawDoc.content);
          setFrontmatter(fetchedRawDoc.data || {});
          // Initial TOC parsing happens in the other useEffect
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load doc data:", err);
          setError(err.message || "Error loading document content.");
          setMarkdown(''); // Clear markdown on error
          setFrontmatter({});
          setTocSections([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; }; // Cleanup function
  }, [joinedPath]);

  // Parse markdown for TOC whenever it changes
  useEffect(() => {
    const newTocSections: Section[] = [];
    headingRegex.lastIndex = 0;
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Decode space entities and unescape hash symbols
      const text = rawText.replace(/&#x20;/g, ' ').replace(/\#/g, '#');
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'section';
      newTocSections.push({ depth: level, title: text, id });
    }
    setTocSections(newTocSections);
  }, [markdown]);

  // Handler for editor changes
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    setMarkdown(newMarkdown);
  }, []);

  // Actual Save Logic - Registered with context
  const executeSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: pagePathArray, // Use slug from page params
          content: markdown,     // Use current markdown state
          frontmatter: frontmatter, // Use current frontmatter state
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save document');
      }
      setSaveStatus('saved', 'Document saved!');
    } catch (error: any) {
      console.error("Save error in Page:", error);
      setSaveStatus('error', error.message || 'An unexpected error occurred.');
    }
  }, [markdown, frontmatter, pagePathArray, setSaveStatus]); // Dependencies needed for the save logic

  // Register the save handler on mount/when logic changes
  useEffect(() => {
    registerSaveHandler(executeSave);
    // Optional cleanup if needed
    // return () => registerSaveHandler(async () => {});
  }, [registerSaveHandler, executeSave]);

  if (loading) {
    return (
      <div className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !markdown) {
    return (
      <div className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <p>{error || "Document not found."}</p>
      </div>
    );
  }

  return (
    <>
      <article className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <InlineMdxEditor
          key={joinedPath}
          markdown={markdown}
          onChange={handleMarkdownChange}
          frontmatter={frontmatter}
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
