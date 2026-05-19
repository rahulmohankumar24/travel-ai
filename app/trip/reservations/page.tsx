'use client'

import { useState } from 'react'
import { Reservation } from '@/lib/types'
import { useTrip } from '@/lib/trip-context'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Plane,
  Building2,
  Utensils,
  Car,
  Train,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  ExternalLink,
  MoreHorizontal,
  Copy,
  Check,
  Sparkles
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { BookingModal } from '@/components/booking-modal'

const typeIcons: Record<Reservation['type'], typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  restaurant: Utensils,
  activity: Ticket,
  car_rental: Car,
  train: Train,
}

const typeLabels: Record<Reservation['type'], string> = {
  flight: 'Flight',
  hotel: 'Accommodation',
  restaurant: 'Dining',
  activity: 'Activity',
  car_rental: 'Car Rental',
  train: 'Train',
}

const typeColors: Record<Reservation['type'], { bg: string; text: string; light: string }> = {
  flight: { bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50' },
  hotel: { bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50' },
  restaurant: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  activity: { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
  car_rental: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  train: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
}

export default function ReservationsPage() {
  const { currentTrip: trip } = useTrip()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<Reservation['type'] | 'all'>('all')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  const filteredReservations = trip.reservations.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.confirmationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || res.type === filterType
    return matchesSearch && matchesType
  })

  const groupedByDate = filteredReservations.reduce((acc, res) => {
    const date = res.startDate
    if (!acc[date]) acc[date] = []
    acc[date].push(res)
    return acc
  }, {} as Record<string, Reservation[]>)

  const sortedDates = Object.keys(groupedByDate).sort()

  const getTravelerById = (id: string) => trip.travelers.find(t => t.id === id)

  return (
    <div className="min-h-[calc(100vh-105px)]">
      {/* Header */}
      <motion.div 
        className="border-b border-border bg-card/50 px-4 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
              <p className="text-sm text-muted-foreground">
                {trip.reservations.length} reservations for your trip
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Book
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="sm" 
                  className="gap-1.5 rounded-xl shadow-lg shadow-primary/20"
                  onClick={() => setBookingModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Booking
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <FilterButton
                active={filterType === 'all'}
                onClick={() => setFilterType('all')}
              >
                All
              </FilterButton>
              {(Object.keys(typeLabels) as Reservation['type'][]).map((type) => (
                <FilterButton
                  key={type}
                  active={filterType === type}
                  onClick={() => setFilterType(type)}
                >
                  {typeLabels[type]}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {sortedDates.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary mb-5"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Ticket className="h-7 w-7 text-secondary-foreground" />
            </motion.div>
            <h3 className="font-semibold text-foreground mb-2">No reservations found</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Add your first booking to keep everything organized in one place.'}
            </p>
            <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Add Booking
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date, dateIndex) => (
              <motion.div 
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {groupedByDate[date].length} reservation{groupedByDate[date].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {groupedByDate[date].map((reservation, resIndex) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      getTravelerById={getTravelerById}
                      index={resIndex}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        item={{
          id: 'new',
          type: 'hotel',
          name: 'New Booking',
          price: 150,
          location: trip.destination,
        }}
        travelers={trip.travelers.filter(t => t.rsvpStatus === 'going').map(t => ({ id: t.id, name: t.name }))}
      />
    </div>
  )
}

function FilterButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode
  active: boolean
  onClick: () => void 
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'px-3.5 py-2 text-xs font-medium rounded-xl transition-all',
        active
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  )
}

function ReservationCard({ 
  reservation,
  getTravelerById,
  index
}: { 
  reservation: Reservation
  getTravelerById: (id: string) => typeof mockTravelers[0] | undefined
  index: number
}) {
  const [copied, setCopied] = useState(false)
  const Icon = typeIcons[reservation.type]
  const colors = typeColors[reservation.type]
  const bookedBy = getTravelerById(reservation.bookedBy)

  const copyConfirmation = () => {
    if (reservation.confirmationNumber) {
      navigator.clipboard.writeText(reservation.confirmationNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div 
      className="bg-card border border-border rounded-2xl overflow-hidden hover-lift"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ borderColor: 'var(--primary)' }}
    >
      <div className="flex">
        {/* Type indicator */}
        <div className={cn('w-1.5 shrink-0', colors.bg)} />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <motion.div 
                className={cn(
                  'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
                  colors.light
                )}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className={cn('h-5 w-5', colors.text)} />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full text-white',
                    colors.bg
                  )}>
                    {typeLabels[reservation.type]}
                  </span>
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    reservation.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  )}>
                    {reservation.status}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{reservation.name}</h3>
                
                {/* Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                  {reservation.startTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {reservation.startTime}
                      {reservation.endTime && ` - ${reservation.endTime}`}
                    </span>
                  )}
                  {reservation.location?.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {reservation.location.address}
                    </span>
                  )}
                </div>

                {/* Confirmation */}
                {reservation.confirmationNumber && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-muted-foreground">Confirmation:</span>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded-lg font-medium">
                      {reservation.confirmationNumber}
                    </code>
                    <motion.button
                      onClick={copyConfirmation}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </motion.button>
                  </div>
                )}

                {/* Notes */}
                {reservation.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{reservation.notes}</p>
                )}
              </div>
            </div>

            {/* Cost and actions */}
            <div className="text-right shrink-0">
              {reservation.cost && (
                <div className="font-bold text-lg text-foreground">
                  ${reservation.cost.toLocaleString()}
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 mt-1 rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    View documents
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open booking site
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit details</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Cancel booking</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex -space-x-2">
                {reservation.travelers.slice(0, 4).map((travelerId) => {
                  const traveler = getTravelerById(travelerId)
                  if (!traveler) return null
                  return (
                    <motion.div
                      key={traveler.id}
                      className="h-7 w-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: traveler.color }}
                      title={traveler.name}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                    >
                      {traveler.name.split(' ').map(n => n[0]).join('')}
                    </motion.div>
                  )
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                {reservation.travelers.length} traveler{reservation.travelers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {bookedBy && (
              <span className="text-xs text-muted-foreground">
                Booked by {bookedBy.name.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
