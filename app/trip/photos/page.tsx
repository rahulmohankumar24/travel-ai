'use client'

import { useState } from 'react'
import { Photo } from '@/lib/types'
import { useTrip } from '@/lib/trip-context'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Grid3X3,
  LayoutGrid,
  Heart,
  Download,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  MapPin,
  Camera,
  Sparkles
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export default function PhotosPage() {
  const { currentTrip: trip } = useTrip()
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [filterDay, setFilterDay] = useState<string | 'all'>('all')

  const filteredPhotos = filterDay === 'all' 
    ? trip.photos 
    : trip.photos.filter(p => p.dayId === filterDay)

  const getTravelerById = (id: string) => trip.travelers.find(t => t.id === id)
  const getDayById = (id: string) => trip.days.find(d => d.id === id)
  const getPlaceById = (id: string) => trip.days.flatMap(d => d.places).find(p => p.id === id)

  const currentPhotoIndex = selectedPhoto 
    ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id) 
    : -1

  const goToPrevious = () => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex - 1])
    }
  }

  const goToNext = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex + 1])
    }
  }

  return (
    <div className="min-h-[calc(100vh-105px)]">
      {/* Header */}
      <motion.div 
        className="border-b border-border bg-card/50 px-4 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Photos</h1>
              <p className="text-sm text-muted-foreground">
                {trip.photos.length} photos from your trip
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
                  <Share2 className="h-4 w-4" />
                  Share Album
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  Upload
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex gap-1.5 flex-wrap">
              <FilterButton
                active={filterDay === 'all'}
                onClick={() => setFilterDay('all')}
              >
                All days
              </FilterButton>
              {trip.days.filter(d => trip.photos.some(p => p.dayId === d.id)).map((day, index) => (
                <FilterButton
                  key={day.id}
                  active={filterDay === day.id}
                  onClick={() => setFilterDay(day.id)}
                >
                  Day {index + 1}
                </FilterButton>
              ))}
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border border-border rounded-xl p-1 bg-muted/50">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'masonry' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredPhotos.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary mb-5"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Camera className="h-7 w-7 text-secondary-foreground" />
            </motion.div>
            <h3 className="font-semibold text-foreground mb-2">No photos yet</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              Start capturing memories from your trip and share them with your group.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
                <Sparkles className="h-4 w-4" />
                Generate AI Photos
              </Button>
              <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Upload Photos
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className={cn(
              'gap-3',
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
                : 'columns-2 sm:columns-3 lg:columns-4'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                viewMode={viewMode}
                onClick={() => setSelectedPhoto(photo)}
                getTravelerById={getTravelerById}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Photo lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedPhoto && (
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {/* Close button */}
                <motion.button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>

                {/* Navigation */}
                {currentPhotoIndex > 0 && (
                  <motion.button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>
                )}
                {currentPhotoIndex < filteredPhotos.length - 1 && (
                  <motion.button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>
                )}

                {/* Image */}
                <div className="flex items-center justify-center min-h-[60vh] p-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.caption || 'Trip photo'}
                    className="max-h-[70vh] max-w-full object-contain rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                </div>

                {/* Info bar */}
                <motion.div 
                  className="bg-black/80 px-6 py-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {selectedPhoto.caption && (
                        <p className="text-white font-medium text-lg mb-2">{selectedPhoto.caption}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        {selectedPhoto.dayId && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(getDayById(selectedPhoto.dayId)?.date || ''), 'MMM d, yyyy')}
                          </span>
                        )}
                        {selectedPhoto.placeId && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {getPlaceById(selectedPhoto.placeId)?.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {(() => {
                          const uploader = getTravelerById(selectedPhoto.uploadedBy)
                          if (!uploader) return null
                          return (
                            <>
                              <motion.div
                                className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ backgroundColor: uploader.color }}
                                whileHover={{ scale: 1.1 }}
                              >
                                {uploader.name.split(' ').map(n => n[0]).join('')}
                              </motion.div>
                              <span className="text-sm text-white/70">
                                {uploader.name} · {format(parseISO(selectedPhoto.uploadedAt), 'MMM d, h:mm a')}
                              </span>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-1.5 rounded-xl">
                          <Heart className={cn(
                            'h-4 w-4',
                            selectedPhoto.likes.length > 0 && 'fill-red-500 text-red-500'
                          )} />
                          {selectedPhoto.likes.length}
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-xl">
                          <Download className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-xl">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
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

function PhotoCard({
  photo,
  viewMode,
  onClick,
  getTravelerById,
  index
}: {
  photo: Photo
  viewMode: 'grid' | 'masonry'
  onClick: () => void
  getTravelerById: (id: string) => typeof mockTrip.travelers[0] | undefined
  index: number
}) {
  const uploader = getTravelerById(photo.uploadedBy)

  return (
    <motion.div 
      className={cn(
        'group relative rounded-2xl overflow-hidden cursor-pointer bg-muted',
        viewMode === 'masonry' ? 'mb-3 break-inside-avoid' : 'aspect-square'
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.thumbnailUrl}
        alt={photo.caption || 'Trip photo'}
        className={cn(
          'w-full object-cover transition-transform duration-500 group-hover:scale-110',
          viewMode === 'grid' ? 'h-full' : 'h-auto'
        )}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {uploader && (
                <motion.div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/30"
                  style={{ backgroundColor: uploader.color }}
                  whileHover={{ scale: 1.1 }}
                >
                  {uploader.name.split(' ').map(n => n[0]).join('')}
                </motion.div>
              )}
              {photo.caption && (
                <span className="text-xs text-white truncate max-w-[120px] font-medium">
                  {photo.caption}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <motion.button 
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                onClick={(e) => { e.stopPropagation() }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={cn(
                  'h-4 w-4 text-white',
                  photo.likes.length > 0 && 'fill-red-500 text-red-500'
                )} />
              </motion.button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button 
                    className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem>Download</DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem>Set as cover</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Like count badge */}
      {photo.likes.length > 0 && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          {photo.likes.length}
        </div>
      )}
    </motion.div>
  )
}
