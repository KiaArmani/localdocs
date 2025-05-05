'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  thematicBreakPlugin as thematicBreakPluginToolbar,
  MDXEditorMethods, // Ensure MDXEditorMethods is imported
} from '@mdxeditor/editor';

// Import default CSS
import '@mdxeditor/editor/style.css';

// Import the save context hook
import { useSaveContext, type SaveState } from '@/contexts/SaveContext';

// Assuming components like Callout and Cards are used
// We might need to import the actual components if descriptors need specifics
// import { Callout, Cards } from '@/components/???'; // Adjust path if needed

// Update GenericJsxEditor to accept JsxEditorProps
const GenericJsxEditor = (props: JsxEditorProps) => {
  // Display basic info for the placeholder
  return (
    <div style={{ border: '1px dashed #ccc', padding: '8px', margin: '8px 0', borderRadius: '4px' }}>
      <strong style={{ display: 'block', marginBottom: '4px', color: '#555' }}>
        Component: {props.mdastNode.name || 'JSX'}
      </strong>
      {/* Indicate presence of children if applicable */}
      {props.mdastNode.children && props.mdastNode.children.length > 0 && (
        <div style={{ marginLeft: '16px', borderLeft: '2px solid #eee', paddingLeft: '8px' }}>
          {/* Children are rendered by the editor framework */}
        </div>
      )}
    </div>
  );
};

// Refine descriptors for components used in index.mdx
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
    kind: 'flow', // Can contain other block/flow elements
    // The 'content' prop is complex (array), difficult to represent simply here.
    // For rendering, we mainly need name and kind.
    props: [{ name: 'content', type: 'expression' }], // Indicate complex prop
    hasChildren: false, // Cards itself doesn't take MDX children
    Editor: GenericJsxEditor
  },
  {
    name: 'Frame',
    kind: 'flow', // Can contain other block/flow elements like Image
    props: [
      { name: 'align', type: 'string' },
      { name: 'caption', type: 'string' },
    ],
    hasChildren: true, // Frame wraps children (e.g., Image)
    Editor: GenericJsxEditor
  },
  {
    name: 'Image',
    kind: 'text', // Often used like an inline element within text/Frame
    props: [
      { name: 'src', type: 'string' },
      { name: 'width', type: 'number' },
      { name: 'alt', type: 'string' },
    ],
    hasChildren: false,
    Editor: GenericJsxEditor
  },
];

interface InlineMdxEditorProps {
  markdown: string;
  frontmatter: Record<string, any>;
  slug: string[];
  isEditing: boolean;
}

// Toolbar component - Update editorRef type to allow null
const SimpleToolbar = ({
  components,
  editorRef,
}: {
  components: any;
  editorRef: React.RefObject<MDXEditorMethods | null>; // Allow null
}) => {
  if (!components) return null;

  return (
    <components.ToolbarRoot>
      {/* Standard formatting buttons */}
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
      <components.Separator />

      {/* Undo/Redo Example (using components directly) */}
      <components.Undo />
      <components.Redo />
    </components.ToolbarRoot>
  );
};

export function InlineMdxEditor({
  markdown: initialMarkdown,
  frontmatter: initialFrontmatter,
  slug,
  isEditing
}: InlineMdxEditorProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [frontmatter, setFrontmatter] = useState(initialFrontmatter);

  // Use save context
  const { registerSaveHandler, setSaveStatus } = useSaveContext();

  const editorRef = React.useRef<MDXEditorMethods>(null);

  // The actual save logic remains here but is registered via context
  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug,
          content: markdown,
          frontmatter: frontmatter,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save document');
      }
      setSaveStatus('saved', 'Document saved!'); // Status handled by context now
    } catch (error: any) {
      console.error("Save error:", error);
      setSaveStatus('error', error.message || 'An unexpected error occurred.');
    }
  }, [markdown, frontmatter, slug, setSaveStatus]);

  // Register the save handler with the context
  useEffect(() => {
    registerSaveHandler(handleSave);
    // Cleanup function if needed, though likely not for this registration
    // return () => registerSaveHandler(() => Promise.resolve());
  }, [registerSaveHandler, handleSave]); // Rerun if handler changes

  useEffect(() => {
    setMarkdown(initialMarkdown);
    setFrontmatter(initialFrontmatter);
    // Reset context save state on navigation?
    // setSaveStatus('idle'); // Maybe not - keep status across navigations?
  }, [initialMarkdown, initialFrontmatter]);

  return (
    <div className="prose dark:prose-invert max-w-none w-full">
      <MDXEditor
        ref={editorRef}
        key={slug.join('/')}
        markdown={markdown}
        onChange={isEditing ? setMarkdown : undefined}
        readOnly={!isEditing}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
          toolbarPlugin({
            toolbarContents: isEditing ? (components) => (
              <SimpleToolbar
                components={components}
                editorRef={editorRef}
              />
            ) : () => null
          }),
          jsxPlugin({
            jsxComponentDescriptors: defaultJsxComponents,
          })
        ]}
        className="dark:prose-invert prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl font-sans prose-p:font-sans"
        contentEditableClassName="prose dark:prose-invert max-w-none"
      />
    </div>
  );
} 