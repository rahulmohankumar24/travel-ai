'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { TripProvider } from '@/lib/trip-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TripProvider>
        {children}
      </TripProvider>
    </AuthProvider>
  )
}
