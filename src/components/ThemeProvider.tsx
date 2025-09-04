'use client'

import React, { useEffect } from 'react'
import { useTheme, applyThemeProperties } from '@/hooks/useTheme'

interface ThemeProviderProps {
  children: React.ReactNode
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    // Apply theme properties on mount and theme change
    applyThemeProperties(resolvedTheme)
  }, [resolvedTheme])

  return <>{children}</>
}

export default ThemeProvider
