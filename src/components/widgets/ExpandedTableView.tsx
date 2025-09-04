import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Search, X, BarChart3, Filter, ArrowUpDown, SortAsc, SortDesc } from 'lucide-react'
import { getNestedValue } from '@/lib/utils'

interface ExpandedTableViewProps {
  data: any
  title: string
  selectedFields: string[]
  onClose: () => void
}

export function ExpandedTableView({ data, title, selectedFields, onClose }: ExpandedTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [showOnlyIncreasing, setShowOnlyIncreasing] = useState(false)

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">No data available</div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Process data dynamically based on the actual structure
  const processExpandedData = () => {
    const rows: Array<{ [key: string]: any }> = []

    // Handle exchange rates data - show currency pairs in a simple table
    if (data.rates && typeof data.rates === 'object') {
      Object.entries(data.rates).forEach(([currency, rate]) => {
        if (typeof rate === 'number') {
          rows.push({
            Currency: currency,
            'Exchange Rate': rate.toFixed(6),
            'USD Value': `$${(1/rate).toFixed(2)}`,
          })
        }
      })
      return rows
    }

    // Handle cryptocurrency data (Coinbase format)
    if (data.data && data.data.rates) {
      Object.entries(data.data.rates).slice(0, 20).forEach(([currency, rate]) => {
        if (typeof rate === 'string') {
          const numRate = parseFloat(rate)
          if (!isNaN(numRate)) {
            rows.push({
              Currency: currency,
              [`${data.data.currency} Price`]: numRate.toLocaleString(),
            })
          }
        }
      })
      return rows
    }

    // Handle stock/financial data
    if (data['Global Quote']) {
      const quote = data['Global Quote']
      rows.push({
        Metric: 'Symbol',
        Value: quote['01. symbol'] || 'N/A'
      })
      rows.push({
        Metric: 'Current Price',
        Value: `$${quote['05. price'] || 'N/A'}`
      })
      rows.push({
        Metric: 'Change',
        Value: quote['09. change'] || 'N/A'
      })
      rows.push({
        Metric: 'Change %',
        Value: quote['10. change percent'] || 'N/A'
      })
      rows.push({
        Metric: 'Volume',
        Value: parseInt(quote['06. volume'] || '0').toLocaleString()
      })
      return rows
    }

    // Handle array data (list of items)
    if (Array.isArray(data)) {
      return data.slice(0, 50).map((item, index) => {
        const row: any = { '#': index + 1 }
        
        // Show only meaningful fields, not technical ones
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value !== 'object' && key !== 'id' && key !== '_id') {
            const cleanKey = key.replace(/([A-Z])/g, ' $1').trim()
            row[cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1)] = value
          }
        })
        return row
      })
    }

    // Handle simple object data - show only the meaningful values
    if (typeof data === 'object') {
      // If we have selected fields, show those in a simple format
      if (selectedFields.length > 0) {
        selectedFields.forEach(field => {
          const value = getNestedValue(data, field)
          if (value !== undefined && value !== null) {
            const cleanFieldName = field.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || field
            rows.push({
              Metric: cleanFieldName.charAt(0).toUpperCase() + cleanFieldName.slice(1),
              Value: typeof value === 'number' ? value.toLocaleString() : String(value)
            })
          }
        })
        return rows
      }

      // Show only meaningful top-level properties
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value !== 'object' && key !== 'timestamp' && key !== 'status') {
          rows.push({
            Property: key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase()),
            Value: typeof value === 'number' ? value.toLocaleString() : String(value)
          })
        }
      })
    }

    return rows
  }

  const tableData = processExpandedData()
  
  // Apply filters and sorting
  let filteredData = tableData.filter(row => {
    // Search filter
    const matchesSearch = Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Currency filter (for exchange rate data)
    const matchesCurrency = !currencyFilter || 
      (row.Currency && String(row.Currency).toLowerCase().includes(currencyFilter.toLowerCase()))
    
    return matchesSearch && matchesCurrency
  })

  // Sort data
  if (sortConfig) {
    filteredData.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue || '').toLowerCase()
      const bStr = String(bValue || '').toLowerCase()
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' }
        } else {
          return null // Remove sorting
        }
      } else {
        return { key, direction: 'asc' }
      }
    })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" />
    }
    return sortConfig.direction === 'asc' ? 
      <SortAsc size={12} className="text-emerald-400" /> : 
      <SortDesc size={12} className="text-emerald-400" />
  }

  // Get unique currencies for filter
  const uniqueCurrencies = [...new Set(
    tableData.map(row => row.Currency).filter(Boolean)
  )].slice(0, 20) // Limit for performance

  const formatValue = (value: any, key: string) => {
    if (value === null || value === undefined) return 'N/A'
    
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('price')) {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6
        }).format(value)
      }
      return new Intl.NumberFormat('en-US').format(value)
    }
    
    if (typeof value === 'string' && value.includes('%')) {
      const isPositive = value.includes('+')
      return (
        <span className={`flex items-center gap-1 ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {value}
        </span>
      )
    }
    
    return String(value)
  }

  const getColumnHeaders = () => {
    if (filteredData.length === 0) return []
    return Object.keys(filteredData[0])
  }

  const columnHeaders = getColumnHeaders()

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-emerald-400" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="text-sm text-gray-400">
                Showing {filteredData.length} items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Close expanded view"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center flex-wrap">
            {/* Currency Filter */}
            {uniqueCurrencies.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">All Currencies</option>
                  {uniqueCurrencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            {(currencyFilter || sortConfig) && (
              <button
                onClick={() => {
                  setCurrencyFilter('')
                  setSortConfig(null)
                }}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded border border-gray-600 hover:border-gray-500"
              >
                Clear Filters
              </button>
            )}

            {/* Results count */}
            <div className="text-xs text-gray-500 ml-auto">
              {filteredData.length} of {tableData.length} items
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-gray-400 mb-2">No data found</div>
                <div className="text-xs text-gray-500">Try adjusting your search</div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      {columnHeaders.map((header) => (
                        <th
                          key={header}
                          onClick={() => handleSort(header)}
                          className="group px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {header.replace(/([A-Z])/g, ' $1').trim()}
                            {getSortIcon(header)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredData.map((row, index) => (
                      <tr 
                        key={index} 
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        {columnHeaders.map((header) => (
                          <td
                            key={header}
                            className="px-4 py-3 text-sm text-white"
                          >
                            {formatValue(row[header], header)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Live data
          </div>
        </div>
      </div>
    </div>
  )
}
