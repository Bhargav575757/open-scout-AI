export interface HealthResponse {
  status: string
  service: string
}

export interface RootResponse {
  message: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiService = {
  async getRoot(): Promise<RootResponse> {
    const res = await fetch(`${API_BASE_URL}/`)
    if (!res.ok) throw new Error(`Root request failed with status ${res.status}`)
    return res.json()
  },

  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/health`)
    if (!res.ok) throw new Error(`Health request failed with status ${res.status}`)
    return res.json()
  },
}
