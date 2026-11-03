import React, { useState } from 'react'
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
} from 'lucide-react'
import { mockRepositories } from '../data/mockData'
import { Badge } from '../components/common/Badge'
import { useComparison } from '../context/ComparisonContext'

export const RepositoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isCompared, toggleComparison } = useComparison()
  const [copied, setCopied] = useState(false)

  const repository =
    mockRepositories.find((r) => r.id === id) || mockRepositories[0]

  const compared = isCompared(repository.id)

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(repository.installationInstructions)
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
            onClick={() => toggleComparison(repository.id)}
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
            href={repository.githubUrl}
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
            {repository.ownerAvatar ? (
              <img
                src={repository.ownerAvatar}
                alt={repository.owner}
                className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500 font-bold flex items-center justify-center text-xl">
                {repository.owner[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                  {repository.owner} /
                </span>
                <Badge variant="difficulty" difficulty={repository.difficulty}>
                  {repository.difficulty}
                </Badge>
                <Badge variant="score">
                  Doc Score: {repository.docQualityScore}/100
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                {repository.name}
              </h1>
            </div>
          </div>

          {/* GitHub Live Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 font-semibold">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              {repository.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 font-semibold">
              <GitFork className="w-4 h-4 text-zinc-400" />
              {repository.forks.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 font-semibold">
              <Eye className="w-4 h-4 text-zinc-400" />
              {repository.watchers.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {repository.description}
        </p>

        {/* Metadata Strip */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Badge variant="accent">{repository.language}</Badge>
          </span>
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-zinc-400" />
            License: {repository.license}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-zinc-400" />
            Last commit: {repository.lastUpdated}
          </span>
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-zinc-400" />
            {repository.openIssues} open issues
          </span>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-2">
          {repository.topics.map((topic) => (
            <Badge key={topic} variant="default">
              #{topic}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Recommendation Explanation Section (Placeholder) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 via-zinc-900/60 to-transparent border border-violet-500/30 space-y-3">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>AI Architectural Recommendation Summary</span>
        </div>
        <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
          {repository.matchReason}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
          {repository.suitabilitySummary}
        </p>
      </div>

      {/* Installation Instructions Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Terminal className="w-4 h-4 text-violet-500" />
            <span>Installation Instructions</span>
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
          <pre>{repository.installationInstructions}</pre>
        </div>
      </div>

      {/* README Preview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <FileText className="w-4 h-4 text-violet-500" />
          <span>README.md Preview</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 font-sans text-sm text-zinc-700 dark:text-zinc-300 space-y-4">
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm">
            <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-zinc-200 dark:border-zinc-800">
              {repository.readmePreview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
