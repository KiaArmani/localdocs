<a href="https://prose-ui-docs-starter.vercel.app" >
  <img alt="Prose UI social image" src="https://repository-images.githubusercontent.com/897893154/12074360-f0b7-47f3-b1ec-10ef71fdbf0c" />
</a>

## Prose UI Docs Starter with Inline Editing

This is a documentation starter template based on [Prose UI](https://prose-ui.com) and [Next.js](https://nextjs.org), enhanced with **inline MDX editing capabilities** for local development.

[Preview original template](https://prose-ui-docs-starter.vercel.app)

## Tech stack

[Next.js 15](https://nextjs.org)\
The backbone of the site, using the App Router.

[React 19](https://react.dev)\
Powers the user interface.

[@mdxeditor/editor](https://mdxeditor.dev)\
The core WYSIWYG Markdown editor component.

[Prose UI](https://prose-ui.com)\
Provides components and styles for building clean, MDX-powered documentation.

[TailwindCSS](https://tailwindcss.com)\
Facilitates flexible and efficient styling.

[Shadcn UI](https://ui.shadcn.com)\
Provides accessible UI components (Dialog, Button, Input, etc.).

[Content Collections](https://www.content-collections.dev)\
Processes MDX files and frontmatter during the build.

[gray-matter](https://github.com/jonschlinkert/gray-matter)\
Used for parsing and updating frontmatter in MDX files.

[MDX v3](https://mdxjs.com)\
Combines Markdown and JSX for interactive, component-based content.

---

## Key features

**Inline WYSIWYG Editor (Development Mode Only)**\
- Toggle between View and Edit modes.
- Edit MDX content and frontmatter directly in the browser using `@mdxeditor/editor`.
- Edit the corresponding navigation entry name (`navigation.json`).
- Save content changes back to the local filesystem via API routes.
- Create new documentation pages and automatically update navigation.
- Upload images directly into content (saved to `public/img/uploads/`).
- *Note: All editing features are disabled in production builds.*

**Dark mode**\
Light and dark modes powered by [next-themes](https://github.com/pacocoursey/next-themes).

**Content folder**\
Content (MDX files and `navigation.json`) lives in the `content/docs/` folder.

**Live Table of Contents Sync**\
A TOC component automatically updates as headings are edited in the content.

**Code highlighting**\
[Shiki](https://shiki.style/)-powered server-side code highlighting (via Prose UI).

**Hierarchical sidenav**\
Organize your navigation into categories, folders, and files via `navigation.json`.

**Customizable theme**\
Customize the look and feel using pre-defined [CSS variables](https://prose-ui.com/docs/styling).

**Fast Performance**\
Built with Next.js for optimized performance.

**Search**&#x20;\
Coming soon

**API reference docs**\
Coming soon

# Get started

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Use the toggle in the top navigation to switch to Edit Mode.

## Deployment

This project is configured for **Static HTML Export**. This means the build process generates plain HTML, CSS, and JavaScript files that can be hosted on any static hosting provider.

**Important:** The inline editing features (editor UI, save/create/upload API functionality) are automatically disabled when the application is built for production (`NODE_ENV=production`) and **will not work** in the static export, as they require a server runtime.

### Build

Run the following command to build the application for static export:

```bash
pnpm build
```

This will generate a static site in the `out` directory.

### Local Testing of Static Build

After building, you can test the static output locally using a simple server like `serve`:

```bash
# Install serve globally if you haven't already
pnpm add -g serve

# Serve the output directory
serve out
```

Open the local URL provided by `serve` in your browser.

### Deploying on Cloudflare Pages

This project is well-suited for deployment on Cloudflare Pages using its static site hosting capabilities.

1.  Log in to the Cloudflare dashboard and select your account.
2.  Go to **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
3.  Select your GitHub repository and click **Begin setup**.
4.  In the **Build settings**, select **Next.js (Static HTML Export)** as the **Framework preset**. This should automatically configure the correct settings:
    *   **Build command:** `pnpm build` (or `npx next build` if `pnpm` isn't auto-detected)
    *   **Build output directory:** `out`
5.  Deploy your site.

Refer to the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#deploy-using-static-html-export) for more details.

### Other Static Hosts

You can deploy the contents of the `out` directory to any other static hosting provider (like Vercel static deployments, Netlify, GitHub Pages, etc.) by configuring their deployment settings accordingly.
