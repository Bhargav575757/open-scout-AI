import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Repository } from '../types'
import { mockRepositories } from '../data/mockData'

interface ComparisonContextType {
  comparedIds: string[]
  comparedRepos: Repository[]
  toggleComparison: (repoId: string) => void
  addToComparison: (repoId: string) => void
  removeFromComparison: (repoId: string) => void
  clearComparison: () => void
  isCompared: (repoId: string) => boolean
  notification: string | null
  clearNotification: () => void
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

const MAX_COMPARISON_LIMIT = 4

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-seed with the first two repositories for an immediate rich comparison experience
  const [comparedIds, setComparedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('openscout_compared_ids')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // Fallback
    }
    return ['medibot-ai-fastapi', 'health-assistant-core']
  })

  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('openscout_compared_ids', JSON.stringify(comparedIds))
  }, [comparedIds])

  const showToast = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr))
    }, 3500)
  }

  const addToComparison = (repoId: string) => {
    if (comparedIds.includes(repoId)) return
    if (comparedIds.length >= MAX_COMPARISON_LIMIT) {
      showToast(`Comparison limit reached (max ${MAX_COMPARISON_LIMIT} repositories).`)
      return
    }
    const repo = mockRepositories.find((r) => r.id === repoId)
    setComparedIds((prev) => [...prev, repoId])
    showToast(`Added "${repo?.name || repoId}" to comparison.`)
  }

  const removeFromComparison = (repoId: string) => {
    const repo = mockRepositories.find((r) => r.id === repoId)
    setComparedIds((prev) => prev.filter((id) => id !== repoId))
    showToast(`Removed "${repo?.name || repoId}" from comparison.`)
  }

  const toggleComparison = (repoId: string) => {
    if (comparedIds.includes(repoId)) {
      removeFromComparison(repoId)
    } else {
      addToComparison(repoId)
    }
  }

  const clearComparison = () => {
    setComparedIds([])
    showToast('Cleared all repositories from comparison.')
  }

  const isCompared = (repoId: string) => comparedIds.includes(repoId)

  const comparedRepos = mockRepositories.filter((r) => comparedIds.includes(r.id))

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
