import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useApiStore } from '@/stores/apiStore'
import { useScreenSize, getResponsiveIconSize } from '@/hooks/useScreenSize'
import { WidgetType, ApiField } from '@/types'
import { Search, Plus, Trash2, TestTube, Zap, Clock, CheckCircle, XCircle, Loader2, TrendingUp, DollarSign, BarChart3, Globe } from 'lucide-react'

// Pre-configured API endpoints using reliable, free APIs
const preConfiguredApis = [
  {
    name: 'Bitcoin Exchange Rates',
    description: 'Live Bitcoin exchange rates from Coinbase',
    url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
    type: 'card' as WidgetType,
    icon: DollarSign,
    color: 'orange'
  },
  {
    name: 'Ethereum Exchange Rates',
    description: 'Live Ethereum exchange rates from Coinbase',
    url: 'https://api.coinbase.com/v2/exchange-rates?currency=ETH',
    type: 'card' as WidgetType,
    icon: TrendingUp,
    color: 'blue'
  },
  {
    name: 'USD Exchange Rates',
    description: 'Current USD exchange rates to world currencies',
    url: 'https://api.exchangerate-api.com/v4/latest/USD',
    type: 'table' as WidgetType,
    icon: Globe,
    color: 'emerald'
  },
  {
    name: 'EUR Exchange Rates',
    description: 'Current EUR exchange rates to world currencies',
    url: 'https://api.exchangerate-api.com/v4/latest/EUR',
    type: 'table' as WidgetType,
    icon: Globe,
    color: 'purple'
  }
]

interface AddWidgetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddWidgetModal({ isOpen, onClose }: AddWidgetModalProps) {
  const [widgetName, setWidgetName] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [displayMode, setDisplayMode] = useState<WidgetType>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const [availableFields, setAvailableFields] = useState<ApiField[]>([])
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')
  const [step, setStep] = useState(1) // 1: Setup, 2: Field Selection
  const [showArraysOnly, setShowArraysOnly] = useState(false)

  const addWidget = useDashboardStore((state) => state.addWidget)
  const { testApiConnection, isLoading } = useApiStore()
  const screenSize = useScreenSize()

