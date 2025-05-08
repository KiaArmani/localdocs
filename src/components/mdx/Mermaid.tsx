'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  id?: string; // Optional ID for the diagram
}

// Initialize Mermaid for client-side rendering
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false, // We will render manually
    theme: 'default', // Or 'dark', 'forest', 'neutral'
    // You can add more global Mermaid configurations here
    // For security, if you allow user-inputted diagrams, consider securityLevel: 'strict' or 'sandbox'
  });
}

const Mermaid: React.FC<MermaidProps> = ({ chart, id }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const uniqueId = id || `mermaid-diagram-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    let isMounted = true;
    if (chart && svgContainerRef.current && !hasRendered) {
      console.log(`[Mermaid Component] Attempting to render Mermaid diagram with ID: ${uniqueId}. Chart snippet: ${chart.substring(0, 100)}...`);
      mermaid.render(uniqueId, chart)
        .then(({ svg, bindFunctions }) => {
          if (isMounted && svgContainerRef.current) {
            console.log(`[Mermaid Component] Diagram ${uniqueId} rendered successfully to SVG string.`);
            svgContainerRef.current.innerHTML = svg;
            if (bindFunctions) {
              console.log(`[Mermaid Component] Binding functions for ${uniqueId}.`);
              bindFunctions(svgContainerRef.current);
            }
            setHasRendered(true);
          }
        })
        .catch(error => {
          if (isMounted) {
            console.error(`[Mermaid Component] Error rendering Mermaid diagram ${uniqueId}:`, error);
            if (svgContainerRef.current) {
              svgContainerRef.current.innerHTML = `<p class="text-red-500">Error rendering Mermaid diagram: ${error.message || 'Unknown error'}. Check console.</p>`;
            }
          }
        });
    } else if (!chart) {
      console.warn(`[Mermaid Component] Chart prop is empty for ID: ${uniqueId}.`);
    } else if (!svgContainerRef.current) {
      console.warn(`[Mermaid Component] svgContainerRef is not available for ID: ${uniqueId}.`);
    } else if (hasRendered) {
      // console.log(`[Mermaid Component] Diagram ${uniqueId} already rendered.`);
    }
    return () => {
      isMounted = false;
      // Optional: Cleanup if needed, though Mermaid's render might handle its own specific cleanup.
      // If re-rendering on chart change, ensure old diagrams are cleared or IDs are truly unique.
      if (svgContainerRef.current) {
        // svgContainerRef.current.innerHTML = ''; // Avoid clearing if we want to keep it on prop changes without re-render
      }
    };
  // Re-run effect if chart content changes. 
  // The hasRendered flag prevents re-rendering if only other props change or on React re-renders not tied to chart input.
  }, [chart, uniqueId, hasRendered]); 

  // Fallback display while rendering or if there's an issue (though error is handled in useEffect)
  return <div ref={svgContainerRef} id={`container-${uniqueId}`} className="mermaid-diagram-container" />;
};

export default Mermaid; 