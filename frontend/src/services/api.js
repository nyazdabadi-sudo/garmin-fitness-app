const API_BASE = '/api'

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

// Auth
export async function login(email, password) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function checkAuthStatus() {
  return fetchAPI('/auth/status')
}

export async function logout() {
  return fetchAPI('/auth/logout', { method: 'POST' })
}

// Metrics
export async function getSleepData(days = 7) {
  return fetchAPI(`/metrics/sleep?days=${days}`)
}

export async function getBodyBattery(days = 7) {
  return fetchAPI(`/metrics/body-battery?days=${days}`)
}

export async function getStressData(days = 7) {
  return fetchAPI(`/metrics/stress?days=${days}`)
}

export async function getStats() {
  return fetchAPI('/metrics/stats')
}

// Activities
export async function getActivities(type = null, days = 30, limit = 100) {
  let url = `/activities?days=${days}&limit=${limit}`
  if (type) {
    url += `&type=${type}`
  }
  return fetchAPI(url)
}

export async function getActivityTypes() {
  return fetchAPI('/activity-types')
}

// Insights
export async function getInsights(period = 'weekly') {
  return fetchAPI(`/insights?period=${period}`)
}

export async function getBestPerformances(type = null) {
  let url = '/best-performances'
  if (type) {
    url += `?type=${type}`
  }
  return fetchAPI(url)
}

export async function getRecommendations() {
  return fetchAPI('/recommendations')
}
