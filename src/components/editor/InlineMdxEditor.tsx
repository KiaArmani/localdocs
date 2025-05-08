'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Content, Parent } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxAttribute } from 'mdx'; // Import from mdx
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
  jsxPlugin,
  type JsxComponentDescriptor,
  type JsxEditorProps,
  type MDXEditorMethods,
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
  tablePlugin,
  codeMirrorPlugin,
  imagePlugin,
  // Added for nested editor wrappers
  NestedLexicalEditor,
  // Added for inserting JSX
  usePublisher,
  insertJsx$,
  linkDialogPlugin,
  CodeToggle,
  // ShowSandpackInfo, // Commenting out as it might not be used if sandpack is disabled
  // ConditionalContents, // Commenting out as it might not be used if sandpack is disabled
  // ChangeCodeMirrorLanguage, // Commenting out as it might not be used if sandpack is disabled
} from '@mdxeditor/editor';
import { AlertCircle, AlertTriangle, Info, Lightbulb, MessageSquareWarning, Siren } from 'lucide-react'; // Icon for the button AND the alert component

// Import Shadcn UI DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import default CSS
import '@mdxeditor/editor/style.css';

// Import the Shadcn Alert components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Original GenericJsxEditor for components not using wrappers yet
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

// Wrapper for the standard (now "warning") Alert
const AlertEditorWrapper: React.FC<JsxEditorProps> = ({ mdastNode }) => {
  return (
    <Alert
      variant="warning"
      className="mt-4 p-0 py-2 px-3 [&_[contenteditable=true]]:bg-transparent [&_[contenteditable=true]]:my-0"
    >
      <AlertCircle className="h-6 w-6" />
      <AlertDescription className="[&_p]:m-0">
        <NestedLexicalEditor
          getContent={(currentMdastNode) => (currentMdastNode as MdxJsxFlowElement).children || []}
          getUpdatedMdastNode={(currentMdastNode, children) => {
            return { ...(currentMdastNode as MdxJsxFlowElement), children };
          }}
        />
      </AlertDescription>
    </Alert>
  );
};

// Wrapper for ImportantAlert
const ImportantAlertEditorWrapper: React.FC<JsxEditorProps> = ({ mdastNode }) => {
  return (
    <Alert
      variant="important"
      className="mt-4 p-0 py-2 px-3 [&_[contenteditable=true]]:bg-transparent [&_[contenteditable=true]]:my-0"
    >
      <AlertTriangle className="h-6 w-6" />
      <AlertDescription className="[&_p]:m-0">
        <NestedLexicalEditor
          getContent={(currentMdastNode) => (currentMdastNode as MdxJsxFlowElement).children || []}
          getUpdatedMdastNode={(currentMdastNode, children) => {
            return { ...(currentMdastNode as MdxJsxFlowElement), children };
          }}
        />
      </AlertDescription>
    </Alert>
  );
};

// Wrapper for InfoAlert
const InfoAlertEditorWrapper: React.FC<JsxEditorProps> = ({ mdastNode }) => {
  return (
    <Alert
      variant="info"
      className="mt-4 p-0 py-2 px-3 [&_[contenteditable=true]]:bg-transparent [&_[contenteditable=true]]:my-0"
    >
      <Info className="h-6 w-6" />
      <AlertDescription className="[&_p]:m-0">
        <NestedLexicalEditor
          getContent={(currentMdastNode) => (currentMdastNode as MdxJsxFlowElement).children || []}
          getUpdatedMdastNode={(currentMdastNode, children) => {
            return { ...(currentMdastNode as MdxJsxFlowElement), children };
          }}
        />
      </AlertDescription>
    </Alert>
  );
};

// Wrapper for AlertDescription (used by all alert types)
const AlertDescriptionEditorWrapper: React.FC<JsxEditorProps> = ({ mdastNode }) => {
  return (
    <NestedLexicalEditor
      getContent={(currentMdastNode) => (currentMdastNode as MdxJsxFlowElement).children || []}
      getUpdatedMdastNode={(currentMdastNode, children) => {
        return { ...(currentMdastNode as MdxJsxFlowElement), children };
      }}
    />
  );
};

