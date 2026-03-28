import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VoxClone AI — Clone Any Voice Instantly',
  description:
    'Clone any voice in seconds with AI. Upload a 10–30 second sample and generate natural human-like speech from any text.',
  keywords: ['voice cloning', 'AI voice', 'text to speech', 'voice synthesis'],
  openGraph: {
    title: 'VoxClone AI',
    description: 'Clone any voice instantly with AI',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-obsidian text-platinum font-body antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a26',
              color: '#e8e8f0',
              border: '1px solid #222232',
              fontFamily: 'var(--font-body)',
            },
            success: { iconTheme: { primary: '#ff4d1c', secondary: '#0a0a0f' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
          }}
        />
      </body>
    </html>
  )
}
