import React from 'react'
import { Loader2, Zap, TrendingUp, DollarSign, Activity } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'dots' | 'financial'
  text?: string
  className?: string
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <Loader2 className={`${sizeClasses[size]} animate-spin text-emerald-500`} />
        {text && (
          <span className={`${textSizeClasses[size]} text-gray-400 animate-pulse`}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'financial') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin`}></div>
          <DollarSign className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={size === 'sm' ? 8 : size === 'md' ? 12 : 16} />
        </div>
        {text && (
          <div className="text-center">
            <div className={`${textSizeClasses[size]} text-gray-300 font-medium`}>
              {text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Fetching live data...
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${sizeClasses[size]} bg-emerald-500 rounded-full animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        {text && (
          <span className={`${textSizeClasses[size]} text-gray-400`}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        {text && (
          <span className={`${textSizeClasses[size]} text-gray-400 ml-2`}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`${sizeClasses[size]} bg-gray-700 rounded-full skeleton`}></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-700 rounded skeleton"></div>
            <div className="h-2 bg-gray-700 rounded w-3/4 skeleton"></div>
          </div>
        </div>
        {text && (
          <div className={`${textSizeClasses[size]} text-gray-500 text-center`}>
            {text}
          </div>
        )}
      </div>
    )
  }

  return null
}

// Specialized loading components for different contexts
export function WidgetLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-32 skeleton"></div>
            <div className="h-3 bg-gray-700 rounded w-20 skeleton"></div>
          </div>
          <div className="w-6 h-6 bg-gray-700 rounded skeleton"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-gray-700 rounded w-3/4 skeleton"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 skeleton"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 skeleton"></div>
        </div>
      </div>
    </div>
  )
}

export function DashboardLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <WidgetLoading />
        </div>
      ))}
    </div>
  )
}

export function TableLoading({ rows = 5, columns = 4, className = '' }: { 
  rows?: number, 
  columns?: number, 
  className?: string 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded skeleton"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-3 bg-gray-700 rounded skeleton"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function ChartLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart area */}
      <div className="h-48 bg-gray-700 rounded skeleton"></div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-700 rounded skeleton"></div>
            <div className="h-3 bg-gray-700 rounded w-16 skeleton"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
