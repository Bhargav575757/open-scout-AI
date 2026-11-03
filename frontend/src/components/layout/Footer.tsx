import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              OpenScout
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              AI-Powered Open Source Project Finder
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
          <Link to="/" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Dashboard
          </Link>
          <Link to="/discover" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Discover
          </Link>
          <Link to="/compare" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Compare
          </Link>
          <Link to="/history" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            History
          </Link>
          <Link to="/settings" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Settings
          </Link>
        </div>

        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for open source discovery</span>
        </div>
      </div>
    </footer>
  )
}

