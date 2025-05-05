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
  // Import slash command plugin
  // slashCommandPlugin,
  // Import necessary types for headings
  // type HeadingNode,
  // $isHeadingNode,
  // $getRoot,
  type ToolbarComponents, // Re-add ToolbarComponents type
} from '@mdxeditor/editor';

// Import default CSS
import '@mdxeditor/editor/style.css';

// Import the save context hook
import { useSaveContext, type SaveState } from '@/contexts/SaveContext';

// Assuming components like Callout and Cards are used
// We might need to import the actual components if descriptors need specifics
// import { Callout, Cards } from '@/components/???'; // Adjust path if needed

// Import Lexical functions directly
import { $getRoot, LexicalNode, EditorState } from 'lexical';

// Import $isHeadingNode and HeadingNode from @lexical/rich-text
import { $isHeadingNode, HeadingNode } from '@lexical/rich-text';

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

// Type for TOC entries
export interface TocEntry {
  text: string;
  id: string;
  level: number;
}

interface InlineMdxEditorProps {
  markdown: string;
  frontmatter: Record<string, any>;
  slug: string[];
  isEditing: boolean;
  onHeadingsChange?: (headings: TocEntry[]) => void; // Callback prop
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
  isEditing,
  onHeadingsChange, // Destructure callback
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

  // Effect to listen for editor updates and extract headings
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !onHeadingsChange) { return; }

    const extractHeadingsFromState = (editorState: EditorState) => {
      const headings: TocEntry[] = [];
      editorState.read(() => {
        const root = $getRoot(); // Correct usage
        root.getChildren().forEach(node => {
          if ($isHeadingNode(node)) { // Correct usage
            headings.push({
              level: parseInt((node as HeadingNode).getTag().substring(1), 10), // Correct usage
              text: node.getTextContent(),
              id: node.getTextContent().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'section'
            });
          }
          // Add basic recursive check for headings inside other container nodes (e.g., list items, blockquotes)
          // This is still simplified and might miss some edge cases.
          else if (node.getChildren) {
            node.getChildren().forEach(child => {
              if ($isHeadingNode(child)) {
                headings.push({
                  level: parseInt((child as HeadingNode).getTag().substring(1), 10),
                  text: child.getTextContent(),
                  id: child.getTextContent().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'section'
                });
              }
            });
          }
        });
      });
      onHeadingsChange(headings);
    };

    if (typeof editor.registerUpdateListener === 'function') {
      const unregister = editor.registerUpdateListener(({ editorState }) => {
        extractHeadingsFromState(editorState);
      });

      const editorState = editor.getEditorState();
      if (editorState) {
         extractHeadingsFromState(editorState);
      }

      return () => { unregister(); };
    } else {
      console.warn("registerUpdateListener is not available on the editor ref.");
    }

  }, [editorRef, onHeadingsChange]);

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
            toolbarContents: isEditing ? (components: ToolbarComponents) => (
              <SimpleToolbar components={components} editorRef={editorRef} />
            ) : () => null
          }),
          jsxPlugin({
            jsxComponentDescriptors: defaultJsxComponents,
          }),
          // Temporarily remove slashCommandPlugin until correct import is found
          // slashCommandPlugin({})
        ]}
        className="dark:prose-invert prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl font-sans prose-p:font-sans"
        contentEditableClassName="prose dark:prose-invert max-w-none"
      />
    </div>
  );
} 