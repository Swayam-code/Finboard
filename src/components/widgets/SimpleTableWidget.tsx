import React, { useEffect, useState } from 'react'
import { useApiStore } from '@/stores/apiStore'
import { getNestedValue } from '@/lib/utils'
import { RefreshCw, Search, TrendingUp, TrendingDown } from 'lucide-react'

interface SimpleTableWidgetProps {
  data: any
  selectedFields: string[]
  config?: any
  isExpanded?: boolean
}

export function SimpleTableWidget({ data, selectedFields, config, isExpanded }: SimpleTableWidgetProps) {
  const [searchTerm, setSearchTerm] = useState('')

  if (!data || selectedFields.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No data to display</div>
          <div className="text-xs text-gray-500">Check your field selection</div>
        </div>
      </div>
    )
  }

  // Process the data into table rows
  const processDataForTable = () => {
    const rows: Array<{ [key: string]: any }> = []

    // Handle different data structures
    if (selectedFields.includes('rates.EUR') || selectedFields.includes('rates.GBP')) {
      // Exchange rate format - convert rates to rows
      const baseCode = getNestedValue(data, 'base_code') || 'USD'
      
      selectedFields.forEach(field => {
        if (field.startsWith('rates.')) {
          const currency = field.replace('rates.', '')
          const rate = getNestedValue(data, field)
          if (rate !== undefined) {
            rows.push({
              Currency: currency,
              Rate: rate,
              'Base': baseCode
            })
          }
        }
      })
    } else {
      // Generic object format
      const row: { [key: string]: any } = {}
      selectedFields.forEach(field => {
        const value = getNestedValue(data, field)
        const fieldName = field.split('.').pop() || field
        row[fieldName] = value
      })
      if (Object.keys(row).length > 0) {
        rows.push(row)
      }
    }

    return rows
  }

  const tableData = processDataForTable()
  
  // Filter data based on search
  const filteredData = tableData.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

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
    
    return String(value)
  }

  const getColumnHeaders = () => {
    if (filteredData.length === 0) return []
    return Object.keys(filteredData[0])
  }

  const headers = getColumnHeaders()

  if (filteredData.length === 0) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Search className="mx-auto mb-3 text-gray-500" size={32} />
            <div className="text-gray-400">No matching data found</div>
            <div className="text-xs text-gray-500 mt-1">Try adjusting your search</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-600">
        <div className="overflow-x-auto max-h-64 custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-700 transition-colors">
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="px-4 py-3 text-sm text-gray-300 font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span>{formatValue(row[header], header)}</span>
                        {header.toLowerCase().includes('rate') && typeof row[header] === 'number' && (
                          <span className={`text-xs ${row[header] > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {row[header] > 1 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{filteredData.length} {filteredData.length === 1 ? 'row' : 'rows'}</span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          Live data
        </span>
      </div>
    </div>
  )
}
