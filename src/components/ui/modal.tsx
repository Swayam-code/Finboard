import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md max-h-[80vh] sm:max-h-[80vh]',
    md: 'max-w-lg max-h-[85vh] sm:max-h-[85vh]', 
    lg: 'max-w-sm sm:max-w-2xl max-h-[90vh] sm:max-h-[90vh]',
    xl: 'max-w-sm sm:max-w-4xl max-h-[90vh] sm:max-h-[90vh]',
    full: 'max-w-full sm:max-w-6xl max-h-[95vh] sm:max-h-[95vh]',
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container - Mobile Responsive */}
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4">
        {/* Modal */}
        <div className={cn(
          "relative w-full bg-gray-900 border border-gray-700 rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col",
          "animate-in fade-in-0 slide-in-from-bottom-4 sm:zoom-in-95 duration-200 transform",
          "max-w-full",
          sizeClasses[size]
        )}>
          {/* Header - Fixed with mobile optimizations */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 bg-gray-900 rounded-t-xl">
            <h2 className="text-lg sm:text-xl font-semibold text-white truncate pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors touch-manipulation flex-shrink-0"
              aria-label="Close modal"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Content - Scrollable with mobile padding */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar text-left">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
