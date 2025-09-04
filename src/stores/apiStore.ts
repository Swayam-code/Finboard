import { create } from 'zustand'
import { ApiCache, ApiResponse, ApiField } from '@/types'
import { getNestedValue } from '@/lib/utils'
import axios, { AxiosError } from 'axios'

interface ApiStore {
  cache: ApiCache
  isLoading: boolean
  error?: string
  testApiConnection: (url: string) => Promise<ApiResponse>
  fetchApiData: (url: string, useCache?: boolean) => Promise<ApiResponse>
  clearCache: (url?: string) => void
  extractFields: (data: any, prefix?: string) => ApiField[]
}

const CACHE_DURATION = 30 * 1000 // 30 seconds

export const useApiStore = create<ApiStore>((set, get) => ({
  cache: {},
  isLoading: false,
  error: undefined,

  testApiConnection: async (url) => {
    // Validate URL
    if (!url || url.trim() === '') {
      return {
        data: null,
        fields: [],
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        error: 'Invalid or empty URL provided',
      }
    }

    set({ isLoading: true, error: undefined })
    
    try {
      // Use our proxy API to avoid CORS issues
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`
      const response = await axios.get(proxyUrl, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      
      const fields = get().extractFields(response.data)
      const apiResponse: ApiResponse = {
        data: response.data,
        fields,
        timestamp: new Date().toISOString(),
        status: 'success',
      }
      
      set({ isLoading: false })
      return apiResponse
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.message || 'Failed to connect to API'
        : 'Unknown error occurred'
      
      set({ isLoading: false, error: errorMessage })
      
      return {
        data: null,
        fields: [],
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        error: errorMessage,
      }
    }
  },

  fetchApiData: async (url, useCache = true) => {
    // Validate URL
    if (!url || url.trim() === '') {
      return {
        data: null,
        fields: [],
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        error: 'Invalid or empty URL provided',
      }
    }

    const { cache } = get()
    const now = Date.now()
    
    // Check cache first
    if (useCache && cache[url]) {
      const cached = cache[url]
      if (now - cached.timestamp < cached.expiresIn) {
        const fields = get().extractFields(cached.data)
        return {
          data: cached.data,
          fields,
          timestamp: new Date(cached.timestamp).toISOString(),
          status: 'success' as const,
        }
      }
    }
    
    set({ isLoading: true, error: undefined })
    
    try {
      // Use our proxy API to avoid CORS issues
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`
      const response = await axios.get(proxyUrl, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      
      // Update cache
      set((state) => ({
        cache: {
          ...state.cache,
          [url]: {
            data: response.data,
            timestamp: now,
            expiresIn: CACHE_DURATION,
          },
        },
        isLoading: false,
      }))
      
      const fields = get().extractFields(response.data)
      return {
        data: response.data,
        fields,
        timestamp: new Date().toISOString(),
        status: 'success' as const,
      }
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.message || 'Failed to fetch data'
        : 'Unknown error occurred'
      
      set({ isLoading: false, error: errorMessage })
      
      return {
        data: null,
        fields: [],
        timestamp: new Date().toISOString(),
        status: 'error' as const,
        error: errorMessage,
      }
    }
  },

  clearCache: (url) => {
    if (url) {
      set((state) => {
        const { [url]: removed, ...rest } = state.cache
        return { cache: rest }
      })
    } else {
      set({ cache: {} })
    }
  },

  extractFields: (data, prefix = '') => {
    const fields: ApiField[] = []
    
    const traverse = (obj: any, path: string) => {
      if (obj === null || obj === undefined) return
      
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        Object.keys(obj).forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key
          const value = obj[key]
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            traverse(value, currentPath)
          } else {
            fields.push({
              key,
              value,
              type: Array.isArray(value) ? 'array' : typeof value,
              path: currentPath,
            })
          }
        })
      } else if (Array.isArray(obj) && obj.length > 0) {
        // For arrays, show the structure of the first item
        traverse(obj[0], `${path}[0]`)
      }
    }
    
    traverse(data, prefix)
    return fields
  },
}))
