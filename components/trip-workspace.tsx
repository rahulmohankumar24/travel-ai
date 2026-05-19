'use client'

import { Trip, TripPlace } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Share2, 
  Settings,
  CalendarDays,
  MapPin,
  DollarSign,
  Users,
  MoreHorizontal,
  Plus
} from 'lucide-react'
import { CollaboratorAvatars } from './collaborator-avatars'
import { DayColumn } from './day-column'
import { TripMap } from './trip-map'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TripWorkspaceProps {
  trip: Trip
  selectedDayIndex: number
  selectedPlaceId?: string
  viewMode: 'itinerary' | 'map'
  onDaySelect: (index: number) => void
  onPlaceSelect: (id: string) => void
  onViewModeChange: (mode: 'itinerary' | 'map') => void
  onVote: (placeId: string, direction: 'up' | 'down') => void
}

export function TripWorkspace({
  trip,
  selectedDayIndex,
  selectedPlaceId,
  viewMode,
  onDaySelect,
  onPlaceSelect,
  onViewModeChange,
  onVote
}: TripWorkspaceProps) {
  const startDate = parseISO(trip.startDate)
  const endDate = parseISO(trip.endDate)
  const duration = differenceInDays(endDate, startDate) + 1
  
  const totalCost = trip.days.flatMap(d => d.places).reduce((sum, p) => sum + (p.cost || 0), 0)
  const totalPlaces = trip.days.flatMap(d => d.places).length
  const bookedCount = trip.days.flatMap(d => d.places).filter(p => p.booked).length
  
  const currentDayPlaces = trip.days[selectedDayIndex]?.places || []
  const allPlaces = trip.days.flatMap(d => d.places)
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex-none border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-semibold">{trip.name}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {trip.destination}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CollaboratorAvatars collaborators={trip.collaborators} />
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <Button variant="outline" size="sm" className="h-8">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Trip settings
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicate trip</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete trip</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Trip stats bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              <span className="text-foreground font-medium ml-1">{duration} days</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-foreground font-medium">{totalPlaces}</span> places
              <span className="text-emerald-600">({bookedCount} booked)</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Est. <span className="text-foreground font-medium">${totalCost}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-foreground font-medium">{trip.collaborators.length}</span> travelers
            </span>
          </div>
          
          <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as 'itinerary' | 'map')}>
            <TabsList className="h-8">
              <TabsTrigger value="itinerary" className="text-xs h-7 px-3">Itinerary</TabsTrigger>
              <TabsTrigger value="map" className="text-xs h-7 px-3">Map</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Day tabs sidebar */}
        <div className="flex-none w-48 border-r border-border bg-muted/20">
          <div className="p-3">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Add day
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-2 space-y-1">
              {trip.days.map((day, index) => {
                const date = parseISO(day.date)
                const isSelected = index === selectedDayIndex
                return (
                  <button
                    key={day.id}
                    onClick={() => onDaySelect(index)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Day {index + 1}</span>
                      <span className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {day.places.length}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {format(date, 'EEE, MMM d')}
                    </p>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>
        
        {/* Content area */}
        <div className="flex-1 flex">
          {/* Itinerary panel */}
          <div className={`${viewMode === 'map' ? 'hidden lg:block lg:w-[400px]' : 'flex-1'} border-r border-border`}>
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="p-4">
                {trip.days[selectedDayIndex] && (
                  <DayColumn
                    day={trip.days[selectedDayIndex]}
                    dayIndex={selectedDayIndex}
                    collaborators={trip.collaborators}
                    selectedPlaceId={selectedPlaceId}
                    onPlaceSelect={onPlaceSelect}
                    onVote={onVote}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Map panel */}
          <div className={`${viewMode === 'itinerary' ? 'hidden lg:block' : ''} flex-1 bg-muted/30`}>
            <TripMap
              places={viewMode === 'map' ? allPlaces : currentDayPlaces}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={onPlaceSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
