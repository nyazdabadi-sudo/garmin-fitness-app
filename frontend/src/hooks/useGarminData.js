import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'

// Generic data fetching hook
function useDataFetch(fetchFn, initialParams = [], dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(...initialParams)
      setData(result.data || result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [...initialParams, ...dependencies])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Sleep data hook
export function useSleepData(days = 7) {
  return useDataFetch(api.getSleepData, [days], [days])
}

// Body battery hook
export function useBodyBattery(days = 7) {
  return useDataFetch(api.getBodyBattery, [days], [days])
}

// Stress data hook
export function useStressData(days = 7) {
  return useDataFetch(api.getStressData, [days], [days])
}

// Daily stats hook
export function useStats() {
  return useDataFetch(api.getStats, [], [])
}

// Activities hook
export function useActivities(type = null, days = 30) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getActivities(type, days)
      setData(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [type, days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Activity types hook
export function useActivityTypes() {
  return useDataFetch(api.getActivityTypes, [], [])
}

// Insights hook
export function useInsights(period = 'weekly') {
  return useDataFetch(api.getInsights, [period], [period])
}

// Best performances hook
export function useBestPerformances(type = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getBestPerformances(type)
      setData(result.data || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Recommendations hook
export function useRecommendations() {
  return useDataFetch(api.getRecommendations, [], [])
}

// Combined dashboard data hook
export function useDashboardData() {
  const sleep = useSleepData(7)
  const battery = useBodyBattery(7)
  const stress = useStressData(7)
  const stats = useStats()
  const recommendations = useRecommendations()

  const loading = sleep.loading || battery.loading || stress.loading || stats.loading || recommendations.loading
  const error = sleep.error || battery.error || stress.error || stats.error || recommendations.error

  return {
    sleep: sleep.data,
    bodyBattery: battery.data,
    stress: stress.data,
    stats: stats.data,
    recommendations: recommendations.data,
    loading,
    error,
    refetch: () => {
      sleep.refetch()
      battery.refetch()
      stress.refetch()
      stats.refetch()
      recommendations.refetch()
    }
  }
}
