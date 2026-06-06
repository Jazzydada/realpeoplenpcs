import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Asaheims RPG Fantasy Generator',
  description: 'NPC-generator med portræt, stats og spilbare hemmeligheder — Asaheims RPG Fantasy Generator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
