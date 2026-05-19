'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Trip, TripPlace } from '@/lib/types'
import { useTrip } from '@/lib/trip-context'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Map as MapIcon, 
  List,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  MoreHorizontal,
  Sparkles,
  Check,
  ExternalLink,
  GripVertical,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { AIAssistant } from '@/components/ai-assistant'
import { BookingModal } from '@/components/booking-modal'

const TripMap = dynamic(() => import('@/components/trip-map').then(mod => mod.TripMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
      <MapIcon className="h-8 w-8 text-muted-foreground/50" />
    </div>
  ),
})

const placeTypeColors: Record<string, string> = {
  accommodation: 'bg-[var(--color-lodging)]',
  activity: 'bg-[var(--color-activity)]',
  restaurant: 'bg-[var(--color-restaurant)]',
  transport: 'bg-[var(--color-transport)]',
  landmark: 'bg-[var(--color-landmark)]',
}

const placeTypeLabels: Record<string, string> = {
  accommodation: 'Stay',
  activity: 'Activity',
  restaurant: 'Food',
  transport: 'Transport',
  landmark: 'Landmark',
}

export default function ItineraryPage() {
  const { currentTrip: contextTrip, currentUser } = useTrip()
  const [trip, setTrip] = useState<Trip>(contextTrip)
  const [selectedDayId, setSelectedDayId] = useState(trip.days[0]?.id)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>()
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [bookingItem, setBookingItem] = useState<{
    id: string
    type: 'hotel' | 'restaurant' | 'activity' | 'flight'
    name: string
    description?: string
    imageUrl?: string
    price: number
    rating?: number
    location?: string
  } | null>(null)

  useEffect(() => {
    setTrip(contextTrip)
    if (contextTrip.days[0]?.id) setSelectedDayId(contextTrip.days[0].id)
  }, [contextTrip])
  
  const selectedDay = useMemo(() => 
    trip.days.find(d => d.id === selectedDayId), 
    [trip.days, selectedDayId]
  )

  const allPlaces = useMemo(() => 
    trip.days.flatMap(d => d.places),
    [trip.days]
  )

  const handleVote = useCallback((placeId: string, direction: 'up' | 'down') => {
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(day => ({
        ...day,
        places: day.places.map(place => {
          if (place.id !== placeId) return place
          
          const votes = { ...place.votes }
          const upIndex = votes.up.indexOf(currentUser.id)
          const downIndex = votes.down.indexOf(currentUser.id)
          
          if (direction === 'up') {
            if (upIndex > -1) {
              votes.up = votes.up.filter(id => id !== currentUser.id)
            } else {
              votes.up = [...votes.up, currentUser.id]
              if (downIndex > -1) {
                votes.down = votes.down.filter(id => id !== currentUser.id)
              }
            }
          } else {
            if (downIndex > -1) {
              votes.down = votes.down.filter(id => id !== currentUser.id)
            } else {
              votes.down = [...votes.down, currentUser.id]
              if (upIndex > -1) {
                votes.up = votes.up.filter(id => id !== currentUser.id)
              }
            }
          }
          
          return { ...place, votes }
        })
      }))
    }))
  }, [currentUser.id])

  const getTravelerById = (id: string) => trip.travelers.find(t => t.id === id)

  return (
    <div className="h-[calc(100vh-105px)] flex flex-col">
      {/* Toolbar */}
      <motion.div 
        className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[200px] h-9 text-sm rounded-xl"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => setIsAIOpen(true)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Suggest
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="sm" className="gap-1.5 text-xs rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-3.5 w-3.5" />
              Add Place
            </Button>
          </motion.div>
          
          {/* View toggle */}
          <div className="hidden md:flex items-center border border-border rounded-xl p-1 ml-2 bg-muted/50">
            {[
              { mode: 'list' as const, icon: List },
              { mode: 'split' as const, label: 'Split' },
              { mode: 'map' as const, icon: MapIcon },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === mode 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Day sidebar */}
        <AnimatePresence>
          {viewMode !== 'map' && (
            <motion.div 
              className="w-[140px] lg:w-[180px] border-r border-border bg-card/30 overflow-y-auto shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="p-2">
                {trip.days.map((day, index) => {
                  const date = parseISO(day.date)
                  const isSelected = day.id === selectedDayId
                  const hasPlaces = day.places.length > 0
                  
                  return (
                    <motion.button
                      key={day.id}
                      onClick={() => setSelectedDayId(day.id)}
                      className={cn(
                        'w-full text-left px-3 py-3 rounded-xl mb-1.5 transition-all relative overflow-hidden',
                        isSelected 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                          : 'hover:bg-muted text-foreground'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="text-xs font-medium opacity-70">Day {index + 1}</div>
                      <div className="text-sm font-semibold">{format(date, 'EEE, MMM d')}</div>
                      {hasPlaces && (
                        <div className={cn(
                          'text-xs mt-1 flex items-center gap-1',
                          isSelected ? 'opacity-80' : 'text-muted-foreground'
                        )}>
                          <MapPin className="h-3 w-3" />
                          {day.places.length} place{day.places.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Itinerary list */}
        <AnimatePresence>
          {viewMode !== 'map' && (
            <motion.div 
              className={cn(
                'flex-1 overflow-y-auto custom-scrollbar',
                viewMode === 'split' ? 'max-w-[500px]' : ''
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-4">
                {selectedDay && (
                  <motion.div 
                    className="mb-5"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-xl font-bold text-foreground">
                      {format(parseISO(selectedDay.date), 'EEEE, MMMM d')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDay.places.length} places planned
                    </p>
                  </motion.div>
                )}

                {selectedDay?.places.length === 0 ? (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div 
                      className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Zap className="h-7 w-7 text-secondary-foreground" />
                    </motion.div>
                    <h3 className="font-semibold text-foreground mb-2">No places yet</h3>
                    <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                      Let AI help you discover amazing places or add your own favorites.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 rounded-xl"
                        onClick={() => setIsAIOpen(true)}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Get AI suggestions
                      </Button>
                      <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="h-3.5 w-3.5" />
                        Add manually
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {selectedDay?.places.map((place, index) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        index={index}
                        isSelected={place.id === selectedPlaceId}
                        onSelect={() => setSelectedPlaceId(place.id === selectedPlaceId ? undefined : place.id)}
                        onVote={handleVote}
                        currentUserId={currentUser.id}
                        getTravelerById={getTravelerById}
                        onBook={() => setBookingItem({
                          id: place.id,
                          type: place.type === 'restaurant' ? 'restaurant' : place.type === 'accommodation' ? 'hotel' : 'activity',
                          name: place.name,
                          imageUrl: place.imageUrl,
                          price: place.cost || 50,
                          rating: 4.5,
                          location: trip.destination,
                        })}
                      />
                    ))}
                  </div>
                )}

                {selectedDay && selectedDay.places.length > 0 && (
                  <motion.div 
                    className="mt-5 pt-4 border-t border-dashed border-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full gap-1.5 text-muted-foreground rounded-xl hover:text-primary hover:bg-primary/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add another place
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <motion.div 
            className={cn(
              'bg-muted',
              viewMode === 'map' ? 'flex-1' : 'flex-1 hidden md:block'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <TripMap
              places={viewMode === 'map' ? allPlaces : (selectedDay?.places || [])}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={(id) => setSelectedPlaceId(id === selectedPlaceId ? undefined : id)}
              travelers={trip.travelers}
            />
          </motion.div>
        )}
      </div>

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        destination={trip.destination}
        onBook={(suggestion) => {
          setIsAIOpen(false)
          setBookingItem({
            id: suggestion.id,
            type: suggestion.type === 'restaurant' ? 'restaurant' : suggestion.type === 'hotel' ? 'hotel' : 'activity',
            name: suggestion.name,
            description: suggestion.description,
            imageUrl: suggestion.imageUrl,
            price: parseInt(suggestion.price?.replace(/[^0-9]/g, '') || '50'),
            rating: suggestion.rating,
            location: trip.destination,
          })
        }}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!bookingItem}
        onClose={() => setBookingItem(null)}
        item={bookingItem}
        travelers={trip.travelers.filter(t => t.rsvpStatus === 'going').map(t => ({ id: t.id, name: t.name }))}
      />
    </div>
  )
}

interface PlaceCardProps {
  place: TripPlace
  index: number
  isSelected: boolean
  onSelect: () => void
  onVote: (id: string, direction: 'up' | 'down') => void
  currentUserId: string
  getTravelerById: (id: string) => typeof mockTravelers[0] | undefined
  onBook: () => void
}

function PlaceCard({ 
  place, 
  index, 
  isSelected, 
  onSelect, 
  onVote, 
  currentUserId,
  getTravelerById,
  onBook
}: PlaceCardProps) {
  const netVotes = place.votes.up.length - place.votes.down.length
  const hasUpvoted = place.votes.up.includes(currentUserId)
  const hasDownvoted = place.votes.down.includes(currentUserId)
  const addedBy = getTravelerById(place.addedBy)

  return (
    <motion.div
      className={cn(
        'group bg-card border rounded-2xl transition-all cursor-pointer hover-lift',
        isSelected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/30'
      )}
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex">
        {/* Index and drag handle */}
        <div className="flex flex-col items-center py-3 px-2.5 border-r border-border bg-muted/30 rounded-l-2xl">
          <GripVertical className="h-4 w-4 text-muted-foreground/30 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
          <motion.div 
            className={cn(
              'h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md',
              placeTypeColors[place.type]
            )}
            whileHover={{ scale: 1.1 }}
          >
            {index + 1}
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full text-white',
                  placeTypeColors[place.type]
                )}>
                  {placeTypeLabels[place.type]}
                </span>
                {place.booked && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-0.5">
                    <Check className="h-2.5 w-2.5" />
                    Booked
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-foreground truncate">{place.name}</h3>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                {place.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {place.time}
                  </span>
                )}
                {place.duration && <span>{place.duration}</span>}
                {place.cost && (
                  <span className="font-semibold text-foreground">
                    ${place.cost}
                  </span>
                )}
              </div>
            </div>

            {/* Voting */}
            <div className="flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <motion.button
                onClick={() => onVote(place.id, 'up')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  hasUpvoted ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronUp className="h-4 w-4" />
              </motion.button>
              <span className={cn(
                'text-xs font-bold',
                netVotes > 0 ? 'text-primary' : netVotes < 0 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {netVotes}
              </span>
              <motion.button
                onClick={() => onVote(place.id, 'down')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  hasDownvoted ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Notes */}
          {place.notes && (
            <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2">{place.notes}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
            <div className="flex items-center gap-2">
              {addedBy && (
                <motion.div 
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: addedBy.color }}
                  title={`Added by ${addedBy.name}`}
                  whileHover={{ scale: 1.15 }}
                >
                  {addedBy.name.split(' ').map(n => n[0]).join('')}
                </motion.div>
              )}
              <span className="text-xs text-muted-foreground">
                {addedBy?.name.split(' ')[0]}
              </span>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {!place.booked && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs rounded-lg"
                    onClick={onBook}
                  >
                    Book
                  </Button>
                </motion.div>
              )}
              {place.bookingUrl && (
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" asChild>
                  <a href={place.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem>Edit details</DropdownMenuItem>
                  <DropdownMenuItem>Move to another day</DropdownMenuItem>
                  <DropdownMenuItem>Add to expenses</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Image preview */}
        {place.imageUrl && (
          <div className="hidden sm:block w-28 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={place.imageUrl} 
              alt={place.name}
              className="h-full w-full object-cover rounded-r-2xl"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
