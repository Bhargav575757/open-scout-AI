export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Repository {
  id: string
  name: string
  owner: string
  ownerAvatar?: string
  description: string
  language: string
  stars: number
  forks: number
  watchers: number
  openIssues: number
  license: string
  lastUpdated: string
  topics: string[]
  difficulty: DifficultyLevel
  matchReason: string
  githubUrl: string
  readmePreview: string
  installationInstructions: string
  docQualityScore: number
  technologies: string[]
  suitabilitySummary: string
  defaultBranch?: string
}

export type SortOption = 'relevance' | 'stars' | 'updated'

export interface FilterState {
  searchQuery: string
  languages: string[]
  minStars: number
  difficulties: DifficultyLevel[]
  licenses: string[]
  recentlyUpdatedOnly: boolean
  sortBy: SortOption
}

export interface SearchHistoryItem {
  id: string
  query: string
  date: string
  resultsCount: number
  tags: string[]
}

export interface QuickStat {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  description?: string
}

export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: string
}
