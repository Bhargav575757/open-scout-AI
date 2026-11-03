export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Repository {
  id: string | number
  name: string
  full_name?: string
  owner: string
  ownerAvatar?: string
  owner_avatar_url?: string | null
  description?: string | null
  language?: string | null
  stars: number
  forks: number
  watchers?: number
  watchers_count?: number | null
  openIssues?: number
  open_issues_count?: number | null
  license?: string | null
  lastUpdated?: string
  updated_at?: string | null
  created_at?: string | null
  topics: string[]
  difficulty?: DifficultyLevel
  matchReason?: string
  githubUrl: string
  html_url?: string
  readmePreview?: string
  installationInstructions?: string
  docQualityScore?: number
  technologies?: string[]
  suitabilitySummary?: string
  defaultBranch?: string
  isLiveGitHub?: boolean
}

export type SortOption = 'relevance' | 'stars' | 'updated' | 'forks'

export interface FilterState {
  searchQuery: string
  languages: string[]
  minStars: number
  difficulties: DifficultyLevel[]
  licenses: string[]
  recentlyUpdatedOnly: boolean
  sortBy: SortOption
  language?: string
  page?: number
  perPage?: number
}

export interface GitHubRepositoryItem {
  id: number | string
  name: string
  full_name: string
  owner: string
  owner_avatar_url?: string | null
  description?: string | null
  html_url: string
  language?: string | null
  stars: number
  forks: number
  stargazers_count?: number
  forks_count?: number
  open_issues_count?: number | null
  watchers_count?: number | null
  topics: string[]
  license?: string | null
  created_at?: string | null
  updated_at?: string | null
  default_branch?: string | null
}

export interface GitHubSearchResponse {
  query: string
  total_count: number
  page: number
  per_page: number
  items: GitHubRepositoryItem[]
  message?: string
  status?: string
}

export interface ProjectRequirements {
  domain?: string | null
  project_type?: string | null
  programming_languages: string[]
  frameworks: string[]
  technologies: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Unknown'
  min_stars?: number | null
  documentation_preference?: string | null
  keywords: string[]
  github_search_query: string
  summary: string
}

export interface UnderstandQueryResponse {
  success: boolean
  requirements: ProjectRequirements
}

export interface AISearchResponse {
  success: boolean
  query: string
  requirements: ProjectRequirements
  total_count: number
  page: number
  per_page: number
  items: GitHubRepositoryItem[]
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
