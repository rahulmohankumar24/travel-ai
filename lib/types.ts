export interface TripPlace {
  id: string
  name: string
  type: 'accommodation' | 'activity' | 'restaurant' | 'transport' | 'landmark'
  location: {
    lat: number
    lng: number
    address?: string
  }
  time?: string
  duration?: string
  cost?: number
  currency?: string
  notes?: string
  votes: {
    up: string[]
    down: string[]
  }
  addedBy: string
  booked?: boolean
  bookingUrl?: string
  bookingConfirmation?: string
  imageUrl?: string
}

export interface TripDay {
  id: string
  date: string
  places: TripPlace[]
}

export interface Traveler {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  isOnline: boolean
  role: 'organizer' | 'editor' | 'viewer'
  rsvpStatus: 'going' | 'maybe' | 'not_going' | 'pending'
  joinedAt: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  paidBy: string
  splitWith: string[]
  splitType: 'equal' | 'custom' | 'percentage'
  customSplits?: { userId: string; amount: number }[]
  category: 'lodging' | 'food' | 'transport' | 'activities' | 'shopping' | 'other'
  date: string
  placeId?: string
  receipt?: string
  settled: boolean
}

export interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  uploadedBy: string
  uploadedAt: string
  caption?: string
  dayId?: string
  placeId?: string
  likes: string[]
}

export interface Reservation {
  id: string
  type: 'flight' | 'hotel' | 'restaurant' | 'activity' | 'car_rental' | 'train'
  name: string
  confirmationNumber?: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  cost?: number
  currency?: string
  bookedBy: string
  travelers: string[]
  notes?: string
  documents?: { name: string; url: string }[]
  status: 'confirmed' | 'pending' | 'cancelled'
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  coverImage?: string
  days: TripDay[]
  travelers: Traveler[]
  expenses: Expense[]
  photos: Photo[]
  reservations: Reservation[]
  createdBy: string
  description?: string
}

export interface BalanceSummary {
  userId: string
  owes: { toUserId: string; amount: number }[]
  owed: { fromUserId: string; amount: number }[]
  netBalance: number
}
