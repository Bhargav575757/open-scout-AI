import React from 'react'
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react'
import type { FilterState, DifficultyLevel } from '../../types'

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (newFilters: FilterState) => void
  onReset: () => void
  totalCount: number
  filteredCount: number
  className?: string
}

const AVAILABLE_LANGUAGES = ['Python', 'TypeScript', 'Go', 'Rust', 'JavaScript']
const STAR_OPTIONS = [
  { label: 'All stars', value: 0 },
  { label: '1,000+ ⭐', value: 1000 },
  { label: '5,000+ ⭐', value: 5000 },
  { label: '10,000+ ⭐', value: 10000 },
  { label: '20,000+ ⭐', value: 20000 },
]
const DIFFICULTY_OPTIONS: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced']
const AVAILABLE_LICENSES = ['MIT', 'Apache-2.0', 'BSD-3-Clause']

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
  className = '',
}) => {
  const toggleLanguage = (lang: string) => {
    const updated = filters.languages.includes(lang)
      ? filters.languages.filter((l) => l !== lang)
      : [...filters.languages, lang]
    onFilterChange({ ...filters, languages: updated })
  }

  const toggleDifficulty = (diff: DifficultyLevel) => {
    const updated = filters.difficulties.includes(diff)
      ? filters.difficulties.filter((d) => d !== diff)
      : [...filters.difficulties, diff]
    onFilterChange({ ...filters, difficulties: updated })
  }

  const toggleLicense = (lic: string) => {
    const updated = filters.licenses.includes(lic)
      ? filters.licenses.filter((l) => l !== lic)
      : [...filters.licenses, lic]
    onFilterChange({ ...filters, licenses: updated })
  }

  const hasActiveFilters =
    filters.languages.length > 0 ||
    filters.minStars > 0 ||
    filters.difficulties.length > 0 ||
    filters.licenses.length > 0 ||
    filters.recentlyUpdatedOnly

  return (
    <aside
      className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Filters
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
            {filteredCount}/{totalCount}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Difficulty Level */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
          Difficulty Level
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY_OPTIONS.map((diff) => {
            const isSelected = filters.difficulties.includes(diff)
            return (
              <button
                key={diff}
                type="button"
                onClick={() => toggleDifficulty(diff)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                {diff}
              </button>
            )
          })}
        </div>
      </div>

      {/* Programming Languages */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
          Programming Language
        </label>
        <div className="space-y-1.5">
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isChecked = filters.languages.includes(lang)
            return (
              <label
                key={lang}
                className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 py-0.5 select-none"
              >
                <div
                  onClick={() => toggleLanguage(lang)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{lang}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Minimum Stars */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
          Minimum GitHub Stars
        </label>
        <div className="grid grid-cols-1 gap-1">
          {STAR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange({ ...filters, minStars: opt.value })}
              className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filters.minStars === opt.value
                  ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* License */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
          License
        </label>
        <div className="space-y-1.5">
          {AVAILABLE_LICENSES.map((lic) => {
            const isChecked = filters.licenses.includes(lic)
            return (
              <label
                key={lic}
                className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 py-0.5 select-none"
              >
                <div
                  onClick={() => toggleLicense(lic)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-violet-600 border-violet-600 text-white'
                      : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{lic}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Recency Toggle */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <label className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
          <span className="font-medium">Recently updated</span>
          <input
            type="checkbox"
            checked={filters.recentlyUpdatedOnly}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                recentlyUpdatedOnly: e.target.checked,
              })
            }
            className="w-4 h-4 text-violet-600 rounded border-zinc-300 dark:border-zinc-700 focus:ring-violet-500"
          />
        </label>
      </div>

      {/* Demo helper note */}
      <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-semibold mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Smart Filtering</span>
        </div>
        Filters react instantaneously across verified open-source repository blueprints.
      </div>
    </aside>
  )
}
