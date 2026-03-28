'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mic, Wand2, LayoutDashboard, Settings, LogOut, Github } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clone', label: 'Clone Voice', icon: Mic },
  { href: '/tts', label: 'Text to Speech', icon: Wand2 },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-void flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-1 border-r border-white/5 flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ember flex items-center justify-center ember-glow">
              <Mic className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display text-lg font-semibold text-platinum">VoxClone</span>
              <span className="text-ember text-xs font-mono ml-1">AI</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                pathname === href
                  ? 'bg-ember/10 text-ember border border-ember/20'
                  : 'text-silver hover:text-platinum hover:bg-surface-2'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer links */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <a
            href="https://github.com"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-silver hover:text-platinum hover:bg-surface-2 transition-all"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-silver hover:text-platinum hover:bg-surface-2 transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
