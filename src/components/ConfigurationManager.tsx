import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Download, Upload, Settings, FileDown, FileUp, AlertCircle } from 'lucide-react'
import { useDashboardStore } from '@/stores/dashboardStore'

const ConfigurationManager: React.FC = () => {
  const { exportConfiguration, importConfiguration, error, clearError } = useDashboardStore()
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleExport = () => {
    const config = exportConfiguration()
    
    // Download as file
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setIsExportOpen(false)
  }

  const handleImport = async () => {
    if (!importText.trim()) {
      setImportResult({ success: false, message: 'Please paste your configuration JSON' })
      return
    }

    const success = await importConfiguration(importText)
    
    if (success) {
      setImportResult({ success: true, message: 'Configuration imported successfully!' })
      setImportText('')
      setTimeout(() => {
        setIsImportOpen(false)
        setImportResult(null)
      }, 2000)
    } else {
      setImportResult({ success: false, message: error || 'Import failed' })
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportText(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Export Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsExportOpen(true)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export Config
      </Button>

      {/* Import Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsImportOpen(true)}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Import Config
      </Button>

      {/* Export Modal */}
      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Dashboard Configuration"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <FileDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Export Configuration</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Download your complete dashboard configuration including all widgets, layouts, and settings.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This will create a JSON file containing your entire dashboard setup. You can use this to backup or share your configuration.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Download Configuration
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false)
          setImportText('')
          setImportResult(null)
          clearError()
        }}
        title="Import Dashboard Configuration"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">Warning</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                This will replace your current dashboard configuration. Make sure to export your current setup first if you want to keep it.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Import from file
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Or paste configuration JSON
            </label>
            <textarea
              placeholder="Paste your exported configuration JSON here..."
              value={importText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportText(e.target.value)}
              className="w-full min-h-[200px] p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {importResult && (
            <div className={`p-4 rounded-lg border ${
              importResult.success 
                ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm ${
                importResult.success 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {importResult.message}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importText.trim()} className="gap-2">
              <Upload className="h-4 w-4" />
              Import Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ConfigurationManager
