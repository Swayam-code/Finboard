import React, { useEffect, useState } from 'react'
import { Widget } from '@/types'
import { useApiStore } from '@/stores/apiStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { getNestedValue, formatCurrency, formatNumber } from '@/lib/utils'
import { RefreshCw, Settings, Trash2, Clock } from 'lucide-react'

interface CardWidgetProps {
  widget: Widget
}

export function CardWidget({ widget }: CardWidgetProps) {
  const [data, setData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  
  const { fetchApiData } = useApiStore()
  const { removeWidget, updateWidget } = useDashboardStore()

  const fetchData = async (force = false) => {
    setIsRefreshing(true)
    try {
      const response = await fetchApiData(widget.apiUrl, !force)
      if (response.status === 'success') {
        setData(response.data)
        setLastUpdated(new Date().toLocaleTimeString())
        updateWidget(widget.id, { lastUpdated: new Date().toISOString() })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(() => {
      fetchData()
    }, widget.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [widget.apiUrl, widget.refreshInterval])

  const renderFieldValue = (fieldPath: string) => {
    if (!data) return 'Loading...'
    
    const value = getNestedValue(data, fieldPath)
    if (value === undefined || value === null) return 'N/A'
    
    // Try to format as number/currency if it looks like a number
    if (typeof value === 'string' && !isNaN(Number(value))) {
      const numValue = Number(value)
      if (fieldPath.toLowerCase().includes('price') || fieldPath.toLowerCase().includes('rate')) {
        return formatCurrency(numValue)
      }
      return formatNumber(numValue)
    }
    
    return String(value)
  }

  const renderField = (fieldPath: string, index: number) => {
    const fieldName = fieldPath.split('.').pop() || fieldPath
    const value = renderFieldValue(fieldPath)
    
    return (
      <div key={fieldPath} className="flex justify-between items-center py-2">
        <span className="text-gray-400 text-sm capitalize">
          {fieldName.replace(/([A-Z])/g, ' $1').trim()}
        </span>
        <span className="text-white font-medium">{value}</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">
            {widget.config?.title || widget.name}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
            {widget.refreshInterval}s
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw 
              size={16} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
          </button>
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        {widget.selectedFields.map((fieldPath, index) => renderField(fieldPath, index))}
        
        {widget.selectedFields.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No fields selected
          </div>
        )}
      </div>

      {/* Footer */}
      {widget.config?.showTimestamp && lastUpdated && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-4 pt-3 border-t border-gray-700">
          <Clock size={12} />
          <span>Last updated: {lastUpdated}</span>
        </div>
      )}
    </div>
  )
}
