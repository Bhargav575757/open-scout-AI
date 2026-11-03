import React from 'react'
import { Link } from 'react-router-dom'
import {
  GitCompare,
  Trash2,
  ExternalLink,
  Plus,
  Star,
  GitFork,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/common/Badge'
import { EmptyState } from '../components/common/EmptyState'
import { useComparison } from '../context/ComparisonContext'
import { mockRepositories } from '../data/mockData'

export const ComparePage: React.FC = () => {
  const {
    comparedRepos,
    removeFromComparison,
    clearComparison,
    addToComparison,
    comparedIds,
  } = useComparison()

  const availableToAdd = mockRepositories.filter((r) => !comparedIds.includes(r.id.toString()))

  const handleQuickAdd = (repoId: string) => {
    addToComparison(repoId)
  }

  const handlePopulateDefaults = () => {
    addToComparison('medibot-ai-fastapi')
    addToComparison('health-assistant-core')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Compare Repositories"
        description="Inspect architectural trade-offs, documentation depth, licenses, and stack suitability side-by-side."
        badgeText="Architectural Matrix"
        showDemoBadge={true}
      >
        {comparedRepos.length > 0 && (
          <button
            type="button"
            onClick={clearComparison}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        )}
      </PageHeader>

      {comparedRepos.length === 0 ? (
        <EmptyState
          icon={<GitCompare className="w-8 h-8" />}
          title="No repositories selected for comparison"
          description="Select repositories from the Discover page or click below to populate sample repositories to compare."
          actionLabel="Load Sample Comparison"
          onAction={handlePopulateDefaults}
        />
      ) : (
        <div className="space-y-6">
          {/* Quick Add Bar if < 4 repositories */}
          {comparedRepos.length < 4 && availableToAdd.length > 0 && (
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-violet-500" />
                Add more candidates to matrix (up to 4):
              </span>
              <div className="flex flex-wrap gap-2">
                {availableToAdd.slice(0, 3).map((repo) => (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => handleQuickAdd(repo.id.toString())}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-violet-500 text-zinc-700 dark:text-zinc-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-violet-500" />
                    <span>{repo.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Table Container with Mobile Horizontal Scrolling */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 w-48">
                    Criteria
                  </th>
                  {comparedRepos.map((repo) => (
                    <th key={repo.id} className="p-4 min-w-[240px] align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono block">
                            {repo.owner}
                          </span>
                          <Link
                            to={`/repository/${repo.id}`}
                            className="text-base font-bold text-zinc-900 dark:text-zinc-50 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                          >
                            {repo.name}
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromComparison(repo.id.toString())}
                          className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                          title="Remove from comparison"
                          aria-label={`Remove ${repo.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <a
                          href={repo.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline"
                        >
                          <span>GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                {/* Language */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    Primary Language
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4 font-medium">
                      <Badge variant="accent">{repo.language}</Badge>
                    </td>
                  ))}
                </tr>

                {/* Stars & Forks */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    Stars & Community
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                          {repo.stars.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1 text-zinc-500">
                          <GitFork className="w-3.5 h-3.5" />
                          {repo.forks.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Difficulty */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    Experience Level
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4">
                      <Badge variant="difficulty" difficulty={repo.difficulty}>
                        {repo.difficulty}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* License */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    License
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4 font-mono font-medium">
                      {repo.license}
                    </td>
                  ))}
                </tr>

                {/* Documentation Quality Score */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    Documentation Quality
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="score">
                          {repo.docQualityScore ?? 92} / 100
                        </Badge>
                        <span className="text-[11px] text-zinc-500">
                          {(repo.docQualityScore ?? 92) > 90 ? 'High' : 'Moderate'}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Key Technologies */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    Technologies
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(repo.technologies && repo.technologies.length > 0
                          ? repo.technologies
                          : repo.topics && repo.topics.length > 0
                          ? repo.topics.slice(0, 4)
                          : [repo.language || 'Codebase']
                        ).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Project Suitability */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    Project Suitability
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4 leading-relaxed">
                      <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-500/20">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-1">
                          <Sparkles className="w-3 h-3 text-violet-500" />
                          <span>AI Assessment</span>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300">
                          {repo.suitabilitySummary}
                        </p>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Quick Action */}
                <tr>
                  <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/30">
                    Inspect Blueprint
                  </td>
                  {comparedRepos.map((repo) => (
                    <td key={repo.id} className="p-4">
                      <Link
                        to={`/repository/${repo.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

