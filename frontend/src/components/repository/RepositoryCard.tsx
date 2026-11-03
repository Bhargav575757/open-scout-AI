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
  const compared = isCompared(repository.id)

  const formatStars = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString()
  }

  return (
    <div className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 md:p-6 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {repository.ownerAvatar ? (
              <img
                src={repository.ownerAvatar}
                alt={repository.owner}
                className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500 font-bold flex items-center justify-center text-sm">
                {repository.owner[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {repository.owner}/
                </span>
                <Badge variant="difficulty" difficulty={repository.difficulty}>
                  {repository.difficulty}
                </Badge>
              </div>
              <Link
                to={`/repository/${repository.id}`}
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
          {repository.description}
        </p>

        {/* Why this matches section (AI Callout) */}
        <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/70 dark:border-violet-500/20 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span>Why this matches your criteria</span>
          </div>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-normal">
            {repository.matchReason}
          </p>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <Badge variant="accent">{repository.language}</Badge>
          {repository.topics.slice(0, 4).map((topic) => (
            <Badge key={topic} variant="default">
              #{topic}
            </Badge>
          ))}
          {repository.topics.length > 4 && (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 self-center">
              +{repository.topics.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {repository.lastUpdated}
          </span>
          <span className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            {repository.license}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Compare Button */}
          <button
            type="button"
            onClick={() => toggleComparison(repository.id)}
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
            href={repository.githubUrl}
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
            to={`/repository/${repository.id}`}
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
