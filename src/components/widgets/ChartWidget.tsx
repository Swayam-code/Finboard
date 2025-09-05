import React, { useEffect, useState } from 'react'
import { Widget } from '@/types'
import { useApiStore } from '@/stores/apiStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { getNestedValue } from '@/lib/utils'
import { RefreshCw, Trash2, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ChartWidgetProps {
  widget: Widget
}

export function ChartWidget({ widget }: ChartWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  
  const { fetchApiData } = useApiStore()
  const { removeWidget, updateWidget } = useDashboardStore()

  const fetchData = async (force = false) => {
    setIsRefreshing(true)
    try {
      const response = await fetchApiData(widget.apiUrl, !force)
      if (response.status === 'success') {
        let chartData: any[] = []
        
        // Helper function to convert string numbers to actual numbers
        const convertToNumber = (value: any): number | null => {
          if (typeof value === 'number') return value
          if (typeof value === 'string') {
            const num = Number(value.replace(/,/g, '')) // Remove commas and convert
            return !isNaN(num) ? num : null
          }
          return null
        }

        // Helper function to process data object and convert string numbers
        const processDataObject = (obj: any): any => {
          const processed: any = {}
          for (const [key, value] of Object.entries(obj)) {
            const numValue = convertToNumber(value)
            if (numValue !== null) {
              processed[key] = numValue
            } else if (typeof value === 'string' || typeof value === 'number') {
              processed[key] = value // Keep original value for non-numeric strings
            }
          }
          return processed
        }
        
        // Try to extract numeric data for charting
        if (Array.isArray(response.data)) {
          chartData = response.data.slice(0, 20).map(processDataObject) // Process each item
        } else {
          // Look for arrays in the selected fields
          for (const fieldPath of widget.selectedFields) {
            const value = getNestedValue(response.data, fieldPath)
            if (Array.isArray(value)) {
              chartData = value.slice(0, 20).map(processDataObject)
              break
            }
          }
          
          // If no arrays found, create a single data point with current timestamp
          if (chartData.length === 0) {
            const dataPoint: any = { 
              timestamp: new Date().toISOString(),
              time: new Date().toLocaleTimeString()
            }
            
            widget.selectedFields.forEach(field => {
              const value = getNestedValue(response.data, field)
              const numValue = convertToNumber(value)
              
              if (numValue !== null) {
                // Use the field name without dots for cleaner chart labels
                const cleanFieldName = field.split('.').pop() || field
                dataPoint[cleanFieldName] = numValue
              }
            })
            
            if (Object.keys(dataPoint).length > 2) { // More than just timestamp and time
              chartData = [dataPoint]
            }
          }
        }
        
        // Ensure all data points have numeric values for charting
        chartData = chartData.map(processDataObject).filter(item => {
          const numericKeys = Object.keys(item).filter(key => 
            key !== 'timestamp' && key !== 'time' && typeof item[key] === 'number'
          )
          return numericKeys.length > 0
        })
        
        setData(chartData)
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

  const getNumericFields = () => {
    if (data.length === 0) return []
    
    const firstItem = data[0]
    return Object.keys(firstItem).filter(key => {
      if (key === 'timestamp' || key === 'time') return false // Skip timestamp fields
      const value = firstItem[key]
      return typeof value === 'number' || 
             (typeof value === 'string' && !isNaN(Number(value.replace(/,/g, ''))))
    })
  }

  const numericFields = getNumericFields()
  const chartType = widget.config?.chartType || 'line'

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name]
    }
    return [value, name]
  }

  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          {isRefreshing ? 'Loading chart data...' : 'No data available for chart'}
        </div>
      )
    }

    if (numericFields.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          No numeric fields found for charting
        </div>
      )
    }

    const ChartComponent = chartType === 'bar' ? BarChart : LineChart

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={numericFields.includes('timestamp') ? 'timestamp' : Object.keys(data[0])[0]}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#fff'
            }}
            formatter={formatTooltipValue}
          />
          
          {chartType === 'line' ? (
            numericFields.slice(0, 3).map((field, index) => (
              <Line
                key={field}
                type="monotone"
                dataKey={field}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], r: 3 }}
              />
            ))
          ) : (
            numericFields.slice(0, 3).map((field, index) => (
              <Bar
                key={field}
                dataKey={field}
                fill={colors[index % colors.length]}
              />
            ))
          )}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 h-full flex flex-col">
      {/* Header - Mobile Responsive */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="text-sm sm:text-lg font-semibold text-white truncate">
            {widget.config?.title || widget.name}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded hidden sm:inline">
            {widget.refreshInterval}s
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-1.5 sm:p-1 text-gray-400 hover:text-white transition-colors touch-manipulation"
          >
            <RefreshCw 
              size={14} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
          </button>
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1.5 sm:p-1 text-gray-400 hover:text-red-400 transition-colors touch-manipulation"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Chart - Responsive height */}
      <div className="flex-1 min-h-0">
        {renderChart()}
      </div>

      {/* Footer - Mobile responsive */}
      {widget.config?.showTimestamp && lastUpdated && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-700">
          <Clock size={10} className="sm:w-3 sm:h-3" />
          <span className="truncate">
            <span className="hidden sm:inline">Last updated: </span>
            <span className="sm:hidden">Updated: </span>
            {lastUpdated}
          </span>
        </div>
      )}
    </div>
  )
}
