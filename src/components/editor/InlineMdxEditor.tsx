'use client';

import React, { useState, useEffect } from 'react';
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
  // Import JSX Plugin and related types
  jsxPlugin,
  type JsxComponentDescriptor,
  // Import type for JSX Editor Props
  type JsxEditorProps,
  // Import components for toolbar directly
  headingsPlugin as headingsPluginToolbar,
  listsPlugin as listsPluginToolbar,
  quotePlugin as quotePluginToolbar,
  thematicBreakPlugin as thematicBreakPluginToolbar
} from '@mdxeditor/editor';

// Import default CSS
import '@mdxeditor/editor/style.css';

// Assuming components like Callout and Cards are used
// We might need to import the actual components if descriptors need specifics
// import { Callout, Cards } from '@/components/???'; // Adjust path if needed

// Update GenericJsxEditor to accept JsxEditorProps
const GenericJsxEditor = (props: JsxEditorProps) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '8px', margin: '8px 0' }}>
      <strong>JSX Component: {props.mdastNode.name} (Edit in Source)</strong>
      {/* Render children if the component is supposed to have them */}
      {/* You might need more sophisticated rendering based on props.mdastNode */}
    </div>
  );
};

// Define descriptors for known components with required Editor
const defaultJsxComponents: JsxComponentDescriptor[] = [
  {
    name: 'Callout',
    kind: 'text',
    props: [
      { name: 'type', type: 'string' },
      { name: 'title', type: 'string' },
    ],
    hasChildren: true,
    Editor: GenericJsxEditor
  },
  {
    name: 'Cards',
    kind: 'flow',
    props: [],
    hasChildren: true,
    Editor: GenericJsxEditor
  },
  // Add descriptors for other custom components here
];

interface InlineMdxEditorProps {
  markdown: string;
  slug: string[];
  isEditing: boolean;
}

// Revert SimpleToolbar to accept components prop
// Let TypeScript infer the type of `components`
const SimpleToolbar = ({ components }: { components: any }) => {
  if (!components) return null; // Guard against undefined components

  // Access components directly from the passed prop
  return (
    <components.ToolbarRoot>
      <components.H1 />
      <components.H2 />
      <components.H3 />
      <components.Separator />
      <components.BulletedList />
      <components.OrderedList />
      <components.Separator />
      <components.Blockquote />
      <components.ThematicBreak />
      <components.Separator />
      <components.CreateLink />
      <components.CodeBlock />
      {/* Add Save button later */}
    </components.ToolbarRoot>
  );
};

export function InlineMdxEditor({ markdown: initialMarkdown, slug, isEditing }: InlineMdxEditorProps) {
  // State for editor content - maybe sync changes upward later
  const [markdown, setMarkdown] = useState(initialMarkdown);

  // Add a useEffect to reset content if initialMarkdown changes (e.g., page navigation)
  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  return (
    // Apply Prose styles for consistent rendering with the rest of the site
    <div className="prose dark:prose-invert max-w-none w-full">
      <MDXEditor
        // Key can help ensure reset when navigating between pages
        key={slug.join('/')}
        markdown={markdown}
        // Only allow changes if isEditing is true
        onChange={isEditing ? setMarkdown : undefined}
        // Set the readOnly property based on the inverse of isEditing
        readOnly={!isEditing}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          // Remove sandpackConfig from codeBlockPlugin
          codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
          // Pass the received components correctly to SimpleToolbar
          toolbarPlugin({
            toolbarContents: isEditing ? (components) => <SimpleToolbar components={components} /> : () => null
          }),
          jsxPlugin({
            jsxComponentDescriptors: defaultJsxComponents,
          })
        ]}
        // Use prose styles provided by parent
        className="dark:prose-invert prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl font-sans prose-p:font-sans"
        // Pass contentEditableClassName for Prose styling
        contentEditableClassName="prose dark:prose-invert max-w-none"
      />
    </div>
  );
} 