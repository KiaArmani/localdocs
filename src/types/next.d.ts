// Fix for Next.js 15 + React 19 type compatibility during build
declare module 'next' {
  export interface PageProps {
    params: { [key: string]: string | string[] | undefined };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}

// Ensure the file is treated as a module
export {}; 