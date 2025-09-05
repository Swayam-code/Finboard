import React, { useState, useEffect, useRef } from 'react'
import { useDashboardStore } from '@/stores/dashboardStore'
import { AddWidgetModal } from '@/components/AddWidgetModal'
import { WidgetManager } from '@/components/WidgetManager'
import { DraggableWidgetGrid } from '@/components/DraggableWidgetGrid'
import ConfigurationManager from '@/components/ConfigurationManager'
import ThemeToggle from '@/components/ThemeToggle'
import TemplateModal from '@/components/TemplateModal'
import { useTheme } from '@/hooks/useTheme'
import { useScreenSize, getResponsiveIconSize } from '@/hooks/useScreenSize'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, Settings, Zap, TrendingUp, Clock, PieChart, Grid3x3, Sparkles, Menu, X } from 'lucide-react'

export function Dashboard() {
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false)
  const [isWidgetManagerOpen, setIsWidgetManagerOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  
  const { widgets, resetDashboard } = useDashboardStore()
  const { resolvedTheme } = useTheme()
  const screenSize = useScreenSize()

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Close mobile menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])

  const stats = {
    totalWidgets: widgets.length,
    activeWidgets: widgets.filter(w => !w.config?.isPaused).length,
    chartWidgets: widgets.filter(w => w.type === 'chart').length,
    tableWidgets: widgets.filter(w => w.type === 'table').length,
    cardWidgets: widgets.filter(w => w.type === 'card').length
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Modern Enhanced Header with Collapsible Mobile Menu */}
      <header ref={mobileMenuRef} className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-xl">
        <div className="px-3 sm:px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left Section - Logo & Branding */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Premium Logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <BarChart3 className="text-white" size={20} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    FinBoard
                  </h1>
                  <p className="text-xs text-gray-400 font-medium hidden sm:block">
                    Professional Financial Dashboard
                  </p>
                </div>
              </div>

              {/* Live Dashboard Stats - Hidden on Mobile */}
              {widgets.length > 0 && (
                <div className="hidden xl:flex items-center gap-4 ml-8 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300 font-medium">{stats.totalWidgets} Widgets</span>
                  </div>
                  <div className="w-px h-4 bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-sm text-gray-300">{stats.activeWidgets} Active</span>
                  </div>
                  <div className="w-px h-4 bg-gray-600"></div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" />
                    <span className="text-sm text-gray-300">Live Data</span>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-1 sm:gap-3">
              {/* Configuration Manager */}
              {widgets.length > 0 && <ConfigurationManager />}
              
              {/* Widget Management */}
              {widgets.length > 0 && (
                <>
                  <Button
                    onClick={() => setIsWidgetManagerOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800/70 border border-gray-700/50 backdrop-blur-sm px-3"
                    title="Manage Widgets"
                  >
                    <Settings size={14} />
                    <span className="hidden lg:inline ml-2">Manage</span>
                  </Button>

                  {/* Clear All Button */}
                  <Button 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to clear all widgets?')) {
                        resetDashboard()
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-800/50 px-3"
                    title="Clear All"
                  >
                    <span className="hidden lg:inline">Clear</span>
                    <span className="lg:hidden">✕</span>
                  </Button>
                </>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Primary CTA - Add Widget */}
              <Button 
                onClick={() => setIsAddWidgetModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 border-0 px-4 py-2.5 font-medium transition-all duration-200"
              >
                <Plus size={14} />
                <span>Add</span>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              {/* Quick Add Button - Always visible on mobile */}
              <Button 
                onClick={() => setIsAddWidgetModalOpen(true)}
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 border-0 px-3 py-2 font-medium transition-all duration-200"
              >
                <Plus size={14} />
                <span className="text-sm">Add</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800/70 border border-gray-700/50 p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800/50 bg-gray-900/98 backdrop-blur-xl mobile-menu-enter">
            <div className="px-3 py-4 space-y-3 max-w-7xl mx-auto">
              {/* Mobile Stats */}
              {widgets.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300 font-medium">{stats.totalWidgets} Widgets</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-sm text-gray-300">{stats.activeWidgets} Active</span>
                  </div>
                </div>
              )}

              {/* Mobile Menu Items */}
              {widgets.length > 0 && (
                <>
                  {/* Configuration Manager */}
                  <div className="flex justify-center">
                    <ConfigurationManager />
                  </div>
                  
                  {/* Widget Management */}
                  <Button
                    onClick={() => {
                      setIsWidgetManagerOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/70 border border-gray-700/50 p-3 transition-all duration-200"
                  >
                    <Settings size={16} className="mr-3" />
                    Manage Widgets
                  </Button>

                  {/* Clear All Button */}
                  <Button 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to clear all widgets?')) {
                        resetDashboard()
                        setIsMobileMenuOpen(false)
                      }
                    }}
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-800/50 p-3 transition-all duration-200"
                  >
                    <X size={16} className="mr-3" />
                    Clear All Widgets
                  </Button>
                </>
              )}

              {/* Theme Toggle */}
              <div className="flex justify-center pt-2 border-t border-gray-800/50">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {widgets.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Dashboard Header - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  Your Dashboard
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Last updated:</span>
                    <span className="sm:hidden">Updated:</span>
                    {new Date().toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap size={12} className="sm:w-3.5 sm:h-3.5" />
                    {stats.activeWidgets} of {stats.totalWidgets} active
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWidgetManagerOpen(true)}
                  className="text-gray-400 hover:text-white border-gray-600 hover:border-gray-500 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                >
                  <Settings size={12} className="sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Manage Widgets</span>
                  <span className="sm:hidden">Manage</span>
                </Button>
              </div>
            </div>

            {/* Widget Grid */}
            <DraggableWidgetGrid 
              widgets={widgets}
              onAddWidget={() => setIsAddWidgetModalOpen(true)}
            />
          </div>
        ) : (
          /* Mobile-Responsive Empty State */
          <div className="min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center">
            <div className="text-center max-w-xs sm:max-w-4xl mx-auto px-4 sm:px-6">
              {/* Hero Section */}
              <div className="mb-8 sm:mb-12">
                {/* Animated Financial Icon Group - Responsive */}
                <div className="relative mb-6 sm:mb-8">
                  <div className="flex justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl sm:rounded-2xl border border-emerald-500/20 backdrop-blur-sm animate-float">
                      <BarChart3 size={getResponsiveIconSize(screenSize, 20, 32)} className="text-emerald-400" />
                    </div>
                    <div className="p-2 sm:p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl sm:rounded-2xl border border-blue-500/20 backdrop-blur-sm animate-float" style={{ animationDelay: '0.5s' }}>
                      <TrendingUp size={getResponsiveIconSize(screenSize, 20, 32)} className="text-blue-400" />
                    </div>
                    <div className="p-2 sm:p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl sm:rounded-2xl border border-purple-500/20 backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }}>
                      <PieChart size={getResponsiveIconSize(screenSize, 20, 32)} className="text-purple-400" />
                    </div>
                  </div>
                  
                  {/* Floating particles - Hidden on mobile */}
                  <div className="absolute inset-0 pointer-events-none hidden sm:block">
                    <div className="absolute top-4 left-1/4 w-2 h-2 bg-emerald-400/60 rounded-full animate-ping"></div>
                    <div className="absolute bottom-8 right-1/3 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-12 right-1/4 w-1 h-1 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4 sm:mb-6 animate-slide-up">
                  Welcome to FinBoard
                </h1>
                
                <p className="text-sm sm:text-xl text-gray-400 leading-relaxed mb-6 sm:mb-8 animate-slide-up px-2" style={{ animationDelay: '0.2s' }}>
                  Build your personalized financial command center with real-time data from any API.
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>Track markets, analyze trends, and make informed decisions—all in one place.
                </p>
                
                {/* Primary CTAs - Mobile Stack */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 mb-6 sm:mb-8">
                  <Button 
                    onClick={() => setIsAddWidgetModalOpen(true)}
                    size="lg"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 animate-bounce-in w-full sm:w-auto"
                    style={{ animationDelay: '0.4s' }}
                  >
                    <Plus size={getResponsiveIconSize(screenSize, 20, 24)} />
                    <span className="sm:hidden">Create Widget</span>
                    <span className="hidden sm:inline">Create Your First Widget</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setIsTemplateModalOpen(true)}
                    size="lg"
                    variant="outline"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 animate-bounce-in w-full sm:w-auto"
                    style={{ animationDelay: '0.6s' }}
                  >
                    <Sparkles size={getResponsiveIconSize(screenSize, 20, 24)} />
                    Use Template
                  </Button>
                </div>
              </div>

              {/* Feature Showcase - Mobile responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                {[
                  {
                    icon: <Zap className="text-yellow-400" size={getResponsiveIconSize(screenSize, 20, 28)} />,
                    title: "Real-Time Data",
                    description: screenSize.isMobile ? "Live market updates" : "Live market updates every 30 seconds with automatic refresh and error handling",
                    color: "from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                  },
                  {
                    icon: <Grid3x3 className="text-blue-400" size={getResponsiveIconSize(screenSize, 20, 28)} />,
                    title: "Drag & Drop",
                    description: screenSize.isMobile ? "Customizable layouts" : "Intuitive dashboard builder with customizable layouts and responsive design",
                    color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
                  },
                  {
                    icon: <BarChart3 className="text-emerald-400" size={getResponsiveIconSize(screenSize, 20, 28)} />,
                    title: "Smart Charts",
                    description: screenSize.isMobile ? "Interactive visualizations" : "AI-powered chart selection with interactive visualizations and multiple formats",
                    color: "from-emerald-500/10 to-green-500/10 border-emerald-500/20"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className={`p-4 sm:p-6 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl border backdrop-blur-sm hover:scale-105 transition-all duration-300 animate-slide-up`}
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <div className="mb-3 sm:mb-4 flex justify-center">{feature.icon}</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Modals */}
      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
      />
      
      <WidgetManager
        isOpen={isWidgetManagerOpen}
        onClose={() => setIsWidgetManagerOpen(false)}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </div>
  )
}
