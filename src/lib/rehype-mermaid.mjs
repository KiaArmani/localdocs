import { visit } from 'unist-util-visit';

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 */

/**
 * Rehype plugin to transform <pre><code> blocks with class 'language-mermaid'
 * into a div that can be targeted by a React component for Mermaid rendering.
 */
export default function rehypeMermaid() {
  /**
   * @param {Root} tree
   */
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'pre' && parent && typeof index === 'number') {
        const codeNode = node.children.find(
          (child) => child.type === 'element' && child.tagName === 'code'
        );

        if (codeNode && codeNode.type === 'element') {
          const className = codeNode.properties?.className;
          const language = Array.isArray(className) ? className.find(cls => String(cls).startsWith('language-')) : null;

          if (language === 'language-mermaid') {
            // Extract the Mermaid code string
            let mermaidCode = '';
            visit(codeNode, 'text', (textNode) => {
              mermaidCode += textNode.value;
            });

            if (mermaidCode.trim()) {
              console.log(`[rehype-mermaid] Found mermaid block. Code snippet: ${mermaidCode.substring(0, 100)}...`);
              // Create a new node for our Mermaid component
              // The component will expect the code as a 'chart' prop.
              const mermaidNode = {
                type: 'element',
                tagName: 'div', // This will be replaced by the component name by next-mdx-remote
                properties: {
                  'data-mermaid-code': mermaidCode, // Store code for the component
                  className: ['mermaid-placeholder'] // Class for styling or identification
                },
                children: [
                  // Optionally, include the original code as a fallback or for SSR
                  // For client-side only rendering of Mermaid, this might not be needed
                  // or could be hidden with CSS.
                  // {
                  //   type: 'element',
                  //   tagName: 'pre',
                  //   properties: {},
                  //   children: [
                  //     {
                  //       type: 'element',
                  //       tagName: 'code',
                  //       properties: { className: ['language-mermaid'] },
                  //       children: [{ type: 'text', value: mermaidCode }]
                  //     }
                  //   ]
                  // }
                ]
              };
              
              // Replace the original <pre> node with the new <div> node.
              // next-mdx-remote will map this div to our <Mermaid> component if we 
              // name the component 'div' in the components mapping, or more typically,
              // we use a custom tag name like 'MermaidDiagramPlaceholder' and map that.
              // For now, we make it a div and will tell next-mdx-remote to map it via a prop.
              // A cleaner way is to use MDX components directly: <Mermaid chart={...} />
              // but processing code blocks requires this AST transformation.

              // To make it more robust for next-mdx-remote, we'll create an MDX ESM node
              // This allows us to directly specify the component and its props.
              const mdxJsxElementNode = {
                type: 'mdxJsxFlowElement',
                name: 'Mermaid', // This MUST match the key in the components prop for MDXRemote
                attributes: [
                  {
                    type: 'mdxJsxAttribute',
                    name: 'chart',
                    value: mermaidCode
                  }
                ],
                children: []
              };

              console.log('[rehype-mermaid] Transformed to mdxJsxFlowElement:', JSON.stringify(mdxJsxElementNode));

              parent.children.splice(index, 1, mdxJsxElementNode);
              return 'skip'; // Skip further processing of this node's children
            }
            if (!mermaidCode.trim()) {
              console.warn('[rehype-mermaid] Found language-mermaid block, but it was empty.');
            }
          } else if (language) {
            // console.log(`[rehype-mermaid] Found other language block: ${language}`);
          }
        }
      }
    });
  };
} 