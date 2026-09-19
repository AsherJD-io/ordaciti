import type { Metadata } from "next"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Ordaciti — Public Decision Intelligence',
    template: '%s — Ordaciti',
  },
  description: 'Connecting government projects across time and location to reveal patterns, evidence gaps and system-level questions around public expenditure.',
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
