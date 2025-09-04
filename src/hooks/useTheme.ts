import { useEffect } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { Theme } from '@/types'

export const useTheme = () => {
  const { theme, setTheme } = useDashboardStore()

  // Get the actual theme being used (resolves 'auto' to 'light' or 'dark')
  const getResolvedTheme = (): 'light' | 'dark' => {
    if (theme === 'auto') {
      // Check if window is available (client-side)
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      // Default to dark theme during SSR
      return 'dark'
    }
    return theme
  }

  const resolvedTheme = getResolvedTheme()

  // Apply theme to document
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    const isDark = resolvedTheme === 'dark'
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#111827' : '#f9fafb')
    }
  }, [resolvedTheme])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return
    
    // Check if we're on the client side
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // Force a re-render by temporarily setting theme
      const currentTheme = theme
      setTheme('dark')
      setTimeout(() => setTheme(currentTheme), 0)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, setTheme])

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return 'sun'
      case 'dark':
        return 'moon'
      case 'auto':
        return 'monitor'
      default:
        return 'sun'
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode'
      case 'dark':
        return 'Dark Mode'
      case 'auto':
        return 'Auto Mode'
      default:
        return 'Light Mode'
    }
  }

  return {
    theme,
    resolvedTheme,
    setTheme,
    cycleTheme,
    getThemeIcon,
    getThemeLabel,
  }
}

// Theme configuration with CSS custom properties
export const themeConfig = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f9fafb',
    '--bg-tertiary': '#f3f4f6',
    '--text-primary': '#111827',
    '--text-secondary': '#6b7280',
    '--text-tertiary': '#9ca3af',
    '--border-primary': '#e5e7eb',
    '--border-secondary': '#d1d5db',
    '--accent-primary': '#059669',
    '--accent-secondary': '#10b981',
    '--accent-tertiary': '#6ee7b7',
    '--shadow-light': 'rgba(0, 0, 0, 0.1)',
    '--shadow-medium': 'rgba(0, 0, 0, 0.15)',
    '--shadow-heavy': 'rgba(0, 0, 0, 0.25)',
  },
  dark: {
    '--bg-primary': '#111827',
    '--bg-secondary': '#1f2937',
    '--bg-tertiary': '#374151',
    '--text-primary': '#f9fafb',
    '--text-secondary': '#d1d5db',
    '--text-tertiary': '#9ca3af',
    '--border-primary': '#374151',
    '--border-secondary': '#4b5563',
    '--accent-primary': '#10b981',
    '--accent-secondary': '#059669',
    '--accent-tertiary': '#047857',
    '--shadow-light': 'rgba(0, 0, 0, 0.3)',
    '--shadow-medium': 'rgba(0, 0, 0, 0.4)',
    '--shadow-heavy': 'rgba(0, 0, 0, 0.6)',
  },
}

// Apply theme CSS custom properties
export const applyThemeProperties = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  const properties = themeConfig[theme]
  
  Object.entries(properties).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}
