const BASE_URL = import.meta.env.VITE_API_URL || ''

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('nutrix_token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem('nutrix_token')
    window.location.hash = '#/login'
    throw new Error('Unauthorized')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong')
  }

  return data
}

function get(url) {
  return apiFetch(url)
}

function post(url, body) {
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function patch(url, body) {
  return apiFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

function del(url) {
  return apiFetch(url, { method: 'DELETE' })
}

export const api = {
  auth: {
    login: (credentials) => post('/api/auth/login', credentials),
    register: (data) => post('/api/auth/register', data),
    googleLogin: (credential) => post('/api/auth/google', { credential }),
    me: () => get('/api/auth/me'),
    updateProfile: (data) => patch('/api/auth/profile', data),
  },
  foods: {
    search: (query, page = 1, limit = 20) =>
      get(`/api/foods/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
    getByBarcode: (barcode) => get(`/api/foods/barcode/${encodeURIComponent(barcode)}`),
    create: (food) => post('/api/foods', food),
    getById: (id) => get(`/api/foods/${id}`),
    getPopular: () => get('/api/foods/popular'),
  },
  meals: {
    log: (meal) => post('/api/meals', meal),
    getByDate: (date) => get(`/api/meals?date=${date}`),
    getHistory: (startDate, endDate) =>
      get(`/api/meals/history?startDate=${startDate}&endDate=${endDate}`),
    delete: (id) => del(`/api/meals/${id}`),
    getDailySummary: (date) => get(`/api/meals/summary/daily?date=${date}`),
    getWeeklySummary: () => get('/api/meals/summary/weekly'),
    getMonthlySummary: () => get('/api/meals/summary/monthly'),
  },
  stats: {
    dashboard: () => get('/api/stats/dashboard'),
    getWeight: () => get('/api/stats/weight'),
    addWeight: (data) => post('/api/stats/weight', data),
    getProgress: () => get('/api/stats/progress'),
  },
  test: {
    get: () => get('/api/test'),
    save: (data) => post('/api/test', data),
  },
  plan: {
    get: () => get('/api/plan'),
    generate: () => post('/api/plan/generate'),
    catalog: () => get('/api/plan/catalog'),
  },
}
