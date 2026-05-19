'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  X, 
  Calendar, 
  Users,
  CreditCard,
  Check,
  Loader2,
  Shield,
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'

type BookingType = 'hotel' | 'restaurant' | 'activity' | 'flight'

interface BookingItem {
  id: string
  type: BookingType
  name: string
  description?: string
  imageUrl?: string
  price: number
  priceUnit?: string
  rating?: number
  location?: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  item: BookingItem | null
  travelers: { id: string; name: string }[]
  onConfirm?: (booking: BookingConfirmation) => void
}

interface BookingConfirmation {
  itemId: string
  date: string
  guests: number
  selectedTravelers: string[]
  totalPrice: number
}

export function BookingModal({ isOpen, onClose, item, travelers, onConfirm }: BookingModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details')
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'))
  const [guests, setGuests] = useState(travelers.length)
  const [selectedTravelers, setSelectedTravelers] = useState<string[]>(travelers.map(t => t.id))
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  if (!item) return null

  const totalPrice = item.price * (item.type === 'hotel' ? 1 : guests)

  const handleConfirmBooking = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setStep('confirmation')
    setBookingComplete(true)
    
    onConfirm?.({
      itemId: item.id,
      date: selectedDate,
      guests,
      selectedTravelers,
      totalPrice,
    })
  }

  const resetAndClose = () => {
    setStep('details')
    setBookingComplete(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {step === 'confirmation' ? (
              <ConfirmationView item={item} onClose={resetAndClose} />
            ) : (
              <>
                {/* Header with image */}
                <div className="relative h-48 bg-muted shrink-0">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <button
                    onClick={resetAndClose}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      {item.rating && (
                        <span className="flex items-center gap-1 text-sm text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white">{item.name}</h2>
                    {item.location && (
                      <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                  <AnimatePresence mode="wait">
                    {step === 'details' ? (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-5"
                      >
                        {/* Date selection */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            <Calendar className="h-4 w-4 inline mr-1.5" />
                            When
                          </Label>
                          <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="rounded-xl"
                            min={format(new Date(), 'yyyy-MM-dd')}
                          />
                        </div>

                        {/* Guests */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            <Users className="h-4 w-4 inline mr-1.5" />
                            Guests
                          </Label>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setGuests(Math.max(1, guests - 1))}
                              className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-semibold w-8 text-center">{guests}</span>
                            <button
                              onClick={() => setGuests(Math.min(10, guests + 1))}
                              className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Travelers */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Who is going?</Label>
                          <div className="flex flex-wrap gap-2">
                            {travelers.map((traveler) => (
                              <button
                                key={traveler.id}
                                onClick={() => {
                                  setSelectedTravelers(prev =>
                                    prev.includes(traveler.id)
                                      ? prev.filter(id => id !== traveler.id)
                                      : [...prev, traveler.id]
                                  )
                                }}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                  selectedTravelers.includes(traveler.id)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                              >
                                {traveler.name.split(' ')[0]}
                                {selectedTravelers.includes(traveler.id) && (
                                  <Check className="h-3 w-3 inline ml-1" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Price breakdown */}
                        <div className="bg-muted rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              ${item.price} {item.priceUnit || 'per person'} x {guests} {item.type === 'hotel' ? 'night' : 'guests'}
                            </span>
                            <span className="font-medium">${totalPrice}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="font-medium">Total</span>
                            <span className="text-xl font-bold text-primary">${totalPrice}</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <button
                          onClick={() => setStep('details')}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back to details
                        </button>

                        {/* Payment form */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            <CreditCard className="h-4 w-4 inline mr-1.5" />
                            Card number
                          </Label>
                          <Input
                            placeholder="4242 4242 4242 4242"
                            className="rounded-xl"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Expiry</Label>
                            <Input
                              placeholder="MM/YY"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-2 block">CVC</Label>
                            <Input
                              placeholder="123"
                              className="rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3">
                          <Shield className="h-4 w-4 text-primary shrink-0" />
                          <span>Your payment is secured with 256-bit SSL encryption</span>
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="font-medium">Total to pay</span>
                          <span className="text-xl font-bold text-primary">${totalPrice}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border shrink-0">
                  {step === 'details' ? (
                    <Button 
                      className="w-full rounded-xl h-12 text-base shadow-lg shadow-primary/20"
                      onClick={() => setStep('payment')}
                    >
                      Continue to payment
                    </Button>
                  ) : (
                    <Button 
                      className="w-full rounded-xl h-12 text-base shadow-lg shadow-primary/20"
                      onClick={handleConfirmBooking}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay $${totalPrice}`
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ConfirmationView({ item, onClose }: { item: BookingItem; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center h-full"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
      >
        <Check className="h-10 w-10 text-green-600" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        Booking Confirmed!
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-6"
      >
        Your reservation at {item.name} has been confirmed. Check your email for details.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-muted rounded-xl p-4 w-full max-w-xs mb-6"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Confirmation:</span>
          <code className="font-mono font-medium">RO-{Math.random().toString(36).substring(2, 8).toUpperCase()}</code>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3"
      >
        <Button variant="outline" onClick={onClose} className="rounded-xl">
          Close
        </Button>
        <Button onClick={onClose} className="rounded-xl shadow-lg shadow-primary/20">
          View in Bookings
        </Button>
      </motion.div>
    </motion.div>
  )
}
