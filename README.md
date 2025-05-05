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

This project is a standard Next.js application and can be deployed to any hosting provider that supports Node.js.

**Important:** The inline editing features (editor UI, save/create/upload API routes) are automatically disabled when the application is built for production (`NODE_ENV=production`). The deployed version will function as a read-only documentation site.

### Build

Run the following command to build the application for production:

```bash
pnpm build
```

This will generate an optimized build in the `.next` directory.

### Running the Production Server

After building, you can start the production server:

```bash
pnpm start
```

This requires Node.js to be installed on your deployment server.

### Deploying on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Vercel will automatically detect Next.js, run the build command (`pnpm build`), and deploy the optimized output.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details on deploying to Vercel and other platforms.
