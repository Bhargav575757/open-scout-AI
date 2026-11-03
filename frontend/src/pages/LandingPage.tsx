import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Search,
  Cpu,
  Layers,
  GitCompare,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
} from 'lucide-react'
import { SearchBar } from '../components/search/SearchBar'
import { ExamplePrompts } from '../components/search/ExamplePrompts'
import { DEMO_DATA_BADGE_TEXT } from '../data/mockData'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  const handleSearch = (query: string) => {
    navigate(`/discover?q=${encodeURIComponent(query)}`)
  }

  const handleSelectPrompt = (prompt: string) => {
    navigate(`/discover?q=${encodeURIComponent(prompt)}`)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-violet-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{DEMO_DATA_BADGE_TEXT}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
          Discover Open Source Projects{' '}
          <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
            That Match Your Ideas
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Describe the stack, architecture, or concept you want to build in plain English.
          OpenScout matches your intent against real GitHub repositories with AI-powered relevance ranking.
        </p>

        {/* Large Natural-Language Search Box */}
        <div className="max-w-3xl mx-auto pt-4 space-y-4">
          <SearchBar
            size="large"
            onSearch={handleSearch}
            placeholder="e.g. I want to build an AI healthcare chatbot using Python, FastAPI and React. I am a beginner..."
          />
          <ExamplePrompts onSelectPrompt={handleSelectPrompt} />
        </div>

        {/* Quick Trust Pillars */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Verified Active Repositories
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Mistral Intent Parsing
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-violet-500" />
            Beginner-to-Advanced Filters
          </span>
        </div>
      </section>

      {/* How OpenScout Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400">
            Intelligent Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            How OpenScout Works
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            From freeform developer query to production-ready open-source architectural blueprints in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Express Intent',
              desc: 'Type natural language queries specifying language preferences, libraries, experience level, or use case.',
              icon: MessageSquare,
            },
            {
              step: '02',
              title: 'AI Intent Extraction',
              desc: 'Mistral AI parses constraints, dependencies, target domains, and architectural patterns.',
              icon: Cpu,
            },
            {
              step: '03',
              title: 'Semantic Vector Match',
              desc: 'Dense embeddings match repositories on deep conceptual relevance, not just superficial keywords.',
              icon: Layers,
            },
            {
              step: '04',
              title: 'Compare & Build',
              desc: 'Evaluate side-by-side matrices, read AI summaries, and jumpstart your project with confidence.',
              icon: GitCompare,
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-3 hover:border-violet-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-zinc-300 dark:text-zinc-800">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-zinc-100/50 dark:bg-zinc-900/20 border-y border-zinc-200 dark:border-zinc-800/80 rounded-3xl my-10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400">
            Engineered for Developers
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Key Platform Capabilities
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Eliminate hours of manual browsing across GitHub search pages and stale repositories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Contextual AI Explanations',
              desc: 'Every recommendation includes a synthesized justification detailing why it aligns with your architectural constraints.',
              badge: 'Mistral Powered',
            },
            {
              title: 'Interactive Multi-Repo Comparison',
              desc: 'Compare tech stacks, documentation completeness, stars, difficulty, and licenses in a unified side-by-side view.',
              badge: 'Client-Side State',
            },
            {
              title: 'Targeted Experience Filtering',
              desc: 'Filter between Beginner starter templates with tutorials and Advanced microservice frameworks.',
              badge: 'Quality Ranked',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                {feat.badge}
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {feat.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Developers Use OpenScout */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-10">
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400">
            Proven Efficiency
          </span>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Why Developers Use OpenScout
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Traditional repository search only matches names and tags. OpenScout understands intent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">10x</span>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 mb-1">Faster Discovery</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Find production-quality boilerplates and frameworks without trial-and-error repository clones.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">94%</span>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 mb-1">Documentation Score</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Recommendations highlight repositories with verified READMEs, setup scripts, and clean typing.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">0 min</span>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 mb-1">Setup Overhead</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Read preview summaries, examine dependencies, and compare licenses right in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center mb-16">
        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-600/10 via-zinc-900/60 to-zinc-950 p-8 sm:p-12 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-violet-600/25">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Ready to find your next open-source project?
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            Explore curated repositories, test natural-language search queries, and compare frameworks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition-all shadow-md shadow-violet-600/25 cursor-pointer"
            >
              <span>Explore Discover Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
            >
              <span>Open Dashboard</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

