import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Widget, DashboardState, Theme } from '@/types'
import { generateId } from '@/lib/utils'

interface DashboardStore extends DashboardState {
  addWidget: (widget: Omit<Widget, 'id' | 'position'>) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  reorderWidgets: (widgets: Widget[]) => void
  setTheme: (theme: Theme) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | undefined) => void
  clearError: () => void
  resetDashboard: () => void
  exportConfiguration: () => string
  importConfiguration: (configJson: string) => Promise<boolean>
}

const initialState: DashboardState = {
  widgets: [],
  layout: [],
  theme: 'dark',
  isLoading: false,
  error: undefined,
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addWidget: (widgetData) => {
        const newWidget: Widget = {
          ...widgetData,
          id: generateId(),
          position: { x: 0, y: 0 },
          size: { width: 300, height: 200 },
          lastUpdated: new Date().toISOString(),
        }
        
        set((state) => ({
          widgets: [...state.widgets, newWidget],
          layout: [...state.layout, newWidget],
        }))
      },
      
      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
          layout: state.layout.filter((w) => w.id !== id),
        }))
      },
      
      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, lastUpdated: new Date().toISOString() } : w
          ),
          layout: state.layout.map((w) =>
            w.id === id ? { ...w, ...updates, lastUpdated: new Date().toISOString() } : w
          ),
        }))
      },
      
      reorderWidgets: (widgets) => {
        set({ layout: widgets, widgets })
      },
      
      setTheme: (theme) => {
        set({ theme })
      },
      
      setLoading: (isLoading) => {
        set({ isLoading })
      },
      
      setError: (error) => {
        set({ error })
      },
      
      clearError: () => {
        set({ error: undefined })
      },
      
      resetDashboard: () => {
        set(initialState)
      },

      exportConfiguration: () => {
        const state = get()
        const config = {
          widgets: state.widgets,
          layout: state.layout,
          theme: state.theme,
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }
        return JSON.stringify(config, null, 2)
      },

      importConfiguration: async (configJson: string): Promise<boolean> => {
        try {
          const config = JSON.parse(configJson)
          
          // Validate config structure
          if (!config.widgets || !Array.isArray(config.widgets)) {
            throw new Error('Invalid configuration: missing or invalid widgets array')
          }
          
          if (!config.layout || !Array.isArray(config.layout)) {
            throw new Error('Invalid configuration: missing or invalid layout array')
          }
          
          // Import the configuration
          set({
            widgets: config.widgets,
            layout: config.layout,
            theme: config.theme || 'dark',
            error: undefined
          })
          
          return true
        } catch (error) {
          console.error('Failed to import configuration:', error)
          set({ error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` })
          return false
        }
      },
    }),
    {
      name: 'finboard-dashboard',
      partialize: (state) => ({
        widgets: state.widgets,
        layout: state.layout,
        theme: state.theme,
      }),
    }
  )
)
