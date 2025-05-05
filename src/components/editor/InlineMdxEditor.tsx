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
  // // Import slash command plugin // <-- REMOVED
  // slashCommandPlugin,
  // // Import actions for slash commands // <-- REMOVED
  // InsertCodeBlock,
  // InsertImage,
  // InsertTable,
  // InsertThematicBreak,
  // Import necessary types for headings
  // type HeadingNode,
  // $isHeadingNode,
  // $getRoot,
  // type ToolbarComponents, // Re-add ToolbarComponents type // <-- REMOVED (and was likely incorrect anyway)
  // Toolbar components
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  UndoRedo,
} from '@mdxeditor/editor';

// Import default CSS
import '@mdxeditor/editor/style.css';

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
  onChange: (markdown: string) => void;
}

// // Toolbar component - Requires components and editorRef (allowing null) // <-- REMOVED
// const SimpleToolbar = ({
//   components,
//   editorRef,
// }: {
//   components: any; // Use any for now
//   editorRef: React.RefObject<MDXEditorMethods | null>;
// }) => {
//   if (!components) return null;
//   return (
//     <components.ToolbarRoot>
//        {/* Keep standard buttons */}
//        <components.H1 />
//        <components.H2 />
//        <components.H3 />
//        <components.Separator />
//        <components.BulletedList />
//        <components.OrderedList />
//        <components.Separator />
//        <components.Blockquote />
//        <components.ThematicBreak />
//        <components.Separator />
//        <components.CreateLink />
//        <components.CodeBlock />
//        <components.Separator />
//        <components.Undo />
//        <components.Redo />
//     </components.ToolbarRoot>
//   );
// };

export function InlineMdxEditor({
  markdown: initialMarkdown,
  frontmatter: initialFrontmatter,
  slug,
  isEditing,
  onChange,
}: InlineMdxEditorProps) {
  // Internal state for frontmatter only
  const [frontmatter, setFrontmatter] = useState(initialFrontmatter);
  const editorRef = React.useRef<MDXEditorMethods | null>(null);

  // Reset internal frontmatter state on prop change
  useEffect(() => {
    setFrontmatter(initialFrontmatter);
  }, [initialFrontmatter]);

  return (
    <div className="prose dark:prose-invert max-w-none w-full">
      <MDXEditor
        ref={editorRef}
        key={slug.join('/')}
        markdown={initialMarkdown}
        onChange={isEditing ? onChange : undefined}
        readOnly={!isEditing}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
          jsxPlugin({
            jsxComponentDescriptors: defaultJsxComponents,
          }),
          // Toolbar - configured to only show when isEditing is true
          toolbarPlugin({
            toolbarContents: isEditing ? () => (
              // Use the directly imported toolbar components
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <ListsToggle />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak/>
                <Separator />
                <InsertCodeBlock />
              </>
            ) : () => null // Render nothing if not editing
          }),
        ]}
        className="dark:prose-invert prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl font-sans prose-p:font-sans"
        contentEditableClassName="prose dark:prose-invert max-w-none"
      />
    </div>
  );
} 