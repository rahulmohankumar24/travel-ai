'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard, 
  ImageIcon, 
  Bed,
  ChevronLeft,
  Share2,
  Settings,
  Globe,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Trip, Traveler } from '@/lib/types'

const navItems = [
  { href: '/trip/itinerary', label: 'Itinerary', icon: Calendar },
  { href: '/trip/reservations', label: 'Bookings', icon: Bed },
  { href: '/trip/travelers', label: 'Travelers', icon: Users },
  { href: '/trip/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/trip/photos', label: 'Photos', icon: ImageIcon },
]

interface TripHeaderProps {
  trip: Trip
  currentUser: Traveler
}

export function TripHeader({ trip, currentUser }: TripHeaderProps) {
  const pathname = usePathname()
  
  const formatDateRange = (start: string, end: string) => {
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
  }

  const goingCount = trip.travelers.filter(t => t.rsvpStatus === 'going').length

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="px-4 lg:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 lg:h-16">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="h-5 w-5" />
                <div className="h-7 w-7 rounded-lg ai-gradient flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
              </Link>
            </motion.div>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-semibold text-foreground leading-tight">{trip.name}</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5" suppressHydrationWarning>
                  <MapPin className="h-3 w-3" />
                  {trip.destination}
                  <span className="text-border">·</span>
                  {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI assistant button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/5">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
            </motion.div>

            {/* Online travelers */}
            <div className="hidden md:flex items-center -space-x-2 ml-2">
              {trip.travelers.filter(t => t.isOnline).slice(0, 3).map((traveler) => (
                <motion.div
                  key={traveler.id}
                  className="h-7 w-7 rounded-full border-2 border-card flex items-center justify-center text-xs font-medium text-white relative shadow-sm"
                  style={{ backgroundColor: traveler.color }}
                  title={`${traveler.name} (online)`}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                >
                  {traveler.name.split(' ').map(n => n[0]).join('')}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-card" />
                </motion.div>
              ))}
              {goingCount > 3 && (
                <div className="h-7 w-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{goingCount - 3}
                </div>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl">
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </motion.div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 -mb-px overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
