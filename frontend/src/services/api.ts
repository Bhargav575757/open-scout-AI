import type {
  GitHubSearchResponse,
  GitHubRepositoryItem,
  AISearchResponse,
  UnderstandQueryResponse,
  SemanticSearchResponse,
  IndexRepositoryResponse,
  IndexStatusResponse,
  ChatResponse,
  ConversationHistoryResponse,
} from '../types'

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

  async understandQuery(query: string): Promise<UnderstandQueryResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/understand-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (!res.ok) {
      let errorMsg = `Query understanding failed with status ${res.status}`
      try {
        const errJson = await res.json()
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message
        } else if (errJson?.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
        }
      } catch {
        // Fallback
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },

  async aiSearch(payload: {
    query: string
    page?: number
    per_page?: number
    sort?: string
    order?: string
    language_override?: string
    min_stars_override?: number
  }): Promise<AISearchResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/ai-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let errorMsg = `AI search failed with status ${res.status}`
      try {
        const errJson = await res.json()
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message
        } else if (errJson?.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
        }
      } catch {
        // Fallback
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },

  async semanticSearch(payload: {
    query: string
    language?: string
    min_stars?: number
    limit?: number
    page?: number
  }): Promise<SemanticSearchResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/semantic-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let errorMsg = `Semantic search failed with status ${res.status}`
      try {
        const errJson = await res.json()
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message
        } else if (errJson?.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
        }
      } catch {
        // Fallback
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },

  async indexRepository(owner: string, repo: string, forceRefresh: boolean = false): Promise<IndexRepositoryResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force_refresh: forceRefresh }),
    })
    if (!res.ok) {
      let errorMsg = `Repository indexing failed with status ${res.status}`
      try {
        const errJson = await res.json()
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message
        } else if (errJson?.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
        }
      } catch {
        // Fallback
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },

  async getIndexStatus(owner: string, repo: string): Promise<IndexStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/index-status`)
    if (!res.ok) {
      throw new Error(`Failed to check index status (${res.status})`)
    }
    return res.json()
  },

  async chatWithRepository(payload: {
    repository_id: string | number
    question: string
    conversation_id?: string
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let errorMsg = `Chatbot response failed (${res.status})`
      try {
        const errJson = await res.json()
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message
        } else if (errJson?.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
        }
      } catch {
        // Fallback
      }
      throw new Error(errorMsg)
    }
    return res.json()
  },

  async getChatMessages(conversationId: string): Promise<ConversationHistoryResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/chat/${encodeURIComponent(conversationId)}/messages`)
    if (!res.ok) {
      throw new Error(`Failed to fetch chat history (${res.status})`)
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
