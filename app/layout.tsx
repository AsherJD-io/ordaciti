import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Ordaciti - Public Decision Intelligence',
    template: '%s - Ordaciti',
  },
  description: 'Connecting government projects across time and location to reveal patterns, evidence gaps and system-level questions around public expenditure.',
  metadataBase: new URL('https://ordaciti.vercel.app'),
  icons: {
    icon: '/brand/ordaciti-favicon.png',
  },
  openGraph: {
    title: 'Ordaciti - Public Decision Intelligence',
    description: 'Connecting government projects across time and location to reveal patterns, evidence gaps and system-level questions around public expenditure.',
    images: [
      {
        url: '/brand/ordaciti-og.png',
        width: 1200,
        height: 630,
        alt: 'Ordaciti - Public Decision Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ordaciti - Public Decision Intelligence',
    description: 'Connecting government projects across time and location to reveal patterns, evidence gaps and system-level questions around public expenditure.',
    images: ['/brand/ordaciti-og.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