  const handleTestConnection = async () => {
    if (!apiUrl.trim()) return

    setIsTestingConnection(true)
    setConnectionStatus('idle')
    setConnectionMessage('')

    try {
      const response = await testApiConnection(apiUrl)
      
      if (response.status === 'success') {
        setAvailableFields(response.fields)
        setConnectionStatus('success')
        setConnectionMessage(`🎉 Connection successful! Found ${response.fields.length} fields.`)
        setStep(3) // Move to field selection
      } else {
        setConnectionStatus('error')
        setConnectionMessage(response.error || 'Failed to connect to API')
        setAvailableFields([])
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionMessage('Failed to test API connection')
      setAvailableFields([])
    } finally {
      setIsTestingConnection(false)
    }
  }

  const filteredFields = availableFields.filter(field => {
    const matchesSearch = !searchTerm || 
      field.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.path.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesArrayFilter = !showArraysOnly || field.type === 'array'
    
    return matchesSearch && matchesArrayFilter
  })

  const handleFieldToggle = (fieldPath: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldPath)
        ? prev.filter(f => f !== fieldPath)
        : [...prev, fieldPath]
    )
  }

  const handlePreConfiguredSelect = (api: typeof preConfiguredApis[0]) => {
    setWidgetName(api.name)
    setApiUrl(api.url)
    setDisplayMode(api.type)
    setStep(2) // Go to API testing step for all APIs
  }

  const handleAddWidget = () => {
    if (!widgetName.trim() || !apiUrl.trim() || selectedFields.length === 0) {
      return
    }

    addWidget({
      name: widgetName,
      type: displayMode,
      apiUrl: apiUrl.trim(),
      refreshInterval,
      selectedFields,
      size: { width: 300, height: 200 },
      config: {
        title: widgetName,
        showHeader: true,
        showTimestamp: true,
      }
    })

    handleClose()
  }

  const handleClose = () => {
    // Reset form
    setStep(1)
    setWidgetName('')
    setApiUrl('')
    setRefreshInterval(30)
    setSelectedFields([])
    setDisplayMode('card')
    setAvailableFields([])
    setConnectionStatus('idle')
    setConnectionMessage('')
    setSearchTerm('')
    
    onClose()
  }

  const canProceedToNext = () => {
    if (step === 1) return widgetName.trim() && apiUrl.trim()
    if (step === 2) return connectionStatus === 'success'
    if (step === 3) return selectedFields.length > 0
    return false
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="lg">
      <div className="space-y-6 sm:space-y-8">
        {/* Header - Mobile Optimized */}
        <div className="text-center pb-4 sm:pb-6 border-b border-gray-700">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <Plus className="text-white" size={getResponsiveIconSize(screenSize, 20, 24)} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Create New Widget</h2>
          <p className="text-sm sm:text-base text-gray-400 px-2">Connect to any API and visualize your data</p>
        </div>

        {/* Progress Steps - Mobile Responsive */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          {[
            { num: 1, label: 'Setup' },
            { num: 2, label: 'Test' },
            { num: 3, label: 'Configure' }
          ].map((stepInfo, index) => (
            <div key={stepInfo.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  step >= stepInfo.num 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step > stepInfo.num ? (
                    <CheckCircle size={getResponsiveIconSize(screenSize, 16, 20)} />
                  ) : (
                    stepInfo.num
                  )}
                </div>
                <span className={`text-xs mt-1 sm:mt-2 transition-colors ${
                  step >= stepInfo.num ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {stepInfo.label}
                </span>
              </div>
              {index < 2 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 mt-[-20px] transition-colors duration-300 ${
                  step > stepInfo.num ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="text-emerald-400" size={18} />
                </div>
                <h3 className="text-xl font-semibold text-white">Widget Configuration</h3>
              </div>
              
              <div className="space-y-6">
                {/* Pre-configured APIs */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <Zap className="inline mr-2" size={16} />
                    Quick Start with Pre-configured APIs
                  </label>
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {preConfiguredApis.map((api, index) => {
                      const Icon = api.icon
                      const colorClasses = {
                        emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
                        orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                        blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                        purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                      }
                      return (
                        <button
                          key={index}
                          onClick={() => handlePreConfiguredSelect(api)}
                          className={`p-3 sm:p-4 text-left bg-gradient-to-r ${colorClasses[api.color as keyof typeof colorClasses]} rounded-lg transition-all duration-200 hover:shadow-lg hover:transform hover:scale-105 group w-full`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <Icon className="text-white mr-2" size={16} />
                                <span className="text-white font-semibold text-sm sm:text-base">{api.name}</span>
                              </div>
                              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                                {api.description}
                              </p>
                            </div>
                            <div className="ml-3 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Zap size={16} className="text-white" />
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-800 text-gray-400">Or create a custom widget</span>
                    </div>
                  </div>
                </div>

                {/* Widget Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Widget Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Bitcoin Price Tracker, Stock Portfolio, Weather Data"
                    value={widgetName}
                    onChange={(e) => setWidgetName(e.target.value)}
                    className="w-full h-12 bg-gray-900 border-gray-600 focus:border-green-500 focus:ring-green-500 text-white placeholder-gray-400"
                  />
                </div>

                {/* API URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    API Endpoint *
                  </label>
                  <Input
                    type="url"
                    placeholder="https://api.example.com/data"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full h-12 bg-gray-900 border-gray-600 focus:border-green-500 focus:ring-green-500 text-white placeholder-gray-400"
                  />
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock size={14} className="mr-2" />
                    Must return JSON data and support CORS
                  </div>
                </div>

                {/* Refresh Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Refresh Interval
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="10"
                      max="3600"
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)}
                      className="w-32 h-12 bg-gray-900 border-gray-600 focus:border-green-500 focus:ring-green-500 text-white"
                    />
                    <span className="text-gray-400 text-sm">seconds</span>
                    <div className="flex-1 bg-gray-700 h-2 rounded-full">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((refreshInterval / 3600) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: API Testing */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="text-green-400" size={18} />
                </div>
                <h3 className="text-xl font-semibold text-white">Test API Connection</h3>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <p className="text-white font-medium text-lg">{widgetName}</p>
                    <p className="text-gray-400 text-sm">Ready to connect to your selected API</p>
                  </div>
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !apiUrl.trim()}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 shadow-lg"
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2" size={16} />
                        Test & Continue
                      </>
                    )}
                  </Button>
                </div>

                {connectionMessage && (
                  <div className={`flex items-center p-4 rounded-lg border ${
                    connectionStatus === 'success' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : connectionStatus === 'error'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                  }`}>
                    {connectionStatus === 'success' && <CheckCircle className="mr-3 flex-shrink-0" size={20} />}
                    {connectionStatus === 'error' && <XCircle className="mr-3 flex-shrink-0" size={20} />}
                    <span className="text-sm font-medium">{connectionMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Field Selection */}
        {step === 3 && connectionStatus === 'success' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Configure Widget</h3>
              
              {/* Display Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Display Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['card', 'table', 'chart'] as WidgetType[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        displayMode === mode
                          ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium capitalize">{mode}</div>
                        <div className="text-xs mt-1">
                          {mode === 'card' && 'Key metrics'}
                          {mode === 'table' && 'Tabular data'}
                          {mode === 'chart' && 'Visual trends'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Data Fields
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="text"
                    placeholder="Search fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {displayMode === 'table' && (
                  <label className="flex items-center mt-3 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={showArraysOnly}
                      onChange={(e) => setShowArraysOnly(e.target.checked)}
                      className="mr-2 rounded border-gray-600 bg-gray-800"
                    />
                    Show arrays only (recommended for tables)
                  </label>
                )}
              </div>

              {/* Available Fields */}
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-3">
                  Available Fields ({filteredFields.length})
                </div>
                <div className="max-h-64 overflow-y-auto border border-gray-600 rounded-lg custom-scrollbar">
                  {filteredFields.map((field) => (
                    <div
                      key={field.path}
                      className="flex items-center justify-between p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-white truncate">
                            {field.path}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            field.type === 'number' ? 'bg-blue-900 text-blue-300' :
                            field.type === 'string' ? 'bg-green-900 text-green-300' :
                            field.type === 'array' ? 'bg-purple-900 text-purple-300' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {field.type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {typeof field.value === 'string' && field.value.length > 30 
                            ? field.value.substring(0, 30) + '...' 
                            : String(field.value)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleFieldToggle(field.path)}
                        className={`ml-3 p-1.5 rounded transition-colors ${
                          selectedFields.includes(field.path)
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {selectedFields.includes(field.path) ? (
                          <Trash2 size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>
                    </div>
                  ))}
                  
                  {filteredFields.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      <Search size={32} className="mx-auto mb-2 opacity-50" />
                      <div>No fields match your search</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Fields */}
              {selectedFields.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-3">
                    Selected Fields ({selectedFields.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFields.map((fieldPath) => (
                      <div
                        key={fieldPath}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/30 border border-emerald-700 rounded-lg"
                      >
                        <span className="text-sm text-emerald-300">{fieldPath}</span>
                        <button
                          onClick={() => handleFieldToggle(fieldPath)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {/* Footer - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 pt-6 sm:pt-8 border-t border-gray-700">
          <div className="flex gap-3 order-2 sm:order-1">
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-gray-400 hover:text-white hover:bg-gray-800 px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base flex-1 sm:flex-none"
              >
                ← Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => step === 2 ? handleTestConnection() : setStep(step + 1)}
                disabled={!canProceedToNext()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 sm:px-8 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base flex-1 sm:flex-none"
              >
                {step === 2 ? (
                  <>
                    <Plus className="mr-1 sm:mr-2" size={14} />
                    <span className="hidden sm:inline">Test & Continue</span>
                    <span className="sm:hidden">Test</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Next Step</span>
                    <span className="sm:hidden">Next</span>
                    <span className="ml-1 sm:ml-2">→</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleAddWidget}
                disabled={selectedFields.length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base flex-1 sm:flex-none"
              >
                <Plus className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">Create Widget</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
