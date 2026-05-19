'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { api } from './api'
import { Trip, Traveler, TripDay, TripPlace, Expense, Photo, Reservation } from './types'
import { mockTrip, mockTravelers } from './mock-data'
import { useAuth } from './auth-context'

interface TripContextType {
  trips: Trip[]
  currentTrip: Trip | null
  currentUser: Traveler
  isLoading: boolean
  error: string | null
  loadTrips: () => Promise<void>
  loadTrip: (id: string) => Promise<void>
  setCurrentTrip: (trip: Trip) => void
}

const TripContext = createContext<TripContextType | null>(null)

// Maps backend API response to frontend Trip type
function mapApiTripToFrontend(apiTrip: any, userId: string): Trip {
  const travelers: Traveler[] = (apiTrip.companions || []).map((c: any, i: number) => ({
    id: c.userId || c.id,
    name: c.name,
    email: c.email,
    color: ['#E85D4C', '#3D9A7D', '#D4A853', '#7C5CBF', '#2D8EBF', '#E8834C'][i % 6],
    isOnline: false,
    role: c.role === 'owner' ? 'organizer' : c.role === 'editor' ? 'editor' : 'viewer',
    rsvpStatus: c.rsvp === 'going' ? 'going' : c.rsvp === 'maybe' ? 'maybe' : c.rsvp === 'declined' ? 'not_going' : 'pending',
    joinedAt: c.joinedAt || new Date().toISOString(),
  }))

  // Add the creator if not in companions
  if (!travelers.find(t => t.id === userId)) {
    travelers.unshift({
      id: userId,
      name: 'You',
      email: '',
      color: '#E85D4C',
      isOnline: true,
      role: 'organizer',
      rsvpStatus: 'going',
      joinedAt: apiTrip.createdAt || new Date().toISOString(),
    })
  }

  const days: TripDay[] = (apiTrip.days || []).map((day: any) => ({
    id: day.id,
    date: day.date,
    places: (day.activities || []).map((a: any): TripPlace => ({
      id: a.id,
      name: a.name,
      type: mapActivityCategory(a.category),
      location: {
        lat: parseFloat(a.latitude) || 0,
        lng: parseFloat(a.longitude) || 0,
        address: a.location,
      },
      time: a.time,
      duration: a.duration,
      cost: a.cost ? parseFloat(a.cost) : undefined,
      currency: a.currency,
      notes: a.notes,
      votes: { up: [], down: [] },
      addedBy: userId,
      booked: a.status === 'booked',
      confirmationCode: a.confirmationCode,
    })),
  }))

  // Build reservations from flights + lodging + booked activities
  const reservations: Reservation[] = []

  ;(apiTrip.flights || []).forEach((f: any) => {
    reservations.push({
      id: f.id,
      type: 'flight',
      name: `${f.airline} ${f.flightNumber}`,
      confirmationNumber: f.confirmationCode,
      startDate: f.departureTime?.split('T')[0] || '',
      startTime: f.departureTime?.split('T')[1]?.substring(0, 5),
      endTime: f.arrivalTime?.split('T')[1]?.substring(0, 5),
      cost: f.price ? parseFloat(f.price) : undefined,
      currency: f.currency,
      bookedBy: userId,
      travelers: travelers.map(t => t.id),
      notes: `${f.departureAirport} to ${f.arrivalAirport}`,
      status: f.status === 'booked' ? 'confirmed' : 'pending',
    })
  })

  ;(apiTrip.lodging || []).forEach((l: any) => {
    reservations.push({
      id: l.id,
      type: 'hotel',
      name: l.name,
      confirmationNumber: l.confirmationCode,
      startDate: l.checkIn,
      endDate: l.checkOut,
      startTime: '15:00',
      location: l.address ? {
        lat: parseFloat(l.latitude) || 0,
        lng: parseFloat(l.longitude) || 0,
        address: l.address,
      } : undefined,
      cost: l.totalPrice ? parseFloat(l.totalPrice) : undefined,
      currency: l.currency,
      bookedBy: userId,
      travelers: travelers.map(t => t.id),
      notes: l.amenities ? `Amenities: ${l.amenities.join(', ')}` : undefined,
      status: l.status === 'booked' ? 'confirmed' : 'pending',
    })
  })

  const expenses: Expense[] = (apiTrip.expenses || []).map((e: any) => ({
    id: e.id,
    description: e.description,
    amount: parseFloat(e.amount),
    currency: e.currency || 'USD',
    paidBy: e.paidByUserId,
    splitWith: e.splitWithUserIds || [],
    splitType: 'equal' as const,
    category: e.category || 'other',
    date: e.date,
    receiptUrl: e.receiptUrl,
    settled: false,
  }))

  const photos: Photo[] = (apiTrip.photos || []).map((p: any) => ({
    id: p.id,
    url: p.url,
    thumbnailUrl: p.url,
    uploadedBy: p.uploadedBy,
    uploadedAt: p.createdAt,
    caption: p.caption,
    likes: [],
  }))

  return {
    id: apiTrip.id,
    name: apiTrip.destination,
    destination: apiTrip.destination,
    startDate: apiTrip.startDate || '',
    endDate: apiTrip.endDate || '',
    coverImage: apiTrip.coverImageUrl,
    description: apiTrip.notes,
    createdBy: apiTrip.createdBy,
    travelers,
    days,
    expenses,
    photos,
    reservations,
  }
}

function mapActivityCategory(category: string): TripPlace['type'] {
  switch (category) {
    case 'food': return 'restaurant'
    case 'sightseeing':
    case 'culture': return 'landmark'
    case 'transport': return 'transport'
    case 'relaxation':
    case 'shopping':
    case 'adventure':
    case 'nightlife': return 'activity'
    default: return 'activity'
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If not logged in, use mock data
  const currentUser: Traveler = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        color: '#E85D4C',
        isOnline: true,
        role: 'organizer',
        rsvpStatus: 'going',
        joinedAt: new Date().toISOString(),
      }
    : mockTravelers[0]

  const loadTrips = useCallback(async () => {
    if (!token) {
      setTrips([mockTrip])
      return
    }
    setIsLoading(true)
    try {
      const apiTrips = await api.trips.list()
      setTrips(apiTrips.map((t: any) => mapApiTripToFrontend(t, user!.id)))
    } catch (e: any) {
      setError(e.message)
      setTrips([mockTrip]) // fallback
    } finally {
      setIsLoading(false)
    }
  }, [token, user])

  const loadTrip = useCallback(async (id: string) => {
    if (!token) {
      setCurrentTrip(mockTrip)
      return
    }
    setIsLoading(true)
    try {
      const apiTrip = await api.trips.get(id)
      setCurrentTrip(mapApiTripToFrontend(apiTrip, user!.id))
    } catch (e: any) {
      setError(e.message)
      setCurrentTrip(mockTrip) // fallback
    } finally {
      setIsLoading(false)
    }
  }, [token, user])

  return (
    <TripContext.Provider value={{
      trips,
      currentTrip: currentTrip || mockTrip,
      currentUser,
      isLoading,
      error,
      loadTrips,
      loadTrip,
      setCurrentTrip,
    }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within TripProvider')
  return ctx
}
