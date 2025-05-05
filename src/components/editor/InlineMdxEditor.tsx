'use client';

import React, { useState } from 'react';
// Import MDXEditor and necessary plugins
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  codeBlockPlugin, // Basic code block support
  // We'll add more plugins later (JSX, DiffSource, etc.)
} from '@mdxeditor/editor';

// Import default CSS
import '@mdxeditor/editor/style.css';

interface InlineMdxEditorProps {
  markdown: string;
  slug: string[]; // Add slug prop for context/saving later
}

export function InlineMdxEditor({ markdown: initialMarkdown, slug }: InlineMdxEditorProps) {
  // State to hold the current markdown content
  const [markdown, setMarkdown] = useState(initialMarkdown);

  // Basic Toolbar configuration
  const SimpleToolbar = () => (
    <toolbarPlugin.Toolbar>
      <headingsPlugin.toolbarContents.H1 />
      <headingsPlugin.toolbarContents.H2 />
      <headingsPlugin.toolbarContents.H3 />
      <listsPlugin.toolbarContents.BulletedList />
      <listsPlugin.toolbarContents.OrderedList />
      <quotePlugin.toolbarContents.Blockquote />
      <thematicBreakPlugin.toolbarContents.ThematicBreak />
      <linkPlugin.toolbarContents.CreateLink />
      {/* Add Save button later */}
    </toolbarPlugin.Toolbar>
  );

  return (
    // Apply Prose styles for consistent rendering with the rest of the site
    <div className="prose dark:prose-invert max-w-none w-full">
      <MDXEditor
        markdown={markdown}
        onChange={setMarkdown} // Update state when editor content changes
        // Basic set of plugins for initial setup
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          codeBlockPlugin(),
          // Toolbar Plugin - Needs to be configured
          toolbarPlugin({
            toolbarContents: SimpleToolbar // Use the SimpleToolbar component
          }),
          // Add more plugins as needed
        ]}
        // Use prose styles provided by parent
        className="dark:prose-invert prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl font-sans prose-p:font-sans"
        // Pass contentEditableClassName for Prose styling
        contentEditableClassName="prose dark:prose-invert max-w-none"
      />
    </div>
  );
} 