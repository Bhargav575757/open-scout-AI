import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass,
  History,
  TrendingUp,
  Tag,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SearchBar } from '../components/search/SearchBar'
import { StatCard } from '../components/common/StatCard'
import {
  mockQuickStats,
  mockSearchHistory,
  mockPopularTechTags,
  mockSuggestedCategories,
  mockRepositories,
} from '../data/mockData'
import { RepositoryCard } from '../components/repository/RepositoryCard'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()

  const handleSearch = (query: string) => {
    navigate(`/discover?q=${encodeURIComponent(query)}`)
  }

  const handleTagClick = (tag: string) => {
    navigate(`/discover?q=${encodeURIComponent(tag)}`)
  }

  const handleCategoryClick = (query: string) => {
    navigate(`/discover?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="Welcome back, Developer"
        description="Search across thousands of open-source projects using conversational intent, or browse curated category blueprints."
        badgeText="Developer Workspace"
        showDemoBadge={true}
      >
        <button
          type="button"
          onClick={() => navigate('/discover')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm shadow-violet-600/20 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Browse Discover</span>
        </button>
      </PageHeader>

      {/* Quick Statistics (Marked as Demo Data) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Platform Telemetry & Metrics (Demo)
          </h2>
          <span className="text-[11px] text-amber-500 font-medium">Static Sample Values</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockQuickStats.map((stat, idx) => (
            <StatCard
              key={stat.label}
              stat={stat}
              icon={
                idx === 0 ? (
                  <Layers className="w-4 h-4 text-violet-500" />
                ) : idx === 1 ? (
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                ) : idx === 2 ? (
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Compass className="w-4 h-4 text-amber-500" />
                )
              }
            />
          ))}
        </div>
      </section>

      {/* Large Project Search Area */}
      <section className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-violet-500/5 via-white dark:via-zinc-900/40 to-transparent space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Search className="w-5 h-5 text-violet-500" />
            Natural-Language Project Discovery
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Describe desired frameworks, architectural requirements, or functional constraints.
          </p>
        </div>

        <SearchBar
          size="large"
          onSearch={handleSearch}
          placeholder="e.g. Full-stack e-commerce starter with Next.js, Stripe, and PostgreSQL..."
        />

        {/* Popular Technology Tags */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" />
            Popular Stacks:
          </span>
          {mockPopularTechTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Suggested Categories & Recent Searches (2 Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suggested Project Categories (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Suggested Project Blueprints
            </h2>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockSuggestedCategories.map((cat) => (
              <div
                key={cat.title}
                onClick={() => handleCategoryClick(cat.query)}
                className="group p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-violet-500/40 hover:bg-violet-50/20 dark:hover:bg-zinc-800/40 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                      {cat.count}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400 truncate">
                  Prompt: &ldquo;{cat.query}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Demo Searches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              Recent Searches
            </h2>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              See full history
            </button>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-3">
            {mockSearchHistory.slice(0, 4).map((hist) => (
              <div
                key={hist.id}
                className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">{hist.date}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {hist.resultsCount} matches
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">
                  &ldquo;{hist.query}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => handleSearch(hist.query)}
                  className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  <span>Search again</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Repositories Highlight */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Trending Recommended Blueprints
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              High documentation scores and verified starter setups.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/discover')}
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <span>Explore all repositories</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockRepositories.slice(0, 2).map((repo) => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      </section>
    </div>
  )
}
