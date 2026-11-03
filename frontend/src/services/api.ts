import type { GitHubSearchResponse, GitHubRepositoryItem } from '../types'

export interface HealthResponse {
  status: string
  service: string
  version?: string
  environment?: string
}

export interface RootResponse {
  message: string
  version?: string
  docs_url?: string
}

export interface SearchApiPayload {
  query: string
  limit?: number
  per_page?: number
  language?: string
  min_stars?: number
  page?: number
  sort?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiService = {
  async getRoot(): Promise<RootResponse> {
    const res = await fetch(`${API_BASE_URL}/`)
    if (!res.ok) throw new Error(`Root request failed with status ${res.status}`)
    return res.json()
  },

  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`)
    if (!res.ok) {
      const legacyRes = await fetch(`${API_BASE_URL}/api/health`)
      if (!legacyRes.ok) throw new Error(`Health check failed with status ${res.status}`)
      return legacyRes.json()
    }
    return res.json()
  },

  async search(payload: SearchApiPayload): Promise<GitHubSearchResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let errorMsg = `Search request failed with status ${res.status}`
      try {
        const errJson = await res.json()
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message
        } else if (errJson?.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
        }
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },

  async getRepository(repositoryId: string | number): Promise<GitHubRepositoryItem> {
    const res = await fetch(`${API_BASE_URL}/api/v1/repositories/${encodeURIComponent(repositoryId)}`)
    if (!res.ok) {
      let errorMsg = `Repository fetch failed with status ${res.status}`
      try {
        const errJson = await res.json()
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message
        }
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },

  async compare(repositoryIds: string[]) {
    const res = await fetch(`${API_BASE_URL}/api/v1/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repository_ids: repositoryIds }),
    })
    if (!res.ok) throw new Error(`Compare request failed with status ${res.status}`)
    return res.json()
  },

  async getHistory() {
    const res = await fetch(`${API_BASE_URL}/api/v1/history`)
    if (!res.ok) throw new Error(`History request failed with status ${res.status}`)
    return res.json()
  },
}