// JsxComponentDescriptors using the wrappers
const defaultJsxComponents: JsxComponentDescriptor[] = [
  {
    name: 'Alert',
    kind: 'flow',
    props: [], // Keeping props empty as we are not defining editable attributes here
    Editor: AlertEditorWrapper,
  },
  {
    name: 'ImportantAlert',
    kind: 'flow',
    props: [],
    Editor: ImportantAlertEditorWrapper,
  },
  {
    name: 'InfoAlert',
    kind: 'flow',
    props: [],
    Editor: InfoAlertEditorWrapper,
  },
  {
    name: 'AlertDescription',
    kind: 'flow',
    props: [],
    Editor: AlertDescriptionEditorWrapper,
    // AlertDescription is complex and typically a child, no getInitialMdastNode needed when inserted this way
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
  frontmatter: Record<string, string | string[] | number | boolean | Date | null>; // More specific than any
  slug: string[];
  isEditing: boolean;
  onChange: (markdown: string) => void;
}

// Updated image upload handler to use the API endpoint
async function imageUploadHandler(image: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', image);

  try {
    const response = await fetch('/api/docs/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ message: `Upload failed with status: ${response.status}` }));
      throw new Error(errorResult.message || 'Image upload failed');
    }

    const result = await response.json();

    if (!result.success || !result.url) {
       throw new Error('API did not return a valid URL');
    }

    console.log(`Image uploaded via API: ${result.url}`);
    return result.url;

  } catch (error) { // Catch as unknown, then check type
    let errorMessage = 'An unknown error occurred during image upload.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error uploading image:", error);
    alert(`Image upload failed: ${errorMessage}`);
    throw error;
  }
}

// New Dropdown Component for Inserting Alerts
const InsertAlertDropdown: React.FC = () => {
  const insertJsx = usePublisher(insertJsx$);

  const alertTypes = [
    {
      name: 'Alert',
      label: 'Warning',
      icon: <MessageSquareWarning className="w-4 h-4 mr-2 text-orange-500" />,
      initialChildren: [
        {
          type: 'mdxJsxFlowElement',
          name: 'AlertDescription',
          attributes: [],
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Heads up!' }] }],
        } as MdxJsxFlowElement,
      ],
    },
    {
      name: 'ImportantAlert',
      label: 'Important',
      icon: <Siren className="w-4 h-4 mr-2 text-red-500" />,
      initialChildren: [
        {
          type: 'mdxJsxFlowElement',
          name: 'AlertDescription',
          attributes: [],
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Important note!' }] }],
        } as MdxJsxFlowElement,
      ],
    },
    {
      name: 'InfoAlert',
      label: 'Info',
      icon: <Lightbulb className="w-4 h-4 mr-2 text-blue-500" />,
      initialChildren: [
        {
          type: 'mdxJsxFlowElement',
          name: 'AlertDescription',
          attributes: [],
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'For your information.' }] }],
        } as MdxJsxFlowElement,
      ],
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Insert Alert Variant"
          className="p-1.5 rounded hover:bg-primary-foreground"
        >
          <MessageSquareWarning className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {alertTypes.map((alertType) => (
          <DropdownMenuItem
            key={alertType.name}
            onClick={() => {
              console.log(`[InsertAlertDropdown] Inserting: name=${alertType.name}, kind=flow, props={}`);
              insertJsx({
                name: alertType.name,
                kind: 'flow',
                props: {},
                children: alertType.initialChildren
              });
            }}
            className="flex items-center cursor-pointer"
          >
            {alertType.icon}
            <span>{alertType.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
      <div className="mdx-editor-wrapper">
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
            linkDialogPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
            jsxPlugin({
              jsxComponentDescriptors: defaultJsxComponents,
            }),
            tablePlugin(),
            codeMirrorPlugin({
              codeBlockLanguages: { tsx: 'TypeScript', css: 'CSS', js: 'JavaScript', cs: 'C#', cpp: 'C++', mermaid: 'text/plain' }
            }),
            imagePlugin({ imageUploadHandler }),
            toolbarPlugin({
              toolbarClassName: 'sticky-editor-toolbar',
              toolbarContents: isEditing ? () => (
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
                  <InsertThematicBreak />
                  <InsertCodeBlock />
                  <Separator />
                  <InsertAlertDropdown />
                </>
              ) : () => null
            }),
          ]}
          className="dark:prose-invert prose-headings:font-display prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl font-sans"
          contentEditableClassName="prose dark:prose-invert max-w-none font-sans [&_img]:outline [&_img]:outline-2 [&_img]:outline-blue-500 [&_img]:cursor-pointer [&_li[class*='_listItemUnchecked_']]:!pl-0 [&_li[class*='_listItemChecked_']]:!pl-0 [&_li[class*='_listItemUnchecked_']_span]:ml-2 [&_li[class*='_listItemChecked_']_span]:ml-2"
        />
      </div>
    </div>
  );
} 