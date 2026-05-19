const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, body.error || res.statusText)
  }

  return res.json()
}

// Auth
export const api = {
  auth: {
    register(data: { email: string; password: string; name: string }) {
      return request<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    login(data: { email: string; password: string }) {
      return request<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    me() {
      return request<{ user: any; preferences: any }>('/api/auth/me')
    },
    updatePreferences(data: any) {
      return request<any>('/api/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
  },

  trips: {
    list() {
      return request<any[]>('/api/trips')
    },
    get(id: string) {
      return request<any>(`/api/trips/${id}`)
    },
    create(data: { destination: string; startDate?: string; endDate?: string; notes?: string }) {
      return request<any>('/api/trips', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    update(id: string, data: any) {
      return request<any>(`/api/trips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
    delete(id: string) {
      return request<void>(`/api/trips/${id}`, { method: 'DELETE' })
    },

    // Companions
    addCompanion(tripId: string, data: { email: string; name: string; role?: string }) {
      return request<any>(`/api/trips/${tripId}/companions`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    updateRsvp(tripId: string, companionId: string, rsvp: string) {
      return request<any>(`/api/trips/${tripId}/companions/${companionId}/rsvp`, {
        method: 'PUT',
        body: JSON.stringify({ rsvp }),
      })
    },

    // Flights
    addFlight(tripId: string, data: any) {
      return request<any>(`/api/trips/${tripId}/flights`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Lodging
    addLodging(tripId: string, data: any) {
      return request<any>(`/api/trips/${tripId}/lodging`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Days & Activities
    addDay(tripId: string, data: { date: string; dayLabel?: string }) {
      return request<any>(`/api/trips/${tripId}/days`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    addActivity(tripId: string, dayId: string, data: any) {
      return request<any>(`/api/trips/${tripId}/days/${dayId}/activities`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Expenses
    addExpense(tripId: string, data: any) {
      return request<any>(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    getBalances(tripId: string) {
      return request<any>(`/api/trips/${tripId}/expenses/balances`)
    },

    // Photos
    addPhoto(tripId: string, data: { url: string; caption?: string }) {
      return request<any>(`/api/trips/${tripId}/photos`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  chat: {
    listConversations() {
      return request<any[]>('/api/chat/conversations')
    },
    getConversation(id: string) {
      return request<any>(`/api/chat/conversations/${id}`)
    },
    sendMessage(data: { conversationId?: string; tripId?: string; message: string }) {
      return request<any>('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    createTrip(data: { conversationId: string; messageId: string }) {
      return request<any>('/api/chat/create-trip', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    deleteConversation(id: string) {
      return request<void>(`/api/chat/conversations/${id}`, { method: 'DELETE' })
    },
  },

  search: {
    flights(params: { origin: string; destination: string; departureDate: string; adults?: number }) {
      const qs = new URLSearchParams(params as any).toString()
      return request<any[]>(`/api/search/flights?${qs}`)
    },
    hotels(params: { cityCode: string; checkIn: string; checkOut: string }) {
      const qs = new URLSearchParams(params as any).toString()
      return request<any[]>(`/api/search/hotels?${qs}`)
    },
    createAlert(data: any) {
      return request<any>('/api/search/alerts', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    listAlerts() {
      return request<any[]>('/api/search/alerts')
    },
  },
}
