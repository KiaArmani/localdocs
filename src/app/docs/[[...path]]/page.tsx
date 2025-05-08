// 'use client'; // Removed: This is now a Server Component

import React, { Suspense } from 'react'; // React and Suspense for React.lazy
import { allPages } from 'content-collections'; // For generateStaticParams and fetching data
import { Toc } from '@/components/navigation/toc';
import { mdxComponents, Frame, Image } from '@prose-ui/next'; // For static MDX rendering
import Cards from '@/components/cards'; // Import local Cards component
import { notFound } from 'next/navigation'; // For handling page not found
import { MDXRemote } from 'next-mdx-remote/rsc'; // Import MDXRemote
import rehypeExternalLinks from 'rehype-external-links'; // Added this import
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'; // Import icons

// Dynamically import the editor component for development only
// Note: React.lazy can only be used in Client Components or parent Server Components that use Suspense.
// This component (Page) is a Server Component.
const EditableDocPage = React.lazy(() => import('@/components/editor/EditableDocPage'));

// Define the Section type expected by the Toc component (if not imported globally)
interface Section {
  title: string;
  id: string;
  depth: number;
}

// Define a more specific type for the page object coming from allPages
// This should align with the return type of the transform function in content-collections.ts
interface ContentPage {
  _meta: { path: string; [key: string]: unknown }; // Changed any to unknown
  rawContent: string;
  content: React.ElementType | string; // Compiled content could be a component or HTML string
  title: string | null;
  toc: Section[];
  path: string;
  frontmatter?: Record<string, unknown>; // Optional frontmatter
  [key: string]: unknown; // Changed any to unknown
}

// 1. Implement generateStaticParams
export async function generateStaticParams() {
  return allPages.map((page: ContentPage) => { // Added ContentPage type to page
    const pathSegments = page.path.split('/').filter(Boolean);
    if (page.path === '/') {
        return { path: [] };
    }
    return { path: pathSegments };
  });
}

// Temporary simple components for testing MDX mapping
// const MyTestAlert = (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => <div style={{border: '2px solid red', padding: '10px'}} {...props} />;
// const MyTestAlertDescription = (props: React.PropsWithChildren<React.HTMLAttributes<HTMLParagraphElement>>) => <p style={{color: 'blue'}} {...props} />;

// Temporary simple component for testing MDX mapping - ignores children
/* REMOVED MyTestAlert definition
const MyTestAlert = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{border: '2px solid green', padding: '10px', margin: '5px'}} {...props}>
    MINIMAL ALERT CONTENT
  </div>
);
*/

// --- Wrapper components for production MDX rendering of Alert variants ---

// Original Alert (Orange/Warning)
const WarningAlertProd = (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
  <Alert variant="warning" {...props}>
    <AlertCircle className="h-6 w-6" />
    {props.children}
  </Alert>
);

// Important Alert (Red)
const ImportantAlertProd = (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
  <Alert variant="important" {...props}>
    <AlertTriangle className="h-6 w-6" />
    {props.children}
  </Alert>
);

// Info Alert (Blue)
const InfoAlertProd = (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
  <Alert variant="info" {...props}>
    <Info className="h-6 w-6" />
    {props.children}
  </Alert>
);

// Combine standard Prose UI components with locally defined ones
const finalMdxComponents = {
  ...mdxComponents,
  Cards,
  Frame,
  Image,
  // Map MDX tags to the new production wrapper components
  Alert: WarningAlertProd,             // <Alert> tag will use WarningAlertProd
  ImportantAlert: ImportantAlertProd,  // <ImportantAlert> tag
  InfoAlert: InfoAlertProd,            // <InfoAlert> tag
  AlertDescription,                   // Pass through AlertDescription from @/components/ui/alert
  AlertTitle,                         // Pass through AlertTitle from @/components/ui/alert
};

// 2. Page component (Server Component)
export default async function Page({ params: initialParams }: { params: { path?: string[] } }) {
  const resolvedParams = await initialParams;
  const pagePathArray = resolvedParams?.path ?? [];
  const lookupPath = pagePathArray.join('/') || 'index';
  const page = allPages.find((p: ContentPage) => p._meta.path === lookupPath) as ContentPage | undefined;

  if (!page) {
    notFound();
  }

  const initialRawMarkdown = page.rawContent;
  const initialFrontmatter = page.frontmatter || {};
  const initialTocSections = page.toc || [];

  if (process.env.NODE_ENV === 'development') {
    // In development, render the editable page (client component)
    return (
      <Suspense fallback={
        <div className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
            <p>Loading Editor...</p>
        </div>
      }>
        <EditableDocPage
          initialRawMarkdown={initialRawMarkdown}
          initialFrontmatter={initialFrontmatter}
          pagePathArray={pagePathArray}
          initialTocSections={initialTocSections}
          // We might need to pass mdxComponents here if EditableDocPage supports it
        />
      </Suspense>
    );
  }

  // In production, render static content using MDXRemote (else block removed)
  return (
    <>
      <article className="prose-ui relative mb-64 min-w-0 flex-1 px-[var(--article-padding-x)] md:px-[var(--article-padding-x-md)] lg:px-[var(--article-padding-x-lg)] xl:px-[var(--article-padding-x-xl)]">
        <MDXRemote
          source={initialRawMarkdown}
          components={finalMdxComponents}
          options={{
            mdxOptions: {
              rehypePlugins: [
                [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
              ],
            },
          }}
        /> {/* Restored to use initialRawMarkdown and finalMdxComponents */}
      </article>

      <div className="sticky top-[var(--topnav-height)] hidden h-[calc(100vh-var(--topnav-height))] w-[var(--toc-width)] shrink-0 flex-col pt-[var(--article-padding-t)] lg:flex">
        <Toc sections={initialTocSections} />
      </div>
    </>
  );
}
