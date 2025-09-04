import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApiStore } from '@/stores/apiStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { Widget as WidgetType } from '@/types'
import { 
  RefreshCw, 
  Trash2, 
  GripVertical, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  AlertCircle,
  Zap,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react'
import { SimpleTableWidget } from './widgets/SimpleTableWidget'
import { ExpandedTableView } from './widgets/ExpandedTableView'
import { getNestedValue } from '@/lib/utils'

interface IntegratedWidgetProps {
  widget: WidgetType
  onRemove: () => void
  dragHandleProps?: any
  isDragging?: boolean
}

export function IntegratedWidget({ widget, onRemove, dragHandleProps, isDragging }: IntegratedWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  
  const { fetchApiData, cache, isLoading } = useApiStore()
  const updateWidget = useDashboardStore((state) => state.updateWidget)

  const widgetData = cache[widget.apiUrl]?.data
  const isDataLoading = isLoading

  // Auto-refresh setup
  useEffect(() => {
    // Don't set up auto-refresh or initial fetch if no valid API URL
    if (!widget.apiUrl || widget.apiUrl.trim() === '') {
      setRefreshError('No API URL configured for this widget')
      return
    }

    const refreshInterval = setInterval(() => {
      handleRefresh(false)
    }, (widget.refreshInterval || 30) * 1000)

    // Initial fetch
    handleRefresh(false)

    return () => clearInterval(refreshInterval)
  }, [widget.apiUrl, widget.refreshInterval])

  const handleRefresh = async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true)
    setRefreshError(null)
    
    // Validate API URL
    if (!widget.apiUrl || widget.apiUrl.trim() === '') {
      setRefreshError('No API URL configured for this widget')
      if (showLoading) setIsRefreshing(false)
      return
    }
    
    try {
      const response = await fetchApiData(widget.apiUrl, false) // Force fresh data
      if (response.status === 'success') {
        setLastUpdated(new Date())
      } else {
        setRefreshError(response.error || 'Failed to refresh data')
      }
    } catch (error) {
      setRefreshError('Failed to refresh data')
      console.error('Widget refresh error:', error)
    } finally {
      if (showLoading) setIsRefreshing(false)
    }
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - lastUpdated.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    
    return lastUpdated.toLocaleDateString()
  }

  const renderCardContent = () => {
    if (!widgetData) return null

    return (
      <div className="space-y-3">
        {widget.selectedFields.map((field, index) => {
          const value = getNestedValue(widgetData, field)
          const fieldName = field.split('.').pop() || field
          
          return (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-400 capitalize">
                {fieldName.replace('_', ' ')}
              </span>
              <span className="text-lg font-semibold text-white font-mono">
                {typeof value === 'number' 
                  ? new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6
                    }).format(value)
                  : String(value || 'N/A')
                }
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderChartContent = () => {
    if (!widgetData) return null

    const values = widget.selectedFields.map(field => ({
      name: field.split('.').pop() || field,
      value: getNestedValue(widgetData, field),
      label: field.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || field
    })).filter(item => typeof item.value === 'number')

    if (values.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-400 mb-2">No numeric data available</div>
            <div className="text-xs text-gray-500">Select numeric fields for chart display</div>
          </div>
        </div>
      )
    }

    const maxValue = Math.max(...values.map(v => v.value))
    const minValue = Math.min(...values.map(v => v.value))
    const range = maxValue - minValue
    
    // Better logic for chart type selection
    const hasLargeRange = range > maxValue * 0.8
    const hasSmallValues = values.length <= 3 && maxValue < 1000000 // Good for prices, not for large volumes
    const allSimilarValues = range < maxValue * 0.3 // Values are similar in magnitude
    
    // Choose chart type based on data characteristics
    let chartType = 'bar' // default
    
    if (hasSmallValues && !hasLargeRange) {
      chartType = 'circular' // Good for comparing prices, percentages, small counts
    } else if (values.length >= 4 && hasLargeRange) {
      chartType = 'line' // Good for trending data with large ranges
    } else {
      chartType = 'bar' // Good for most other cases
    }
    
    if (chartType === 'circular' && values.length <= 3) {
      // Donut chart for few values - show actual data values, not percentages
      const total = values.reduce((sum, item) => sum + item.value, 0)
      let cumulativePercentage = 0
      
      // For financial data, show the highest value in center
      const highestValue = Math.max(...values.map(v => v.value))
      const highestField = values.find(v => v.value === highestValue)
      
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgb(55 65 81)"
                strokeWidth="8"
              />
              {values.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage * 2.51} 251.2`
                const strokeDashoffset = -cumulativePercentage * 2.51
                const colors = [
                  'rgb(16 185 129)', // emerald-500
                  'rgb(59 130 246)', // blue-500
                  'rgb(245 101 101)', // red-400
                ]
                const color = colors[index % colors.length]
                
                cumulativePercentage += percentage
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 6px ${color}40)`
                    }}
                  />
                )
              })}
            </svg>
            
            {/* Center value - show highest value instead of field count */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-white">
                  {highestField && (highestField.name.toLowerCase().includes('price') || highestField.name.toLowerCase().includes('usd'))
                    ? `$${highestValue.toLocaleString()}`
                    : highestValue.toLocaleString()
                  }
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {highestField?.label.substring(0, 8)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend - show actual values instead of percentages */}
          <div className="grid grid-cols-1 gap-2 w-full">
            {values.map((item, index) => {
              const colors = [
                'bg-emerald-500',
                'bg-blue-500', 
                'bg-red-400',
              ]
              const color = colors[index % colors.length]
              
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-gray-300 capitalize truncate">
                      {item.label.substring(0, 10)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono text-white text-right">
                      {(item.name.toLowerCase().includes('price') || item.name.toLowerCase().includes('usd'))
                        ? `$${item.value.toLocaleString()}`
                        : item.value.toLocaleString()
                      }
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    
    if (chartType === 'line') {
      // Line chart for data with large ranges
      const chartWidth = 280
      const chartHeight = 120
      const padding = 20
      
      const xStep = (chartWidth - 2 * padding) / (values.length - 1)
      const yScale = (chartHeight - 2 * padding) / range
      
      const points = values.map((item, index) => ({
        x: padding + index * xStep,
        y: chartHeight - padding - (item.value - minValue) * yScale,
        value: item.value,
        label: item.label
      }))
      
      const pathD = points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ')
      
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center">
            <svg width={chartWidth} height={chartHeight} className="overflow-visible">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <line
                  key={index}
                  x1={padding}
                  y1={padding + ratio * (chartHeight - 2 * padding)}
                  x2={chartWidth - padding}
                  y2={padding + ratio * (chartHeight - 2 * padding)}
                  stroke="rgb(55 65 81)"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              ))}
              
              {/* Area under curve */}
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
                fill="url(#gradient)"
                opacity="0.2"
              />
              
              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke="rgb(16 185 129)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-sm"
              />
              
              {/* Data points */}
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="rgb(16 185 129)"
                  stroke="rgb(21 31 40)"
                  strokeWidth="2"
                  className="filter drop-shadow-sm"
                />
              ))}
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Value labels */}
          <div className="grid grid-cols-2 gap-1 text-xs mt-2">
            {values.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-400 truncate">{item.label}</span>
                <span className="font-mono text-white ml-1">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    // Default enhanced bar chart
    return (
      <div className="space-y-3 h-full">
        <div className="grid grid-cols-1 gap-3 flex-1">
          {values.map((item, index) => {
            const percentage = (item.value / maxValue) * 100
            const isHighest = item.value === maxValue
            const barColor = isHighest ? 'from-emerald-400 to-emerald-500' : 'from-emerald-600 to-emerald-500'
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    {typeof item.value === 'number' && (item.name.toLowerCase().includes('price') || item.name.toLowerCase().includes('rate'))
                      ? `$${item.value.toLocaleString()}`
                      : item.value.toLocaleString()
                    }
                  </span>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-700/30 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${barColor} relative`}
                      style={{ 
                        width: `${Math.max(percentage, 8)}%`,
                        boxShadow: isHighest ? '0 0 15px rgba(16, 185, 129, 0.4)' : '0 0 8px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse opacity-60"></div>
                    </div>
                  </div>
                  
                  {/* Percentage label */}
                  {percentage > 20 && (
                    <div className="absolute right-2 top-0 h-4 flex items-center">
                      <span className="text-xs font-medium text-white/90">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Enhanced footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-700/50">
          <span>Relative comparison</span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Live data</span>
          </span>
        </div>
      </div>
    )
  }

  const getWidgetContent = () => {
    if (isDataLoading && !widgetData) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={12} />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-300">Loading data...</div>
            <div className="text-xs text-gray-500 mt-1">Connecting to API...</div>
          </div>
        </div>
      )
    }

    if (refreshError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="text-red-400" size={32} />
          <div className="text-center">
            <div className="text-sm font-medium text-red-300 mb-2">Failed to load data</div>
            <div className="text-xs text-gray-500 mb-4">{refreshError}</div>
            <Button
              onClick={() => handleRefresh()}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <RefreshCw size={12} className="mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    if (!widgetData) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <DollarSign className="text-gray-400" size={16} />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-400">No data available</div>
            <div className="text-xs text-gray-500 mt-1">Check your API endpoint</div>
          </div>
        </div>
      )
    }

    if (isMinimized) {
      return (
        <div className="py-4 text-center">
          <div className="text-sm text-gray-400">Widget minimized</div>
        </div>
      )
    }

    // Render based on widget type
    switch (widget.type) {
      case 'table':
        return (
          <SimpleTableWidget
            data={widgetData}
            selectedFields={widget.selectedFields}
            config={widget.config}
            isExpanded={isExpanded}
          />
        )
      case 'chart':
        return renderChartContent()
      case 'card':
      default:
        return renderCardContent()
    }
  }

  const getStatusColor = () => {
    if (refreshError) return 'text-red-400'
    if (isDataLoading || isRefreshing) return 'text-yellow-400'
    if (widgetData) return 'text-emerald-400'
    return 'text-gray-400'
  }

  const getStatusIcon = () => {
    if (refreshError) return <AlertCircle size={12} />
    if (isDataLoading || isRefreshing) return <RefreshCw className="animate-spin" size={12} />
    if (widgetData) return <Zap size={12} />
    return <Clock size={12} />
  }

  return (
    <>
      <Card 
        className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 h-96 flex flex-col ${
          isDragging 
            ? 'shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/50 scale-105' 
            : 'hover:ring-1 hover:ring-emerald-500/30'
        } ${
          isMinimized ? 'opacity-75' : ''
        }`}
      >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-white truncate">
              {widget.config?.title || widget.name}
            </CardTitle>
            
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 text-xs ${getStatusColor()}`}>
                {getStatusIcon()}
                <span>
                  {refreshError ? 'Error' : 
                   isDataLoading || isRefreshing ? 'Updating...' : 
                   widgetData ? 'Live' : 'Idle'}
                </span>
              </div>
              
              {widget.config?.showTimestamp && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-gray-400">
                    {formatLastUpdated()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Minimize/Maximize */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              title={isMinimized ? 'Show widget' : 'Minimize widget'}
            >
              {isMinimized ? <Eye size={14} /> : <EyeOff size={14} />}
            </Button>

            {/* Expand */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              title="Expand to full screen"
            >
              <Maximize2 size={14} />
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              title="Refresh data"
            >
              <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={14} />
            </Button>

            {/* Remove */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
              title="Remove widget"
            >
              <Trash2 size={14} />
            </Button>

            {/* Drag Handle */}
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-white transition-colors"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0 flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
          {!isMinimized && getWidgetContent()}
        </div>
      </CardContent>

      {/* Loading Overlay */}
      {(isDataLoading || isRefreshing) && widgetData && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse"></div>
        </div>
      )}
    </Card>

    {/* Expanded Modal View */}
    {isExpanded && (
      <ExpandedTableView
        data={widgetData}
        title={widget.config?.title || widget.name}
        selectedFields={widget.selectedFields}
        onClose={() => setIsExpanded(false)}
      />
    )}
  </>
  )
}
