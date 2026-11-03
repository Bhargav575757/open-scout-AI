import React from 'react'

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />

      <main className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Phase 1: Architecture Initialization
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
          OpenScout
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-normal">
          AI-Powered Open Source Project Finder
        </p>

        <div className="pt-6 border-t border-slate-800/80 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span>React + TypeScript</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>FastAPI Backend</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>Tailwind CSS</span>
        </div>
      </main>
    </div>
  )
}

export default App
