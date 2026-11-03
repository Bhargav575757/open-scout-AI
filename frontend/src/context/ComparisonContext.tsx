import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Repository } from '../types'
import { mockRepositories } from '../data/mockData'

interface ComparisonContextType {
  comparedIds: string[]
  comparedRepos: Repository[]
  toggleComparison: (repoId: string, repoData?: Repository) => void
  addToComparison: (repoId: string, repoData?: Repository) => void
  removeFromComparison: (repoId: string) => void
  clearComparison: () => void
  isCompared: (repoId: string) => boolean
  notification: string | null
  clearNotification: () => void
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

const MAX_COMPARISON_LIMIT = 4

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedRepos, setComparedRepos] = useState<Repository[]>(() => {
    try {
      const saved = localStorage.getItem('openscout_compared_repos')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // Fallback
    }
    return [mockRepositories[0], mockRepositories[1]]
  })

  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('openscout_compared_repos', JSON.stringify(comparedRepos))
  }, [comparedRepos])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr))
    }, 3500)
  }

  const comparedIds = comparedRepos.map((r) => r.id.toString())

  const isCompared = (repoId: string) => {
    const clean = repoId.toString().toLowerCase()
    return comparedRepos.some((r) => r.id.toString().toLowerCase() === clean || (r.full_name && r.full_name.toLowerCase() === clean))
  }

  const addToComparison = (repoId: string, repoData?: Repository) => {
    const clean = repoId.toString().toLowerCase()
    if (isCompared(clean)) return

    if (comparedRepos.length >= MAX_COMPARISON_LIMIT) {
      showToast(`Comparison limit reached (max ${MAX_COMPARISON_LIMIT} repositories).`)
      return
    }

    const repoToAdd =
      repoData ||
      mockRepositories.find((r) => r.id.toString().toLowerCase() === clean) || {
        id: repoId,
        name: repoId.split('/').pop() || repoId,
        owner: repoId.includes('/') ? repoId.split('/')[0] : 'github',
        full_name: repoId,
        description: 'GitHub repository',
        stars: 0,
        forks: 0,
        topics: [],
        githubUrl: `https://github.com/${repoId}`,
        difficulty: 'Intermediate' as const,
      }

    setComparedRepos((prev) => [...prev, repoToAdd as Repository])
    showToast(`Added "${repoToAdd.name || repoId}" to comparison.`)
  }

  const removeFromComparison = (repoId: string) => {
    const clean = repoId.toString().toLowerCase()
    const found = comparedRepos.find(
      (r) => r.id.toString().toLowerCase() === clean || (r.full_name && r.full_name.toLowerCase() === clean)
    )
    setComparedRepos((prev) =>
      prev.filter(
        (r) => r.id.toString().toLowerCase() !== clean && (!r.full_name || r.full_name.toLowerCase() !== clean)
      )
    )
    showToast(`Removed "${found?.name || repoId}" from comparison.`)
  }

  const toggleComparison = (repoId: string, repoData?: Repository) => {
    if (isCompared(repoId)) {
      removeFromComparison(repoId)
    } else {
      addToComparison(repoId, repoData)
    }
  }

  const clearComparison = () => {
    setComparedRepos([])
    showToast('Cleared all repositories from comparison.')
  }

  return (
    <ComparisonContext.Provider
      value={{
        comparedIds,
        comparedRepos,
        toggleComparison,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isCompared,
        notification,
        clearNotification: () => setNotification(null),
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
}
