import React, { useState } from 'react'
import {
  Moon,
  Sun,
  User,
  Shield,
  Info,
  CheckCircle2,
  Code2,
  Database,
  Key,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { useTheme } from '../context/ThemeContext'

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme()

  // Local demo state for developer profile
  const [profileName, setProfileName] = useState('Senior Full-Stack Architect')
  const [preferredStack, setPreferredStack] = useState('Python, FastAPI, React, TypeScript')
  const [defaultDifficulty, setDefaultDifficulty] = useState('Beginner')
  const [savedMessage, setSavedMessage] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2500)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & Preferences"
        description="Configure appearance themes, developer persona defaults, and review system configuration telemetry."
        badgeText="Preferences"
        showDemoBadge={false}
      />

      {/* Appearance Settings */}
      <section className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <Moon className="w-4 h-4 text-violet-500" />
          <span>Appearance & Color Theme</span>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Select your visual theme. Changes persist across application sessions in browser local storage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              theme === 'dark'
                ? 'border-violet-600 bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold block">Dark Theme</span>
                <span className="text-xs text-zinc-400">Default SaaS dark palette (#09090B)</span>
              </div>
            </div>
            {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0" />}
          </button>

          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              theme === 'light'
                ? 'border-violet-600 bg-violet-500/10 text-violet-600 ring-2 ring-violet-500/20'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white text-amber-500 border border-zinc-200 shadow-xs">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold block">Light Theme</span>
                <span className="text-xs text-zinc-400">Crisp high-contrast developer mode</span>
              </div>
            </div>
            {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0" />}
          </button>
        </div>
      </section>

      {/* Developer Persona & Default Filters */}
      <section className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <User className="w-4 h-4 text-violet-500" />
          <span>Developer Persona & Preferences (Demo UI)</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Developer Title / Persona
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Default Experience Target
              </label>
              <select
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              >
                <option value="Beginner">Beginner (Starter templates & tutorials)</option>
                <option value="Intermediate">Intermediate (Production patterns)</option>
                <option value="Advanced">Advanced (High-scale microservices)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Preferred Core Stacks & Libraries
            </label>
            <input
              type="text"
              value={preferredStack}
              onChange={(e) => setPreferredStack(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm shadow-violet-600/20 cursor-pointer"
            >
              Save Preferences
            </button>
            {savedMessage && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Preferences updated!
              </span>
            )}
          </div>
        </form>
      </section>

      {/* API Configuration Status (Informational UI Only) */}
      <section className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Shield className="w-4 h-4 text-violet-500" />
            <span>API & Backend Connectivity Status (Informational)</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Backend: 127.0.0.1:8000</span>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          OpenScout Phase 2 is decoupled from live AI APIs. Real credentials remain strictly guarded on the backend environment in Phase 3.
        </p>

        <div className="space-y-3 pt-1">
          {/* Mistral API */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Mistral AI API Service
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Requirement extraction, recommendation explanations, RAG chatbot
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Phase 3 Integration
            </span>
          </div>

          {/* GitHub REST API */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  GitHub REST API (v3)
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Live repository crawling, commit frequency, star validation
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Phase 3 Integration
            </span>
          </div>

          {/* PostgreSQL & pgvector */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  PostgreSQL & pgvector
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Vector similarity indexing and repository metadata cache
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">
              Standby
            </span>
          </div>
        </div>
      </section>

      {/* Application Information */}
      <section className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <Info className="w-4 h-4 text-violet-500" />
          <span>Application Information</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-zinc-400 block">Version</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">v0.2.0-phase2</span>
          </div>
          <div>
            <span className="text-zinc-400 block">Architecture Phase</span>
            <span className="font-semibold text-violet-600 dark:text-violet-400">Phase 2: Frontend UI</span>
          </div>
          <div>
            <span className="text-zinc-400 block">Runtime Environment</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">React 19 + Vite 8</span>
          </div>
          <div>
            <span className="text-zinc-400 block">Style Engine</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Tailwind CSS 4</span>
          </div>
        </div>
      </section>
    </div>
  )
}
