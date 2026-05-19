'use client'

import { TripPlace, Collaborator } from '@/lib/types'
import { cn } from '@/lib/utils'
import { 
  Home, 
  MapPin, 
  Utensils, 
  Plane, 
  Landmark,
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  Check,
  GripVertical,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const typeIcons: Record<TripPlace['type'], React.ReactNode> = {
  accommodation: <Home className="h-4 w-4" />,
  activity: <MapPin className="h-4 w-4" />,
  restaurant: <Utensils className="h-4 w-4" />,
  transport: <Plane className="h-4 w-4" />,
  landmark: <Landmark className="h-4 w-4" />,
}

const typeColors: Record<TripPlace['type'], string> = {
  accommodation: 'bg-blue-500',
  activity: 'bg-emerald-500',
  restaurant: 'bg-amber-500',
  transport: 'bg-indigo-500',
  landmark: 'bg-pink-500',
}

const typeBgColors: Record<TripPlace['type'], string> = {
  accommodation: 'bg-blue-50',
  activity: 'bg-emerald-50',
  restaurant: 'bg-amber-50',
  transport: 'bg-indigo-50',
  landmark: 'bg-pink-50',
}

interface PlaceCardProps {
  place: TripPlace
  index: number
  collaborators: Collaborator[]
  isSelected?: boolean
  onSelect?: () => void
  onVote?: (direction: 'up' | 'down') => void
  currentUserId?: string
}

export function PlaceCard({ 
  place, 
  index, 
  collaborators,
  isSelected,
  onSelect,
  onVote,
  currentUserId = '1'
}: PlaceCardProps) {
  const addedByUser = collaborators.find(c => c.id === place.addedBy)
  const hasVotedUp = place.votes.up.includes(currentUserId)
  const hasVotedDown = place.votes.down.includes(currentUserId)
  const netVotes = place.votes.up.length - place.votes.down.length
  
  return (
    <div 
      className={cn(
        "group relative rounded-lg border bg-card transition-all cursor-pointer",
        isSelected 
          ? "border-primary ring-2 ring-primary/20 shadow-sm" 
          : "border-border hover:border-muted-foreground/30 hover:shadow-sm"
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="p-3 pl-8">
        <div className="flex items-start gap-3">
          {/* Index & Type indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-foreground",
              typeBgColors[place.type]
            )}>
              <span className="text-sm font-medium">{index + 1}</span>
            </div>
            <div className={cn(
              "w-2 h-2 rounded-full",
              typeColors[place.type]
            )} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{place.name}</h4>
                  {place.booked && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700">
                      <Check className="h-3 w-3" />
                      Booked
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize flex items-center gap-1">
                  {typeIcons[place.type]}
                  {place.type}
                  {place.location.address && (
                    <>
                      <span className="mx-1">·</span>
                      <span className="truncate">{place.location.address}</span>
                    </>
                  )}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Move to another day</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {place.time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {place.time}
                  {place.duration && <span className="text-muted-foreground/60">({place.duration})</span>}
                </span>
              )}
              {place.cost !== undefined && (
                <span className="flex items-center gap-0.5">
                  <DollarSign className="h-3 w-3" />
                  {place.cost}
                </span>
              )}
            </div>
            
            {place.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{place.notes}</p>
            )}
            
            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
              {/* Added by */}
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback 
                    className="text-[10px] text-foreground"
                    style={{ backgroundColor: addedByUser?.color + '20' }}
                  >
                    {addedByUser?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{addedByUser?.name.split(' ')[0]}</span>
              </div>
              
              {/* Voting */}
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 gap-1",
                    hasVotedUp && "text-emerald-600 bg-emerald-50"
                  )}
                  onClick={() => onVote?.('up')}
                >
                  <ThumbsUp className="h-3 w-3" />
                  <span className="text-xs">{place.votes.up.length}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 gap-1",
                    hasVotedDown && "text-red-600 bg-red-50"
                  )}
                  onClick={() => onVote?.('down')}
                >
                  <ThumbsDown className="h-3 w-3" />
                  <span className="text-xs">{place.votes.down.length}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
