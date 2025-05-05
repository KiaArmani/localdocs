'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Import Save icon from lucide-react instead
import { Save } from 'lucide-react';

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

// Define save states
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// Toolbar component including Save button and logic
const SimpleToolbar = ({
  components,
  editorRef,
  currentMarkdown,
  frontmatter,
  slug,
  onSaveStateChange,
}: {
  components: any;
  editorRef: React.RefObject<MDXEditorMethods>;
  currentMarkdown: string;
  frontmatter: Record<string, any>;
  slug: string[];
  onSaveStateChange: (state: SaveState, message?: string) => void;
}) => {
  const handleSave = useCallback(async () => {
    onSaveStateChange('saving');
    try {
      const response = await fetch('/api/docs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug,
          content: currentMarkdown, // Send current markdown state
          frontmatter: frontmatter, // Send current frontmatter
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save document');
      }

      onSaveStateChange('saved', 'Document saved successfully!');
      // Optionally reset state back to idle after a delay
      setTimeout(() => onSaveStateChange('idle'), 2000);
    } catch (error: any) {
      console.error("Save error:", error);
      onSaveStateChange('error', error.message || 'An unexpected error occurred.');
    }
  }, [currentMarkdown, frontmatter, slug, onSaveStateChange]);

  if (!components) return null; // Add guard clause back

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
      <components.Separator />

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="ml-auto p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" // Basic styling, adjust as needed
        aria-label="Save Document"
      >
        {/* Use lucide-react Save icon */}
        <Save className="w-5 h-5" />
      </button>
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
  // Store frontmatter separately - MDXEditor doesn't manage it directly
  // In a real app, you might use a plugin or lift state higher
  const [frontmatter, setFrontmatter] = useState(initialFrontmatter);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  const editorRef = React.useRef<MDXEditorMethods>(null); // Ref for editor methods

  useEffect(() => {
    setMarkdown(initialMarkdown);
    setFrontmatter(initialFrontmatter); // Reset frontmatter on navigation
    setSaveState('idle'); // Reset save state
    setSaveMessage('');
  }, [initialMarkdown, initialFrontmatter]);

  const handleSaveStateChange = useCallback((state: SaveState, message: string = '') => {
    setSaveState(state);
    setSaveMessage(message);
  }, []);

  return (
    <div className="prose dark:prose-invert max-w-none w-full relative">
      {/* Display Save Status */}
      {isEditing && saveState !== 'idle' && (
        <div
          className={`absolute top-0 right-0 mt-12 mr-2 px-2 py-1 text-xs rounded z-20 ${ 
            saveState === 'saving' ? 'bg-yellow-100 text-yellow-800' :
            saveState === 'saved' ? 'bg-green-100 text-green-800' :
            saveState === 'error' ? 'bg-red-100 text-red-800' : ''
          }`}
        >
          {saveState === 'saving' && 'Saving...'}
          {saveState === 'saved' && ('Saved!' + (saveMessage ? ` ${saveMessage}` : ''))}
          {saveState === 'error' && ('Error: ' + (saveMessage || 'Save failed'))}
        </div>
      )}

      <MDXEditor
        ref={editorRef} // Attach ref
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
                currentMarkdown={markdown}
                frontmatter={frontmatter}
                slug={slug}
                onSaveStateChange={handleSaveStateChange}
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