'use client'

import { useTrip } from '@/lib/trip-context'
import { TripHeader } from '@/components/trip-header'

export default function TripLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentTrip, currentUser } = useTrip()

  return (
    <div className="min-h-screen bg-background">
      <TripHeader trip={currentTrip} currentUser={currentUser} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
