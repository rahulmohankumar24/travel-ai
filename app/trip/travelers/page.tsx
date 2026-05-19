'use client'

import { useState } from 'react'
import { Traveler } from '@/lib/types'
import { useTrip } from '@/lib/trip-context'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Mail,
  Crown,
  Edit3,
  Eye,
  MoreHorizontal,
  Check,
  HelpCircle,
  X,
  Clock,
  Copy,
  Link2,
  Users,
  Sparkles
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const roleIcons: Record<Traveler['role'], typeof Crown> = {
  organizer: Crown,
  editor: Edit3,
  viewer: Eye,
}

const roleLabels: Record<Traveler['role'], string> = {
  organizer: 'Organizer',
  editor: 'Can edit',
  viewer: 'View only',
}

const rsvpConfig: Record<Traveler['rsvpStatus'], { label: string; icon: typeof Check; color: string }> = {
  going: { label: 'Going', icon: Check, color: 'text-green-600 bg-green-100' },
  maybe: { label: 'Maybe', icon: HelpCircle, color: 'text-amber-600 bg-amber-100' },
  not_going: { label: 'Not going', icon: X, color: 'text-red-600 bg-red-100' },
  pending: { label: 'Pending', icon: Clock, color: 'text-muted-foreground bg-muted' },
}

export default function TravelersPage() {
  const { currentTrip: trip } = useTrip()
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const filteredTravelers = trip.travelers.filter(traveler =>
    traveler.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    traveler.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const goingCount = trip.travelers.filter(t => t.rsvpStatus === 'going').length
  const maybeCount = trip.travelers.filter(t => t.rsvpStatus === 'maybe').length
  const pendingCount = trip.travelers.filter(t => t.rsvpStatus === 'pending').length

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://roam.app/invite/${trip.id}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="min-h-[calc(100vh-105px)]">
      {/* Header */}
      <motion.div 
        className="border-b border-border bg-card/50 px-4 py-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Travelers</h1>
              <p className="text-sm text-muted-foreground">
                {goingCount} going
                {maybeCount > 0 && ` · ${maybeCount} maybe`}
                {pendingCount > 0 && ` · ${pendingCount} pending`}
              </p>
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" />
                    Invite
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Invite travelers</DialogTitle>
                  <DialogDescription>
                    Share the trip with friends and family so they can view or collaborate on the itinerary.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Invite by email
                    </label>
                    <div className="flex gap-2">
                      <Input placeholder="email@example.com" className="flex-1 rounded-xl" />
                      <Button className="rounded-xl">Send</Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Share invite link
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        value={`https://roam.app/invite/${trip.id}`}
                        readOnly
                        className="flex-1 text-sm rounded-xl"
                      />
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" onClick={copyInviteLink} className="rounded-xl">
                          {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </motion.div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Anyone with this link can join as a viewer.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full gap-2 rounded-xl">
                      <Sparkles className="h-4 w-4" />
                      AI suggest who to invite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="mt-5">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search travelers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* RSVP Summary */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RsvpCard label="Going" count={goingCount} color="bg-green-500" delay={0} />
          <RsvpCard label="Maybe" count={maybeCount} color="bg-amber-500" delay={0.05} />
          <RsvpCard label="Not going" count={trip.travelers.filter(t => t.rsvpStatus === 'not_going').length} color="bg-red-500" delay={0.1} />
          <RsvpCard label="Pending" count={pendingCount} color="bg-muted-foreground" delay={0.15} />
        </motion.div>

        {/* Travelers list */}
        <div className="space-y-3">
          {filteredTravelers.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Users className="h-7 w-7 text-secondary-foreground" />
              </motion.div>
              <p className="text-muted-foreground">No travelers found.</p>
            </motion.div>
          ) : (
            filteredTravelers.map((traveler, index) => (
              <TravelerCard key={traveler.id} traveler={traveler} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function RsvpCard({ label, count, color, delay }: { label: string; count: number; color: string; delay: number }) {
  return (
    <motion.div 
      className="bg-card border border-border rounded-2xl p-4 hover-lift"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ borderColor: 'var(--primary)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{count}</div>
    </motion.div>
  )
}

function TravelerCard({ traveler, index }: { traveler: Traveler; index: number }) {
  const RoleIcon = roleIcons[traveler.role]
  const rsvp = rsvpConfig[traveler.rsvpStatus]
  const RsvpIcon = rsvp.icon

  return (
    <motion.div 
      className="bg-card border border-border rounded-2xl p-4 hover-lift"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      whileHover={{ borderColor: 'var(--primary)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <motion.div
              className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
              style={{ backgroundColor: traveler.color }}
              whileHover={{ scale: 1.1 }}
            >
              {traveler.name.split(' ').map(n => n[0]).join('')}
            </motion.div>
            {traveler.isOnline && (
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-card" />
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{traveler.name}</span>
              {traveler.role === 'organizer' && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1 rounded-full">
                  <Crown className="h-2.5 w-2.5" />
                  Organizer
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted-foreground">{traveler.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* RSVP Status */}
          <motion.div 
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
              rsvp.color
            )}
            whileHover={{ scale: 1.05 }}
          >
            <RsvpIcon className="h-3.5 w-3.5" />
            {rsvp.label}
          </motion.div>

          {/* Role */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
            <RoleIcon className="h-3.5 w-3.5" />
            {roleLabels[traveler.role]}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send message
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit3 className="h-4 w-4 mr-2" />
                Change role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link2 className="h-4 w-4 mr-2" />
                Resend invite
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Remove from trip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Joined date */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Joined {format(parseISO(traveler.joinedAt), 'MMM d, yyyy')}</span>
        {traveler.isOnline && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Online now
          </span>
        )}
      </div>
    </motion.div>
  )
}
