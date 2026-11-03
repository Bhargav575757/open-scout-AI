import React from 'react'
import {
  Sparkles,
  Code2,
  Layers,
  Cpu,
  Star,
  BookOpen,
  Compass,
  Tag,
} from 'lucide-react'
import type { ProjectRequirements } from '../../types'

interface RequirementsCardProps {
  requirements: ProjectRequirements
  onApplyLanguageFilter?: (lang: string) => void
}

export const RequirementsCard: React.FC<RequirementsCardProps> = ({
  requirements,
  onApplyLanguageFilter,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'advanced':
        return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
    }
  }

  return (
    <div className="rounded-2xl border border-violet-500/20 dark:border-violet-500/30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-5 shadow-lg shadow-violet-500/5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Understanding your requirements
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                Mistral AI
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Natural language criteria extracted from your project description
            </p>
          </div>
        </div>

        {requirements.github_search_query && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
            <span className="text-zinc-400">GitHub Query:</span>
            <code className="font-semibold text-violet-600 dark:text-violet-400 font-mono">
              {requirements.github_search_query}
            </code>
          </div>
        )}
      </div>

      {/* AI Summary Quote */}
      {requirements.summary && (
        <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-violet-50/50 dark:bg-violet-950/15 p-3 rounded-xl border border-violet-100 dark:border-violet-900/40 italic">
          &ldquo;{requirements.summary}&rdquo;
        </p>
      )}

      {/* Structured Criteria Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {/* Domain */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <Compass className="w-3 h-3 text-violet-500" />
            <span>Domain</span>
          </div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {requirements.domain || 'General Software'}
          </p>
        </div>

        {/* Project Type */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <Cpu className="w-3 h-3 text-violet-500" />
            <span>Project Type</span>
          </div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {requirements.project_type || 'Application'}
          </p>
        </div>

        {/* Difficulty */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <Tag className="w-3 h-3 text-violet-500" />
            <span>Difficulty</span>
          </div>
          <span
            className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyColor(
              requirements.difficulty
            )}`}
          >
            {requirements.difficulty}
          </span>
        </div>

        {/* Minimum Stars */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <Star className="w-3 h-3 text-amber-500" />
            <span>Min Stars</span>
          </div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {requirements.min_stars ? `${requirements.min_stars.toLocaleString()}+ ⭐` : 'Any stars'}
          </p>
        </div>

        {/* Programming Languages */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1 col-span-2 sm:col-span-1 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <Code2 className="w-3 h-3 text-blue-500" />
            <span>Languages</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {requirements.programming_languages.length > 0 ? (
              requirements.programming_languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onApplyLanguageFilter && onApplyLanguageFilter(lang)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100 cursor-pointer"
                  title={`Filter by ${lang}`}
                >
                  {lang}
                </button>
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">Any language</span>
            )}
          </div>
        </div>

        {/* Frameworks */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1 col-span-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            <Layers className="w-3 h-3 text-emerald-500" />
            <span>Frameworks</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {requirements.frameworks.length > 0 ? (
              requirements.frameworks.map((fw) => (
                <span
                  key={fw}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                >
                  {fw}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">None specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Extra Row: Technologies & Documentation */}
      {(requirements.technologies.length > 0 || requirements.documentation_preference) && (
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-zinc-100 dark:border-zinc-800/60">
          {requirements.technologies.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-zinc-400 font-medium">Technologies:</span>
              {requirements.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {requirements.documentation_preference && (
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <BookOpen className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span>{requirements.documentation_preference}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
