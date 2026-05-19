'use client'

import { TripDay, Collaborator, TripPlace } from '@/lib/types'
import { PlaceCard } from './place-card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface DayColumnProps {
  day: TripDay
  dayIndex: number
  collaborators: Collaborator[]
  selectedPlaceId?: string
  onPlaceSelect?: (id: string) => void
  onVote?: (placeId: string, direction: 'up' | 'down') => void
  onAddPlace?: (dayId: string) => void
}

export function DayColumn({ 
  day, 
  dayIndex,
  collaborators,
  selectedPlaceId,
  onPlaceSelect,
  onVote,
  onAddPlace
}: DayColumnProps) {
  const date = parseISO(day.date)
  const totalCost = day.places.reduce((sum, p) => sum + (p.cost || 0), 0)
  
  return (
    <div className="flex flex-col">
      {/* Day header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-10 pb-3 border-b border-border mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {dayIndex + 1}
              </span>
              Day {dayIndex + 1}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(date, 'EEEE, MMM d')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{day.places.length} places</p>
            {totalCost > 0 && (
              <p className="text-sm font-medium">${totalCost}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Places */}
      <div className="flex-1 space-y-3">
        {day.places.map((place, index) => (
          <PlaceCard
            key={place.id}
            place={place}
            index={index}
            collaborators={collaborators}
            isSelected={place.id === selectedPlaceId}
            onSelect={() => onPlaceSelect?.(place.id)}
            onVote={(direction) => onVote?.(place.id, direction)}
          />
        ))}
        
        {day.places.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No places added yet</p>
          </div>
        )}
        
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => onAddPlace?.(day.id)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add place
        </Button>
      </div>
    </div>
  )
}
