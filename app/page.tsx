'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTrip } from '@/lib/trip-context'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Calendar, ChevronRight, Sparkles, Globe } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { currentTrip: mockTrip, loadTrips } = useTrip()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadTrips()
  }, [loadTrips])

  const formatDateRange = (start: string, end: string) => {
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
  }

  const goingCount = mockTrip.travelers.filter(t => t.rsvpStatus === 'going').length
  const daysUntilTrip = mounted ? differenceInDays(parseISO(mockTrip.startDate), new Date()) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              className="h-9 w-9 rounded-xl ai-gradient flex items-center justify-center shadow-lg shadow-primary/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="h-5 w-5 text-white" />
            </motion.div>
            <span className="font-bold text-xl tracking-tight">Roam</span>
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              New Trip
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero section */}
      <motion.section 
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 ai-gradient opacity-5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-powered trip planning
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Plan trips together,<br />
            <span className="ai-gradient-text">travel smarter</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Collaborate with friends, let AI handle the logistics, and book everything in one place.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4" />
              Start planning with AI
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl">
              Import existing trip
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div 
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your Trips</h2>
            <p className="text-sm text-muted-foreground">Continue where you left off</p>
          </div>
        </motion.div>

        {/* Trip card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/trip/itinerary" className="block group">
            <motion.article 
              className="bg-card border border-border rounded-2xl overflow-hidden hover-lift"
              whileHover={{ borderColor: 'var(--primary)' }}
            >
              {/* Cover image */}
              <div className="relative h-52 bg-muted overflow-hidden">
                {mockTrip.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={mockTrip.coverImage} 
                    alt={mockTrip.destination}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-2xl font-bold text-white mb-2">{mockTrip.name}</h3>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {mockTrip.destination}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDateRange(mockTrip.startDate, mockTrip.endDate)}
                    </span>
                  </div>
                </div>
                {daysUntilTrip !== null && daysUntilTrip > 0 && (
                  <motion.div 
                    className="absolute top-4 right-4 glass px-4 py-2 rounded-full text-sm font-semibold text-foreground shadow-lg"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {daysUntilTrip} days away
                  </motion.div>
                )}
              </div>

              {/* Trip details */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {/* Travelers */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-2.5">
                        {mockTrip.travelers.filter(t => t.rsvpStatus === 'going').slice(0, 4).map((traveler, i) => (
                          <motion.div
                            key={traveler.id}
                            className="h-9 w-9 rounded-full border-2 border-card flex items-center justify-center text-xs font-semibold text-white shadow-md"
                            style={{ backgroundColor: traveler.color }}
                            title={traveler.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                          >
                            {traveler.name.split(' ').map(n => n[0]).join('')}
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {goingCount} going
                      </span>
                    </div>

                    {/* Quick stats */}
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="px-2.5 py-1 bg-secondary rounded-lg">{mockTrip.reservations.length} reservations</span>
                      <span className="px-2.5 py-1 bg-secondary rounded-lg">{mockTrip.photos.length} photos</span>
                    </div>
                  </div>

                  <motion.div 
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary"
                    whileHover={{ x: 4 }}
                  >
                    Open trip
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </div>
            </motion.article>
          </Link>
        </motion.div>

        {/* Create new trip card */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="relative overflow-hidden border border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors group cursor-pointer">
            <div className="absolute inset-0 ai-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
            <motion.div 
              className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary mb-4"
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Plus className="h-6 w-6 text-secondary-foreground" />
            </motion.div>
            <h3 className="font-semibold text-foreground mb-1">Create a new trip</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start planning your next adventure with AI assistance
            </p>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <Sparkles className="h-4 w-4" />
              Plan with AI
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
