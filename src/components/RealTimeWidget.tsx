import React, { useEffect, useState, useRef } from 'react'
import { Widget } from '@/types'
import { useWebSocket } from '@/services/websocket'
import { Wifi, WifiOff, Activity, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RealTimeWidgetProps {
  widget: Widget
  onDataUpdate: (data: any) => void
  onStatusChange: (status: 'connected' | 'disconnected' | 'error') => void
}

const RealTimeWidget: React.FC<RealTimeWidgetProps> = ({ 
  widget, 
  onDataUpdate, 
  onStatusChange 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [isActive, setIsActive] = useState(true)
  const [lastDataReceived, setLastDataReceived] = useState<Date | null>(null)
  const [dataCount, setDataCount] = useState(0)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const webSocket = useWebSocket()
  const connectionId = `widget-${widget.id}`

  const connect = () => {
    if (!widget.webSocket?.enabled || !widget.webSocket.url) {
      console.warn('WebSocket not configured for widget:', widget.id)
      return
    }

    setConnectionStatus('connecting')
    
    const success = webSocket.createConnection(connectionId, widget.webSocket.url)
    
    if (success && widget.webSocket.channel) {
      webSocket.subscribe(connectionId, widget.webSocket.channel, (data) => {
        if (isActive) {
          setLastDataReceived(new Date())
          setDataCount(prev => prev + 1)
          onDataUpdate(data)
        }
      })
    }

    // Check connection status
    const statusChecker = setInterval(() => {
      const status = webSocket.getConnectionStatus(connectionId)
      
      switch (status) {
        case 'connected':
          setConnectionStatus('connected')
          onStatusChange('connected')
          break
        case 'disconnected':
        case 'closed':
          setConnectionStatus('disconnected')
          onStatusChange('disconnected')
          break
        case 'connecting':
          setConnectionStatus('connecting')
          break
        default:
          setConnectionStatus('error')
          onStatusChange('error')
      }

      if (status === 'connected' || status === 'disconnected') {
        clearInterval(statusChecker)
      }
    }, 1000)

    // Setup heartbeat if configured
    if (widget.webSocket.heartbeatInterval) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (webSocket.isConnected(connectionId)) {
          // Send heartbeat or check connection
          console.log(`Heartbeat for widget ${widget.id}`)
        }
      }, widget.webSocket.heartbeatInterval * 1000)
    }
  }

  const disconnect = () => {
    webSocket.disconnect(connectionId)
    setConnectionStatus('disconnected')
    onStatusChange('disconnected')
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }

  const toggleConnection = () => {
    if (connectionStatus === 'connected') {
      disconnect()
    } else {
      connect()
    }
  }

  const toggleActive = () => {
    setIsActive(!isActive)
  }

  useEffect(() => {
    if (widget.webSocket?.enabled && isActive) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [widget.webSocket?.enabled, widget.webSocket?.url, widget.webSocket?.channel])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400'
      case 'connecting':
        return 'text-yellow-400'
      case 'disconnected':
        return 'text-gray-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className={`h-4 w-4 ${getStatusColor()}`} />
      case 'connecting':
        return <Activity className={`h-4 w-4 ${getStatusColor()} animate-pulse`} />
      case 'disconnected':
      case 'error':
      default:
        return <WifiOff className={`h-4 w-4 ${getStatusColor()}`} />
    }
  }

  if (!widget.webSocket?.enabled) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg backdrop-blur-sm">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
        </span>
      </div>

      {/* Data Counter */}
      {connectionStatus === 'connected' && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>•</span>
          <span>{dataCount} updates</span>
          {lastDataReceived && (
            <span className="text-gray-500">
              {lastDataReceived.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1 ml-auto">
        <Button
          onClick={toggleActive}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          title={isActive ? 'Pause real-time updates' : 'Resume real-time updates'}
        >
          {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        
        <Button
          onClick={toggleConnection}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          title={connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
        >
          {connectionStatus === 'connected' ? (
            <WifiOff className="h-3 w-3" />
          ) : (
            <Wifi className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default RealTimeWidget
