'use client'

import { Dashboard } from '@/components/Dashboard'
import { ClientOnly } from '@/components/ClientOnly'

export default function Home() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading FinBoard...</p>
        </div>
      </div>
    }>
      <Dashboard />
    </ClientOnly>
  )
}
