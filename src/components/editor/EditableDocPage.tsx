'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
// Removed: import Cards from '@/components/cards' - Not used directly here, part of MDX components
import { Toc } from '@/components/navigation/toc';
import { InlineMdxEditor } from '@/components/editor/InlineMdxEditor';
// Removed: import { mdxComponents } from '@prose-ui/next' - Handled by InlineMdxEditor or passed to it
// Removed: import { allPages } from 'content-collections' - Data is passed as props
// Removed: import pathModule from 'path' - Not used directly here

import { useEditMode } from '@/contexts/EditModeContext';
import { useSaveContext } from '@/contexts/SaveContext';
import { useNavigation } from '@/contexts/NavigationContext';
import type { NavigationNode } from '@/contexts/NavigationContext'; // Used import type

// Define the Section type expected by the Toc component
interface Section {
  title: string;
  id: string;
  depth: number;
}

// Define the specific Frontmatter type expected by InlineMdxEditor
type EditorFrontmatter = Record<string, string | string[] | number | boolean | Date | null>;

// Props for the editable page
type EditableDocPageProps = {
  initialRawMarkdown: string;
  initialFrontmatter: EditorFrontmatter; // Use the specific type
  pagePathArray: string[];
  initialTocSections: Section[];
};

const headingRegex = /^(#{1,6})\s+(.*)/gm;

export default function EditableDocPage({
  initialRawMarkdown,
  initialFrontmatter,
  pagePathArray,
  initialTocSections
}: EditableDocPageProps) {
  const { isEditing } = useEditMode(); // Assumes EditModeProvider is ancestor
  const { registerSaveHandler, setSaveStatus } = useSaveContext(); // Assumes SaveProvider is ancestor
  const { navigation, updateNavigationNodeName, isLoading: isNavLoading, error: navError } = useNavigation(); // Assumes NavigationProvider is ancestor

  const [markdown, setMarkdown] = useState<string>(initialRawMarkdown);
  const [frontmatter, setFrontmatter] = useState<EditorFrontmatter>(initialFrontmatter); // Use the specific type for state
  const [tocSections, setTocSections] = useState<Section[]>(initialTocSections);

  const isMountedRef = React.useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Client-side TOC generation based on editor's markdown content
  useEffect(() => {
    if (!isEditing) {
      // Logic for non-editing TOC updates (can be left as is or refined)
    }
    const newTocSections: Section[] = [];
    headingRegex.lastIndex = 0; // Reset regex state
    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-constant-condition
    while (true) { // Modified loop structure
      match = headingRegex.exec(markdown);
      if (match === null) {
        break;
      }
      const level = match[1].length;
      const rawText = match[2].trim();
      // Basic decoding and ID generation (copied from original page.tsx)
      let decodedText = rawText;
      try {
        // This check is important because document might not be available in all environments
        // However, this is a 'use client' component, so document should be available.
        if (typeof document !== 'undefined') {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = rawText; // Use rawText for decoding
            decodedText = textarea.value;
        }
      } catch (e) {
        console.warn("[TOC Decode] Error decoding HTML entities:", e);
      }
      const finalText = decodedText.replace(/\\([#*_`[\]()])/g, '$1'); // Remove Markdown escapes
      const id = finalText
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^a-z0-9-]/g, '') || 'section'; // Remove non-alphanumeric characters
      newTocSections.push({ depth: level, title: finalText, id });
    }
    if (isMountedRef.current) {
        setTocSections(newTocSections);
    }
  }, [markdown, isEditing]); // Rerun when markdown changes or edit mode toggles

  // Handler for editor changes
  const handleMarkdownChange = useCallback((newMarkdown: string) => {
    if (isMountedRef.current) {
      setMarkdown(newMarkdown);
    }
  }, []); // Removed isMountedRef from deps as it's a ref

  // Save Logic
  const executeSave = useCallback(async () => {
    if (!isMountedRef.current) return;
    setSaveStatus('saving');
    try {
      console.log('[EditableDocPage] Saving with pagePathArray:', pagePathArray);
      const response = await fetch('/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: pagePathArray,
          content: markdown, // Current raw markdown from state
          frontmatter: frontmatter, // Current frontmatter from state
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save document');
      }
      if (isMountedRef.current) {
        setSaveStatus('saved', 'Document saved!');
      }
      // Potentially trigger a re-fetch or update of initialTocSections from server if needed,
      // but client-side TOC parsing will update it based on new markdown.
    } catch (error: unknown) { // Changed any to unknown
      console.error("Save error in EditableDocPage:", error);
      if (isMountedRef.current) {
        setSaveStatus('error', (error instanceof Error ? error.message : String(error)) || 'An unexpected error occurred.');
      }
    }
  }, [markdown, frontmatter, pagePathArray, setSaveStatus]);

  useEffect(() => {
    if (isEditing) { // Only register save handler if in edit mode
        registerSaveHandler(executeSave);
    } else {
        // Optionally, unregister or provide a no-op save handler
        // registerSaveHandler(async () => {});
    }
    // Cleanup could also unregister if registerSaveHandler returns an unregister function
  }, [registerSaveHandler, executeSave, isEditing]);

  // Logic to find and update currentNavName (copied from original page.tsx)
  const joinedPath = pagePathArray.join('/');
  // Construct base href, remove /index if present, ensure /docs for root
  let tempHref = `/docs/${joinedPath || ''}`.replace(/\/index$/, '');
  if (tempHref === '/docs/') tempHref = '/docs'; // for root /docs
  if (tempHref.endsWith('/') && tempHref.length > 1 && tempHref !== '/docs') { // Avoid stripping from '/docs'
    tempHref = tempHref.slice(0, -1);
  }
  const currentPageHref = tempHref || '/docs'; // Default to /docs if path is empty (index)

  const findNodeNameByHref = useCallback((nodes: NavigationNode[], targetHref: string): string | undefined => {
    for (const node of nodes) {
      if (node.type === 'link' && node.href === targetHref) {
        return node.name;
      }
      if (node.children) {
        const foundName = findNodeNameByHref(node.children, targetHref);
        if (foundName) return foundName;
      }
    }
    return undefined;
  }, []);

  const currentNavName = useMemo(() => {
      if (isNavLoading || !navigation || navigation.length === 0) return "";
      const foundName = findNodeNameByHref(navigation, currentPageHref);
      // console.log("Editable: currentNavName found:", foundName, "for href:", currentPageHref);
      return foundName || "";
  }, [navigation, isNavLoading, currentPageHref, findNodeNameByHref]);

  // The initial data fetching (useEffect with fetch API) from original page.tsx is removed
  // as data is now passed via props. Loading and error states related to that fetch are also removed.
  // The parent Server Component will handle data fetching errors (e.g., page not found).

  return (
    <>
      <article className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        {isEditing && (
          <div className="mb-4">
            <label htmlFor="pageTitleInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sidebar Navigation Name:
            </label>
            <input
              type="text"
              id="pageTitleInput"
              value={currentNavName}
              onChange={(e) => updateNavigationNodeName(currentPageHref, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter sidebar name..."
              disabled={isNavLoading}
            />
            {navError && <p className="text-red-500 text-xs mt-1">Error loading/updating navigation: {navError}</p>}
          </div>
        )}
        <InlineMdxEditor
          key={joinedPath || 'index'} // Ensure key is stable
          markdown={markdown}
          onChange={handleMarkdownChange}
          frontmatter={frontmatter} // Pass frontmatter if editor uses it
          slug={pagePathArray} 
          isEditing={isEditing}
        />
      </article>

      <div className="sticky top-[var(--topnav-height)] hidden h-[calc(100vh-var(--topnav-height))] w-[var(--toc-width)] shrink-0 flex-col pt-[var(--article-padding-t)] lg:flex">
        <Toc sections={tocSections} /> {/* This TOC will be dynamic in dev */}
      </div>
    </>
  );
} 