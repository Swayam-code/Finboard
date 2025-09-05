import React, { useState, useMemo } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useApiStore } from '@/stores/apiStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3x3, 
  List, 
  Trash2, 
  Play, 
  Pause, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  Table,
  PieChart,
  Clock,
  Zap,
  AlertCircle
} from 'lucide-react'
import type { Widget, WidgetType } from '@/types'

interface WidgetManagerProps {
  isOpen: boolean
  onClose: () => void
}

type SortBy = 'name' | 'type' | 'created' | 'lastUpdated' | 'status'
type SortOrder = 'asc' | 'desc'
type FilterBy = 'all' | 'active' | 'paused' | 'error'

export function WidgetManager({ isOpen, onClose }: WidgetManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([])

  const { widgets, removeWidget, updateWidget } = useDashboardStore()
  const { cache, isLoading } = useApiStore()

  // Get widget status
  const getWidgetStatus = (widget: Widget): 'active' | 'paused' | 'error' => {
    const widgetData = cache[widget.apiUrl]
    
    if (!widgetData && !isLoading) return 'error'
    if (widget.config?.isPaused) return 'paused'
    return 'active'
  }

  // Filter and sort widgets
  const filteredAndSortedWidgets = useMemo(() => {
    let filtered = widgets.filter(widget => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (widget.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (widget.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (widget.apiUrl || '').toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const status = getWidgetStatus(widget)
      const matchesFilter = filterBy === 'all' || status === filterBy

      return matchesSearch && matchesFilter
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
          break
        case 'type':
          aValue = a.type || ''
          bValue = b.type || ''
          break
        case 'created':
          aValue = a.id // Using ID as proxy for creation time
          bValue = b.id
          break
        case 'lastUpdated':
          aValue = cache[a.apiUrl]?.timestamp || 0
          bValue = cache[b.apiUrl]?.timestamp || 0
          break
        case 'status':
          aValue = getWidgetStatus(a)
          bValue = getWidgetStatus(b)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [widgets, searchTerm, sortBy, sortOrder, filterBy, cache, isLoading])

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const handleSelectWidget = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    )
  }

  const handleSelectAll = () => {
    if (selectedWidgets.length === filteredAndSortedWidgets.length) {
      setSelectedWidgets([])
    } else {
      setSelectedWidgets(filteredAndSortedWidgets.map(w => w.id))
    }
  }

  const handleBulkAction = (action: 'delete' | 'pause' | 'resume' | 'refresh') => {
    selectedWidgets.forEach(widgetId => {
      const widget = widgets.find(w => w.id === widgetId)
      if (!widget) return

      switch (action) {
        case 'delete':
          removeWidget(widgetId)
          break
        case 'pause':
          updateWidget(widgetId, { 
            config: { ...widget.config, isPaused: true } 
          })
          break
        case 'resume':
          updateWidget(widgetId, { 
            config: { ...widget.config, isPaused: false } 
          })
          break
        // refresh would be handled by the API store
      }
    })
    setSelectedWidgets([])
  }

  const getTypeIcon = (type: WidgetType) => {
    switch (type) {
      case 'card': return <BarChart3 size={16} />
      case 'table': return <Table size={16} />
      case 'chart': return <PieChart size={16} />
      default: return <BarChart3 size={16} />
    }
  }

  const getStatusBadge = (widget: Widget) => {
    const status = getWidgetStatus(widget)
    const statusConfig = {
      active: { 
        color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700', 
        icon: <Zap size={12} />,
        text: 'Active'
      },
      paused: { 
        color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700', 
        icon: <Pause size={12} />,
        text: 'Paused'
      },
      error: { 
        color: 'text-red-400 bg-red-900/30 border-red-700', 
        icon: <AlertCircle size={12} />,
        text: 'Error'
      }
    }

    const config = statusConfig[status]
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${config.color}`}>
        {config.icon}
        {config.text}
      </div>
    )
  }

  const formatLastUpdated = (apiUrl: string) => {
    const cached = cache[apiUrl]
    if (!cached) return 'Never'
    
    const date = new Date(cached.timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    
    return date.toLocaleDateString()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Widget Manager" size="xl">
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Search */}
          <div className="relative flex-1 w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="text"
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg shadow-sm"
            />
          </div>

          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white shadow-sm"
          >
            <option value="all">All Widgets</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="error">Error</option>
          </select>

          {/* View Mode */}
          <div className="flex bg-gray-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid3x3 size={16} />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedWidgets.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-600 shadow-sm justify-center">
            <span className="text-sm text-gray-300">
              {selectedWidgets.length} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleBulkAction('pause')} className="text-yellow-400 hover:text-yellow-300">
                <Pause size={14} className="mr-1" /> Pause
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleBulkAction('resume')} className="text-emerald-400 hover:text-emerald-300">
                <Play size={14} className="mr-1" /> Resume
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleBulkAction('delete')} className="text-red-400 hover:text-red-300">
                <Trash2 size={14} className="mr-1" /> Delete
              </Button>
            </div>
          </div>
        )}

        {/* Widget List/Grid */}
        <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800 rounded-xl text-sm font-semibold text-gray-300 shadow-sm">
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    checked={selectedWidgets.length === filteredAndSortedWidgets.length && filteredAndSortedWidgets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-600 bg-gray-800"
                  />
                </div>
                <div className="col-span-3">Name {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</div>
                <div className="col-span-2">Type {sortBy === 'type' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</div>
                <div className="col-span-2">Status {sortBy === 'status' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</div>
                <div className="col-span-2">Updated {sortBy === 'lastUpdated' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</div>
                <div className="col-span-2">Actions</div>
              </div>
              {/* Rows */}
              {filteredAndSortedWidgets.map((widget) => (
                <div key={widget.id} className="grid grid-cols-12 gap-4 p-4 bg-gray-800/60 hover:bg-gray-800 rounded-xl transition-colors shadow-sm items-center">
                  <div className="col-span-1 flex justify-center">
                    <input type="checkbox" checked={selectedWidgets.includes(widget.id)} onChange={() => handleSelectWidget(widget.id)} className="rounded border-gray-600 bg-gray-800" />
                  </div>
                  <div className="col-span-3">
                    <div className="font-semibold text-white truncate">{widget.name}</div>
                    <div className="text-xs text-gray-400 truncate">{widget.apiUrl}</div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">{getTypeIcon(widget.type)}<span className="text-sm text-gray-300 capitalize">{widget.type}</span></div>
                  <div className="col-span-2">{getStatusBadge(widget)}</div>
                  <div className="col-span-2 text-sm text-gray-400">{formatLastUpdated(widget.apiUrl)}</div>
                  <div className="col-span-2 flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-white" title="Edit widget"><Settings size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => removeWidget(widget.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-400" title="Delete widget"><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedWidgets.map((widget) => (
                <div key={widget.id} className="p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedWidgets.includes(widget.id)} onChange={() => handleSelectWidget(widget.id)} className="rounded border-gray-600 bg-gray-800" />
                      {getTypeIcon(widget.type)}
                    </div>
                    {getStatusBadge(widget)}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white truncate">{widget.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{widget.apiUrl}</p>
                    <p className="text-xs text-gray-500">Updated: {formatLastUpdated(widget.apiUrl)}</p>
                  </div>
                  <div className="flex justify-end gap-1 mt-3">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-white" title="Edit widget"><Settings size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => removeWidget(widget.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-red-400" title="Delete widget"><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedWidgets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full flex items-center justify-center">
                  <Search className="text-emerald-500" size={40} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No widgets found</h3>
              <p className="text-gray-400 text-lg mb-4">
                {searchTerm || filterBy !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Create your first widget to get started!'}
              </p>
              <Button onClick={onClose} className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2 text-white font-semibold rounded-lg shadow-lg">
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {filteredAndSortedWidgets.length} of {widgets.length} widgets
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
