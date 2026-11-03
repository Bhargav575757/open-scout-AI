import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { HealthResponse } from '../services/api'

export const useBackendHealth = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    apiService
      .getHealth()
      .then((data) => {
        if (isMounted) {
          setHealth(data)
          setIsHealthy(data.status === 'healthy')
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsHealthy(false)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { health, isHealthy, isLoading }
}
