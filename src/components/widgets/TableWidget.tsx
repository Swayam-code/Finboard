import React, { useEffect, useState } from 'react'
import { Widget } from '@/types'
import { useApiStore } from '@/stores/apiStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { getNestedValue, formatCurrency, formatNumber } from '@/lib/utils'
import { RefreshCw, Trash2, Clock, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface TableWidgetProps {
  widget: Widget
}

export function TableWidget({ widget }: TableWidgetProps) {
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  
  const { fetchApiData } = useApiStore()
  const { removeWidget, updateWidget } = useDashboardStore()

  const fetchData = async (force = false) => {
    setIsRefreshing(true)
    try {
      const response = await fetchApiData(widget.apiUrl, !force)
      if (response.status === 'success') {
        // Find array data
        let arrayData: any[] = []
        
        if (Array.isArray(response.data)) {
          arrayData = response.data
        } else {
          // Look for arrays in the selected fields
          for (const fieldPath of widget.selectedFields) {
            const value = getNestedValue(response.data, fieldPath)
            if (Array.isArray(value)) {
              arrayData = value
              break
            }
          }
        }
        
        setData(arrayData)
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

  useEffect(() => {
    let filtered = [...data]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortField)
        const bValue = getNestedValue(b, sortField)
        
        if (aValue === bValue) return 0
        
        const comparison = aValue > bValue ? 1 : -1
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }
    
    setFilteredData(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [data, searchTerm, sortField, sortOrder])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const formatCellValue = (value: any, fieldPath: string) => {
    if (value === undefined || value === null) return 'N/A'
    
    if (typeof value === 'string' && !isNaN(Number(value))) {
      const numValue = Number(value)
      if (fieldPath.toLowerCase().includes('price') || fieldPath.toLowerCase().includes('rate')) {
        return formatCurrency(numValue)
      }
      return formatNumber(numValue)
    }
    
    return String(value)
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Get unique fields from data if no fields selected
  const displayFields = widget.selectedFields.length > 0 
    ? widget.selectedFields 
    : data.length > 0 ? Object.keys(data[0] || {}).slice(0, 4) : []

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

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        {data.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    {displayFields.map((field) => {
                      const fieldName = field.split('.').pop() || field
                      return (
                        <th
                          key={field}
                          className="text-left py-2 px-3 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort(field)}
                        >
                          <div className="flex items-center gap-1">
                            <span className="capitalize">
                              {fieldName.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            {sortField === field && (
                              sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                      {displayFields.map((field) => (
                        <td key={field} className="py-2 px-3 text-white">
                          {formatCellValue(getNestedValue(item, field), field)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  {filteredData.length} of {data.length} items
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {isRefreshing ? 'Loading data...' : 'No data available'}
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
