import React from 'react'
import { Link } from 'react-router-dom'
import { Star, GitFork, ExternalLink, ArrowRight, Sparkles, Check, Plus, Clock, Scale } from 'lucide-react'
import type { Repository } from '../../types'
import { Badge } from '../common/Badge'
import { useComparison } from '../../context/ComparisonContext'

interface RepositoryCardProps {
  repository: Repository
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  const { isCompared, toggleComparison } = useComparison()
  const repoIdStr = repository.id.toString()
  const compared = isCompared(repoIdStr)

  const formatStars = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString()
  }

  const avatar = repository.ownerAvatar || repository.owner_avatar_url
  const githubLink = repository.githubUrl || repository.html_url || (repository.full_name ? `https://github.com/${repository.full_name}` : '#')
  const updatedDate = repository.lastUpdated || (repository.updated_at ? new Date(repository.updated_at).toLocaleDateString() : 'Recently')
  const licenseText = repository.license || 'Unspecified'

  return (
    <div className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 md:p-6 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={repository.owner}
                className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500 font-bold flex items-center justify-center text-sm">
                {(repository.owner && repository.owner[0]?.toUpperCase()) || 'G'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {repository.owner}/
                </span>
                {repository.difficulty ? (
                  <Badge variant="difficulty" difficulty={repository.difficulty}>
                    {repository.difficulty}
                  </Badge>
                ) : (
                  <Badge variant="accent">
                    GitHub Repo
                  </Badge>
                )}
                {repository.similarity_score != null && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    {Math.round(repository.similarity_score * 100)}% Match
                  </span>
                )}
                {repository.is_indexed && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    RAG Ready
                  </span>
                )}
              </div>
              <Link
                to={`/repository/${encodeURIComponent(repository.full_name || repository.id)}`}
                className="text-lg font-bold text-zinc-900 dark:text-zinc-50 hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-flex items-center gap-1.5"
              >
                {repository.name}
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 font-medium bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              {formatStars(repository.stars)}
            </span>
            <span className="inline-flex items-center gap-1 font-medium bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md">
              <GitFork className="w-3.5 h-3.5 text-zinc-400" />
              {formatStars(repository.forks)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
          {repository.description || 'No description provided by the repository maintainer.'}
        </p>

        {/* Why this matches section (AI Callout or Live GitHub Match) */}
        <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-500/20 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span>{repository.matchReason ? 'Why this matches your criteria' : 'Live GitHub Match'}</span>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-normal">
            {repository.matchReason || `Matched on GitHub via repository keywords, topics, and documentation analysis.`}
          </p>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {repository.language && <Badge variant="accent">{repository.language}</Badge>}
          {(repository.topics || []).slice(0, 4).map((topic) => (
            <Badge key={topic} variant="default">
              #{topic}
            </Badge>
          ))}
          {(repository.topics || []).length > 4 && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 self-center">
              +{(repository.topics || []).length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {updatedDate}
          </span>
          <span className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            {licenseText}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare Button */}
          <button
            type="button"
            onClick={() => toggleComparison(repoIdStr)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              compared
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
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
                <span>Compare</span>
              </>
            )}
          </button>

          {/* View on GitHub */}
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="View on GitHub"
            aria-label="View on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Details Link */}
          <Link
            to={`/repository/${encodeURIComponent(repository.full_name || repository.id)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
