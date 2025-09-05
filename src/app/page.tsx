'use client'

import { Dashboard } from '@/components/Dashboard'
import ClientOnly from '@/components/ClientOnly'

export default function Home() {
  return (
    <ClientOnly>
      <Dashboard />
    </ClientOnly>
  )
}
