import { useState, useEffect } from 'react'

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: 1024, // Default to desktop size for SSR
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024
      })
    }

    // Initial call
    updateScreenSize()

    // Add event listener
    window.addEventListener('resize', updateScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}

// Helper function for icon sizes
export function getResponsiveIconSize(screenSize: ReturnType<typeof useScreenSize>, mobileSize: number, desktopSize: number) {
  return screenSize.isMobile ? mobileSize : desktopSize
}
