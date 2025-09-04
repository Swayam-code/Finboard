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
        
        // Try to extract numeric data for charting
        if (Array.isArray(response.data)) {
          chartData = response.data.slice(0, 20) // Limit to 20 points for performance
        } else {
          // Look for arrays in the selected fields
          for (const fieldPath of widget.selectedFields) {
            const value = getNestedValue(response.data, fieldPath)
            if (Array.isArray(value)) {
              chartData = value.slice(0, 20)
              break
            }
          }
          
          // If no arrays found, create a single data point
          if (chartData.length === 0) {
            const dataPoint: any = { timestamp: new Date().toISOString() }
            widget.selectedFields.forEach(field => {
              const value = getNestedValue(response.data, field)
              if (typeof value === 'string' && !isNaN(Number(value))) {
                dataPoint[field] = Number(value)
              } else if (typeof value === 'number') {
                dataPoint[field] = value
              }
            })
            if (Object.keys(dataPoint).length > 1) {
              chartData = [dataPoint]
            }
          }
        }
        
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
      const value = firstItem[key]
      return typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))
    })
  }

  const numericFields = getNumericFields()
  const chartType = widget.chartType || 'line'

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

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {renderChart()}
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
