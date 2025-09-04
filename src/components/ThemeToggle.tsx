import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'

const ThemeToggle: React.FC = () => {
  const { theme, cycleTheme, getThemeLabel } = useTheme()

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={18} className="text-amber-500" />
      case 'dark':
        return <Moon size={18} className="text-blue-400" />
      case 'auto':
        return <Monitor size={18} className="text-emerald-400" />
      default:
        return <Sun size={18} />
    }
  }

  const getNextTheme = () => {
    const themeOrder = ['light', 'dark', 'auto'] as const
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    return themeOrder[nextIndex]
  }

  const getNextThemeLabel = () => {
    const nextTheme = getNextTheme()
    switch (nextTheme) {
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

  return (
    <Button
      onClick={cycleTheme}
      variant="ghost"
      size="sm"
      className="group relative p-2.5 text-gray-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-gray-800/70 border border-gray-700/50 backdrop-blur-sm overflow-hidden"
      title={`Current: ${getThemeLabel()} • Click for ${getNextThemeLabel()}`}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      
      {/* Icon with smooth transition */}
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
        {getIcon()}
      </div>
      
      {/* Theme indicator badge */}
      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300 opacity-60">
        <div className={`w-full h-full rounded-full ${
          theme === 'light' 
            ? 'bg-amber-400' 
            : theme === 'dark' 
              ? 'bg-blue-400' 
              : 'bg-emerald-400'
        } animate-pulse`}></div>
      </div>
    </Button>
  )
}

export default ThemeToggle
