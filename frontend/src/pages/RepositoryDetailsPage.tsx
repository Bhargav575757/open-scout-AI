import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Scale,
  Clock,
  Terminal,
  FileText,
  Plus,
  FolderGit2,
} from 'lucide-react'
import { mockRepositories } from '../data/mockData'
import { Badge } from '../components/common/Badge'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'
import { useComparison } from '../context/ComparisonContext'
import { apiService } from '../services/api'
import { RepositoryChatbot } from '../components/chat/RepositoryChatbot'
import type { Repository } from '../types'

export const RepositoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isCompared, toggleComparison } = useComparison()
  const [copied, setCopied] = useState(false)

  const [repo, setRepo] = useState<Repository | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    // 1. Check if ID matches local mock data (for prototype showcases)
    const mockFound = mockRepositories.find(
      (r) => r.id.toString().toLowerCase() === id.toLowerCase() || (r.full_name && r.full_name.toLowerCase() === id.toLowerCase())
    )

    if (mockFound) {
      setRepo(mockFound)
      setIsLoading(false)
      return
    }

    // 2. Fetch live data from backend GitHub API
    setIsLoading(true)
    setFetchError(null)

    apiService
      .getRepository(id)
      .then((gh) => {
        const mapped: Repository = {
          id: gh.id.toString(),
          name: gh.name,
          full_name: gh.full_name,
          owner: gh.owner || 'unknown',
          ownerAvatar: gh.owner_avatar_url || undefined,
          owner_avatar_url: gh.owner_avatar_url,
          description: gh.description || 'No description provided.',
          html_url: gh.html_url,
          githubUrl: gh.html_url,
          language: gh.language || 'Various',
          stars: gh.stars ?? gh.stargazers_count ?? 0,
          forks: gh.forks ?? gh.forks_count ?? 0,
          watchers: gh.watchers_count || 0,
          openIssues: gh.open_issues_count || 0,
          license: gh.license || 'Unspecified',
          lastUpdated: gh.updated_at ? new Date(gh.updated_at).toLocaleDateString() : 'Recently',
          updated_at: gh.updated_at,
          created_at: gh.created_at,
          topics: gh.topics || [],
          difficulty: 'Intermediate',
          matchReason: `Live public repository retrieved from GitHub.`,
          defaultBranch: gh.default_branch || 'main',
          installationInstructions: `git clone ${gh.html_url}.git\ncd ${gh.name}`,
          readmePreview: `# ${gh.name}\n\n${gh.description || 'No description provided.'}\n\nVisit official repository: ${gh.html_url}`,
          isLiveGitHub: true,
        }
        setRepo(mapped)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Repository not found'
        setFetchError(msg)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [id])

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingState
          message="Retrieving repository metadata from GitHub..."
          subtext="Fetching live commit statistics, maintainer details, and topic tags"
        />
      </div>
    )
  }

  if (fetchError || !repo) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12">
        <button
          type="button"
          onClick={() => navigate('/discover')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>
        <EmptyState
          title="Repository not found"
          description={fetchError || `Unable to locate repository with identifier "${id}".`}
          actionLabel="Return to Discover"
          onAction={() => navigate('/discover')}
        />
      </div>
    )
  }

  const compared = isCompared(repo.id.toString())
  const avatar = repo.ownerAvatar || repo.owner_avatar_url
  const githubLink = repo.githubUrl || repo.html_url || `https://github.com/${repo.full_name || repo.name}`
  const installSnippet = repo.installationInstructions || `git clone ${githubLink}.git\ncd ${repo.name}`

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(installSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Top Back Navigation & Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to repositories</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => toggleComparison(repo.id.toString(), repo)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              compared
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            {compared ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Comparing</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Comparison</span>
              </>
            )}
          </button>

          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Repository Header Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={repo.owner}
                className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500 font-bold flex items-center justify-center text-xl">
                {(repo.owner && repo.owner[0]?.toUpperCase()) || <FolderGit2 className="w-7 h-7" />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                  {repo.owner} /
                </span>
                {repo.difficulty && (
                  <Badge variant="difficulty" difficulty={repo.difficulty}>
                    {repo.difficulty}
                  </Badge>
                )}
                {repo.docQualityScore ? (
                  <Badge variant="score">
                    Doc Score: {repo.docQualityScore}/100
                  </Badge>
                ) : (
                  <Badge variant="accent">
                    GitHub Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {repo.name}
              </h1>
            </div>
          </div>

          {/* GitHub Live Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 font-semibold">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              {repo.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 font-semibold">
              <GitFork className="w-4 h-4 text-zinc-400" />
              {repo.forks.toLocaleString()}
            </span>
            {repo.watchers !== undefined && repo.watchers > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 font-semibold">
                <Eye className="w-4 h-4 text-zinc-400" />
                {repo.watchers.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {repo.description || 'No description provided by repository maintainers.'}
        </p>

        {/* Metadata Strip */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <Badge variant="accent">{repo.language}</Badge>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-zinc-400" />
            License: {repo.license || 'Unspecified'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-zinc-400" />
            Last commit: {repo.lastUpdated}
          </span>
          {repo.openIssues !== undefined && (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              {repo.openIssues} open issues
            </span>
          )}
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repo.topics.map((topic) => (
              <Badge key={topic} variant="default">
                #{topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendation Explanation Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 via-zinc-900/60 to-transparent border border-violet-500/30 space-y-3">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Repository Match & Architecture Summary</span>
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
          {repo.matchReason || `Retrieved via GitHub REST API search. Analyzed topics: ${(repo.topics || []).join(', ') || 'general'}.`}
        </p>
        {repo.suitabilitySummary && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
            {repo.suitabilitySummary}
          </p>
        )}
      </div>

      {/* RAG Repository Documentation Chatbot (Phase 6) */}
      <div className="space-y-3">
        <RepositoryChatbot
          owner={repo.owner}
          repo={repo.name}
          repositoryName={repo.name}
        />
      </div>

      {/* Installation Instructions Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Terminal className="w-4 h-4 text-violet-500" />
            <span>Quick Start Clone Commands</span>
          </div>
          <button
            type="button"
            onClick={handleCopyInstall}
            className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied snippet!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy commands</span>
              </>
            )}
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 overflow-x-auto">
          <pre>{installSnippet}</pre>
        </div>
      </div>

      {/* README Preview */}
      {repo.readmePreview && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <FileText className="w-4 h-4 text-violet-500" />
            <span>Documentation Summary</span>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 font-sans text-sm text-zinc-700 dark:text-zinc-300 space-y-4">
            <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-zinc-200 dark:border-zinc-800">
              {repo.readmePreview}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
