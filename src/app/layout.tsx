import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { TopNav } from '@/components/navigation/topnav'
import { DevModeProviders } from '@/contexts/DevModeProviders'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Motion',
  description: 'Documentation starter template with Next.js and Prose UI. Free and open-source.',
  openGraph: {
    type: 'website',
    title: 'Motion',
    description: 'Documentation starter template with Next.js and Prose UI. Free and open-source.',
    url: 'https://motionco.re',
  },
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon-dark.svg',
      media: '(prefers-color-scheme: light)',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon-light.svg',
      media: '(prefers-color-scheme: dark)',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-color-base min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class">
          <DevModeProviders>
            <div className="flex min-h-screen flex-col">
              <TopNav />
              <div className="flex flex-1">
                {children}
              </div>
            </div>
          </DevModeProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
