'use client';

import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  id?: string;
  maxEmbeddedWidth?: number;
  maxEmbeddedHeight?: number;
}

// Initialize Mermaid for client-side rendering
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
  });
}

const Mermaid: FC<MermaidProps> = ({ chart, id, maxEmbeddedWidth = 900, maxEmbeddedHeight = 600 }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLargeDiagram, setIsLargeDiagram] = useState(false);
  const uniqueId = id || `mermaid-diagram-${Math.random().toString(36).substring(7)}`;
  
  // Handle rendering the Mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !svgContainerRef.current) return;
      
      try {
        const { svg, bindFunctions } = await mermaid.render(uniqueId, chart);
        
        if (!svgContainerRef.current) return;
        
        // Set the HTML content
        svgContainerRef.current.innerHTML = svg;
        
        // Apply any mermaid bindings
        if (bindFunctions) {
          bindFunctions(svgContainerRef.current);
        }
        
        // Check if the diagram is "large"
        const svgElement = svgContainerRef.current.querySelector('svg');
        if (svgElement) {
          // Use getBoundingClientRect for cross-browser compatibility
          const rect = svgElement.getBoundingClientRect();
          const svgWidth = rect.width;
          const svgHeight = rect.height;
          
          // If the diagram exceeds the max dimensions, mark it as large
          if (svgWidth > maxEmbeddedWidth || svgHeight > maxEmbeddedHeight) {
            setIsLargeDiagram(true);
            
            // Generate image data URL for use when opening in new tab
            createImageDataUrl(svgElement);
          }
        }
        
        setHasRendered(true);
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error);
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = '<p class="text-red-500">Error rendering Mermaid diagram. Check console.</p>';
        }
      }
    };
    
    renderDiagram();
  }, [chart, uniqueId, maxEmbeddedWidth, maxEmbeddedHeight]);

  // Create image data URL from SVG for opening in new tab
  const createImageDataUrl = (svgElement: SVGElement) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get the SVG dimensions using getBoundingClientRect
      const rect = svgElement.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Set canvas size (with higher resolution for better quality)
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      // Create an image from the SVG
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const img = new Image();
      img.onload = () => {
        // Draw with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to PNG and set the data URL
        const dataUrl = canvas.toDataURL('image/png');
        setImageDataUrl(dataUrl);
        
        // Clean up
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (error) {
      console.error('Error creating image data URL:', error);
    }
  };

  // Open the diagram as an image in a new tab
  const openInNewTab = () => {
    if (!imageDataUrl) return;
    
    const newWindow = window.open();
    if (!newWindow) {
      alert("Pop-up blocked. Please allow pop-ups for this site to open the diagram in a new tab.");
      return;
    }
    
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mermaid Diagram</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f5f5f5;
            }
            img {
              max-width: 98%;
              max-height: 98vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${imageDataUrl}" alt="Mermaid Diagram" />
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  return (
    <>
      {/* Main diagram container */}
      <div className="mt-4 mb-6">
        <div 
          ref={svgContainerRef} 
          id={`container-${uniqueId}`} 
          className="mermaid-diagram-container rounded-md border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900" 
        />
      </div>
      
      {/* Notification banner for large diagrams */}
      {isLargeDiagram && (
        <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" title="Information">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            This is a large diagram. You can 
            <button 
              type="button"
              className="mx-1 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              onClick={openInNewTab}
              disabled={!imageDataUrl}
            >
              open it in a new tab
            </button>
            for better viewing.
          </p>
        </div>
      )}
    </>
  );
};

export default Mermaid;