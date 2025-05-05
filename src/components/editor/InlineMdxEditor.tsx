'use client';

import React from 'react';

interface InlineMdxEditorProps {
  markdown: string;
  // We'll add slug and other props later
}

export function InlineMdxEditor({ markdown }: InlineMdxEditorProps) {
  // For now, just render the raw markdown content for verification
  return <pre className="whitespace-pre-wrap break-words p-4 border rounded bg-muted/50">{markdown}</pre>;
} 