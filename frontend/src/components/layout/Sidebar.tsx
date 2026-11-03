import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  GitCompare,
  History,
  Settings,
  Code2,
  ExternalLink,
} from 'lucide-react'
import { useComparison } from '../../context/ComparisonContext'

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { comparedIds } = useComparison()

  const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Discover Projects', href: '/discover', icon: Compass },
    {
      title: 'Compare',
      href: '/compare',
      icon: GitCompare,
      badge: comparedIds.length > 0 ? comparedIds.length.toString() : undefined,
    },
    { title: 'Search History', href: '/history', icon: History },
    { title: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
            Platform
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  active
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-violet-600 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom informational card */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-500/10 via-zinc-900/40 to-transparent border border-violet-500/20 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-violet-600 dark:text-violet-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 2 Prototype</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
            Interactive client-side simulation. Ready for Phase 3 Mistral & pgvector integration.
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
            <Code2 className="w-3 h-3 text-emerald-500" />
            <span>FastAPI Backend 200 OK</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
          <span>v0.2.0-phase2</span>
          <Link to="/" className="hover:text-violet-500 inline-flex items-center gap-0.5">
            <span>Home</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
