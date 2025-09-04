import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { 
  DASHBOARD_TEMPLATES, 
  TEMPLATE_CATEGORIES, 
  createWidgetsFromTemplate,
  getTemplatesByCategory,
  searchTemplates,
  DashboardTemplate 
} from '@/data/templates'
import { useDashboardStore } from '@/stores/dashboardStore'
import { 
  Search, 
  Clock, 
  Plus, 
  Filter,
  Download
} from 'lucide-react'

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const { addWidget, setLoading } = useDashboardStore()

  const getFilteredTemplates = () => {
    let templates = DASHBOARD_TEMPLATES

    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory)
    }

    if (searchQuery) {
      templates = searchTemplates(searchQuery)
    }

    return templates
  }

  const handleApplyTemplate = async (templateId: string) => {
    setIsApplying(true)
    setLoading(true)
    
    try {
      // Close modal immediately to show expanded dashboard view
      onClose()
      
      // Apply template to the expanded dashboard
      const widgets = createWidgetsFromTemplate(templateId)
      
      for (const widget of widgets) {
        await new Promise(resolve => setTimeout(resolve, 100))
        addWidget(widget)
      }
      
    } catch (error) {
      console.error('Failed to apply template:', error)
    } finally {
      setLoading(false)
      setIsApplying(false)
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      intermediate: 'bg-amber-100 text-amber-800 border-amber-200', 
      advanced: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[difficulty as keyof typeof styles] || styles.beginner
  }

  const filteredTemplates = getFilteredTemplates()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="w-full max-w-full mx-auto min-h-[80vh]">
        {/* Professional Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                Dashboard Templates
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Choose from professionally designed templates to get started quickly
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTemplates.length} templates available
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Expanded Search Bar */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Templates
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>
            
            {/* Template Type Filter */}
            <div className="lg:w-80">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Category
              </label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing {filteredTemplates.length} of {DASHBOARD_TEMPLATES.length} templates
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
            </span>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`group bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              {/* Template Preview/Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-700">
                      <div className="w-6 h-6 bg-blue-600 rounded-lg"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          {template.widgets.length} widgets
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {template.estimatedSetupTime}m setup
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyBadge(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Template Details */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={tag}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border ${
                        index === 0 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                          : index === 1 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                          : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Live data</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300 capitalize">{template.category}</span>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApplyTemplate(template.id)
                    }}
                    disabled={isApplying}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 text-xs disabled:cursor-not-allowed"
                  >
                    {isApplying ? 'Applying...' : 'Use Template'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search query or category filter
            </p>
          </div>
        )}

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {selectedTemplate.name.replace(/^[🚀📈💱🌍🎯]\s/, '')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ready to deploy with {selectedTemplate.widgets.length} pre-configured widgets
                  </p>
                </div>
                <Button
                  onClick={() => handleApplyTemplate(selectedTemplate.id)}
                  disabled={isApplying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Applying Template...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Apply Template
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Info */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBadge(selectedTemplate.difficulty)}`}>
                        {selectedTemplate.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Setup Time:</span>
                      <span className="text-gray-900 dark:text-white">{selectedTemplate.estimatedSetupTime} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white capitalize">{selectedTemplate.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Widgets:</span>
                      <span className="text-gray-900 dark:text-white">{selectedTemplate.widgets.length} components</span>
                    </div>
                  </div>
                  
                  {/* API Key Notice */}
                  {selectedTemplate.id !== 'demo-dashboard' ? (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</div>
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">API Keys Required</p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Replace placeholder API keys with your actual keys for full functionality
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">✅</div>
                        <div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Ready to Use</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                            No API keys required - uses free public APIs
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Widget List */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Included Widgets</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTemplate.widgets.map((widget, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center text-sm">
                          {widget.type === 'card' && '📊'}
                          {widget.type === 'table' && '📋'}
                          {widget.type === 'chart' && '📈'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {widget.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {widget.type} widget
                          </div>
                        </div>
                        {widget.webSocket?.enabled && (
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                            Live
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TemplateModal
