import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowUpDown,
  Filter as FilterIcon,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  FolderGit2,
  Bot,
  SlidersHorizontal,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { SearchBar } from '../components/search/SearchBar'
import { RepositoryCard } from '../components/repository/RepositoryCard'
import { RequirementsCard } from '../components/search/RequirementsCard'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { apiService } from '../services/api'
import { mockExamplePrompts } from '../data/mockData'
import type { Repository, GitHubRepositoryItem, ProjectRequirements } from '../types'

const AVAILABLE_LANGUAGES = [
  'All Languages',
  'Python',
  'TypeScript',
  'JavaScript',
  'Go',
  'Rust',
  'Java',
  'C++',
]

const STAR_OPTIONS = [
  { label: 'All stars', value: 0 },
  { label: '10+ ⭐', value: 10 },
  { label: '50+ ⭐', value: 50 },
  { label: '100+ ⭐', value: 100 },
  { label: '500+ ⭐', value: 500 },
  { label: '1,000+ ⭐', value: 1000 },
]

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialMode = (searchParams.get('mode') as 'ai' | 'direct') || 'ai'

  const [query, setQuery] = useState(initialQuery)
  const [searchMode, setSearchMode] = useState<'ai' | 'direct'>(initialMode)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All Languages')
  const [minStars, setMinStars] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('stars')
  const [page, setPage] = useState<number>(1)
  const perPage = 10

  const [repositories, setRepositories] = useState<Repository[]>([])
  const [extractedRequirements, setExtractedRequirements] = useState<ProjectRequirements | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Map GitHub raw API items to frontend Repository model
  const mapGitHubItemToRepo = (item: GitHubRepositoryItem): Repository => {
    return {
      id: item.id.toString(),
      name: item.name,
      full_name: item.full_name,
      owner: item.owner || 'unknown',
      ownerAvatar: item.owner_avatar_url || undefined,
      owner_avatar_url: item.owner_avatar_url,
      description: item.description || 'No description provided.',
      html_url: item.html_url,
      githubUrl: item.html_url,
      language: item.language || 'Various',
      stars: item.stars ?? item.stargazers_count ?? 0,
      forks: item.forks ?? item.forks_count ?? 0,
      watchers: item.watchers_count || 0,
      openIssues: item.open_issues_count || 0,
      license: item.license || 'Unspecified',
      lastUpdated: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recently',
      updated_at: item.updated_at,
      created_at: item.created_at,
      topics: item.topics || [],
      matchReason:
        searchMode === 'ai' && extractedRequirements
          ? `Discovered via Mistral AI criteria matching "${extractedRequirements.domain || 'concept'}"`
          : `Live GitHub repository matching "${query}"`,
      defaultBranch: item.default_branch || 'main',
      isLiveGitHub: true,
    }
  }

  const executeSearch = useCallback(
    async (
      searchQuery: string,
      mode: 'ai' | 'direct',
      lang: string,
      stars: number,
      sort: string,
      targetPage: number
    ) => {
      const trimmed = searchQuery.trim()
      if (!trimmed) {
        setRepositories([])
        setExtractedRequirements(null)
        setTotalCount(0)
        setHasSearched(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)
      setHasSearched(true)

      try {
        if (mode === 'ai') {
          const aiResponse = await apiService.aiSearch({
            query: trimmed,
            page: targetPage,
            per_page: perPage,
            sort: sort !== 'best-match' ? sort : undefined,
            language_override: lang !== 'All Languages' ? lang : undefined,
            min_stars_override: stars > 0 ? stars : undefined,
          })

          setExtractedRequirements(aiResponse.requirements)
          const mapped = (aiResponse.items || []).map(mapGitHubItemToRepo)
          setRepositories(mapped)
          setTotalCount(aiResponse.total_count || 0)
          setPage(aiResponse.page || targetPage)
        } else {
          setExtractedRequirements(null)
          const response = await apiService.search({
            query: trimmed,
            language: lang !== 'All Languages' ? lang : undefined,
            min_stars: stars > 0 ? stars : undefined,
            sort: sort !== 'best-match' ? sort : undefined,
            page: targetPage,
            limit: perPage,
          })

          const mapped = (response.items || []).map(mapGitHubItemToRepo)
          setRepositories(mapped)
          setTotalCount(response.total_count || 0)
          setPage(response.page || targetPage)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Search request failed'
        setError(msg)
        setRepositories([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    },
    [perPage]
  )

  // Trigger search on mount if query param present
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const m = (searchParams.get('mode') as 'ai' | 'direct') || searchMode
    if (q) {
      setQuery(q)
      setSearchMode(m)
      executeSearch(q, m, selectedLanguage, minStars, sortBy, 1)
    }
  }, [searchParams])

  const handleSearchSubmit = (newQuery: string) => {
    setQuery(newQuery)
    setPage(1)
    setSearchParams(newQuery ? { q: newQuery, mode: searchMode } : {})
    executeSearch(newQuery, searchMode, selectedLanguage, minStars, sortBy, 1)
  }

  const handleModeSwitch = (mode: 'ai' | 'direct') => {
    setSearchMode(mode)
    setPage(1)
    if (query.trim()) {
      setSearchParams({ q: query, mode })
      executeSearch(query, mode, selectedLanguage, minStars, sortBy, 1)
    }
  }

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang)
    setPage(1)
    if (query.trim()) {
      executeSearch(query, searchMode, lang, minStars, sortBy, 1)
    }
  }

  const handleMinStarsChange = (stars: number) => {
    setMinStars(stars)
    setPage(1)
    if (query.trim()) {
      executeSearch(query, searchMode, selectedLanguage, stars, sortBy, 1)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setPage(1)
    if (query.trim()) {
      executeSearch(query, searchMode, selectedLanguage, minStars, newSort, 1)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    executeSearch(query, searchMode, selectedLanguage, minStars, sortBy, newPage)
  }

  const handleResetFilters = () => {
    setSelectedLanguage('All Languages')
    setMinStars(0)
    setSortBy('stars')
    setPage(1)
    if (query.trim()) {
      executeSearch(query, searchMode, 'All Languages', 0, 'stars', 1)
    }
  }

  const totalPages = Math.min(100, Math.ceil(totalCount / perPage))

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Discover GitHub Projects"
        description="Search open-source repositories using natural language AI reasoning with Mistral AI or direct GitHub queries."
        badgeText={searchMode === 'ai' ? 'Powered by Mistral AI' : 'GitHub REST API v3'}
        showDemoBadge={false}
      />

      {/* Mode Switcher Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => handleModeSwitch('ai')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              searchMode === 'ai'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Natural Language</span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded-full bg-violet-500/30 text-white font-mono">
              Mistral
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('direct')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              searchMode === 'direct'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Direct GitHub Search</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 px-2">
          {searchMode === 'ai'
            ? 'Decomposes intent, languages, frameworks, & difficulty with Mistral AI.'
            : 'Performs raw keyword query and qualifiers directly on GitHub API.'}
        </span>
      </div>

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchBar
            initialQuery={query}
            onSearch={handleSearchSubmit}
            placeholder={
              searchMode === 'ai'
                ? 'Describe your project (e.g. "I want a beginner-friendly healthcare chatbot using Python and React")...'
                : 'Search GitHub keywords (e.g. "healthcare chatbot Python React")...'
            }
            isLoading={isLoading}
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
        >
          <FilterIcon className="w-4 h-4 text-violet-500" />
          <span>Filters</span>
          {(selectedLanguage !== 'All Languages' || minStars > 0) && (
            <span className="w-2 h-2 rounded-full bg-violet-600" />
          )}
        </button>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <ArrowUpDown className="w-4 h-4 text-zinc-400" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
          >
            <option value="stars">Sort: Most Stars</option>
            <option value="forks">Sort: Most Forks</option>
            <option value="updated">Sort: Recently Updated</option>
            <option value="best-match">Sort: Best Match</option>
          </select>
        </div>
      </div>

      {/* Main Discover Layout (Filters Sidebar + Repository Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-20 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Filters & Overrides
              </h3>
            </div>
            {(selectedLanguage !== 'All Languages' || minStars > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Programming Language Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Programming Language
            </label>
            <div className="space-y-1">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Stars Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
              Minimum Stars
            </label>
            <div className="space-y-1">
              {STAR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleMinStarsChange(opt.value)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    minStars === opt.value
                      ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Info Card */}
          <div className="p-3.5 rounded-xl bg-violet-500/5 border border-violet-500/15 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-semibold">
              <Bot className="w-3.5 h-3.5" />
              <span>Mistral Intent Engine</span>
            </div>
            <p>
              Natural language queries are decomposed into domains, technologies, and difficulty to search live GitHub projects.
            </p>
          </div>
        </aside>

        {/* Repository Cards Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Search Intent Banner */}
          {query && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-500/20 text-xs">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                <span>
                  {searchMode === 'ai' ? 'AI Search Query:' : 'Direct GitHub Query:'}{' '}
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    &ldquo;{query}&rdquo;
                  </strong>
                  {totalCount > 0 && ` (${totalCount.toLocaleString()} repositories found)`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSearchSubmit('')}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Understanding Your Requirements Section */}
          {searchMode === 'ai' && extractedRequirements && (
            <RequirementsCard
              requirements={extractedRequirements}
              onApplyLanguageFilter={handleLanguageChange}
            />
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold">Search Error</p>
                <p>{error}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => executeSearch(query, searchMode, selectedLanguage, minStars, sortBy, page)}
                    className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-semibold text-[11px] hover:bg-rose-700 cursor-pointer"
                  >
                    Retry
                  </button>
                  {searchMode === 'ai' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('direct')}
                      className="px-2.5 py-1 rounded-md border border-rose-400/40 text-rose-700 dark:text-rose-300 font-semibold text-[11px] hover:bg-rose-500/10 cursor-pointer"
                    >
                      Try Direct GitHub Search Instead
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Content States */}
          {isLoading ? (
            <LoadingState
              message={
                searchMode === 'ai'
                  ? 'Understanding requirements with Mistral AI...'
                  : 'Querying GitHub REST API...'
              }
              subtext={
                searchMode === 'ai'
                  ? 'Decomposing technical constraints, identifying domain, and matching live repositories'
                  : 'Retrieving verified repositories, stargazer counts, and metadata'
              }
            />
          ) : !hasSearched && !query ? (
            <div className="py-12 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Discover Open Source Projects using Natural Language
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                Describe your project idea, architecture, tech stack, or skill level in plain English. Mistral AI extracts your requirements and finds live GitHub repositories.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {mockExamplePrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSearchSubmit(prompt)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-violet-500 cursor-pointer"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          ) : repositories.length === 0 ? (
            <EmptyState
              title="No repositories found"
              description="No public GitHub repositories matched your search query and filters. Try adjusting your description or resetting language/stars filters."
              onAction={handleResetFilters}
              actionLabel="Reset Filters"
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {repositories.map((repo) => (
                  <RepositoryCard key={repo.id} repository={repo} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 pb-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Showing page <strong className="text-zinc-900 dark:text-zinc-100">{page}</strong> of{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100">{totalPages}</strong> ({totalCount.toLocaleString()} results)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || isLoading}
                      onClick={() => handlePageChange(page - 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      disabled={page >= totalPages || isLoading}
                      onClick={() => handlePageChange(page + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white dark:bg-zinc-900 h-full p-5 overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Filters & Mode
              </h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-400 block mb-2">
                  Search Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('ai')}
                    className={`py-2 rounded-lg text-xs font-semibold border ${
                      searchMode === 'ai'
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    AI Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('direct')}
                    className={`py-2 rounded-lg text-xs font-semibold border ${
                      searchMode === 'direct'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    Direct
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-zinc-400 block mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  {AVAILABLE_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-zinc-400 block mb-2">
                  Minimum Stars
                </label>
                <select
                  value={minStars}
                  onChange={(e) => handleMinStarsChange(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                >
                  {STAR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-xs shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
