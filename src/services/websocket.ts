interface WebSocketConnection {
  url: string
  socket: WebSocket | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectInterval: number
  isManuallyDisconnected: boolean
  subscriptions: Set<string>
  messageHandlers: Map<string, (data: any) => void>
}

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'data' | 'error' | 'heartbeat'
  channel?: string
  data?: any
  error?: string
}

class WebSocketManager {
  private connections = new Map<string, WebSocketConnection>()
  private globalHandlers = new Map<string, Set<(data: any) => void>>()

  private initializeConnection(url: string): WebSocketConnection {
    return {
      url,
      socket: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectInterval: 5000,
      isManuallyDisconnected: false,
      subscriptions: new Set(),
      messageHandlers: new Map()
    }
  }

  private connect(connectionId: string) {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    try {
      connection.socket = new WebSocket(connection.url)
      
      connection.socket.onopen = () => {
        console.log(`WebSocket connected: ${connectionId}`)
        connection.reconnectAttempts = 0
        
        // Re-subscribe to all channels
        connection.subscriptions.forEach(channel => {
          this.sendMessage(connectionId, {
            type: 'subscribe',
            channel
          })
        })
      }

      connection.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(connectionId, message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      connection.socket.onerror = (error) => {
        console.error(`WebSocket error for ${connectionId}:`, error)
      }

      connection.socket.onclose = (event) => {
        console.log(`WebSocket closed: ${connectionId}`, event.code, event.reason)
        connection.socket = null

        if (!connection.isManuallyDisconnected && connection.reconnectAttempts < connection.maxReconnectAttempts) {
          setTimeout(() => {
            connection.reconnectAttempts++
            console.log(`Reconnecting ${connectionId} (attempt ${connection.reconnectAttempts})`)
            this.connect(connectionId)
          }, connection.reconnectInterval)
        }
      }
    } catch (error) {
      console.error(`Failed to create WebSocket connection for ${connectionId}:`, error)
    }
  }

  private handleMessage(connectionId: string, message: WebSocketMessage) {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    switch (message.type) {
      case 'data':
        if (message.channel) {
          // Handle channel-specific data
          const handler = connection.messageHandlers.get(message.channel)
          if (handler) {
            handler(message.data)
          }

          // Handle global handlers
          const globalHandlerSet = this.globalHandlers.get(message.channel)
          if (globalHandlerSet) {
            globalHandlerSet.forEach(handler => handler(message.data))
          }
        }
        break

      case 'error':
        console.error(`WebSocket error for channel ${message.channel}:`, message.error)
        break

      case 'heartbeat':
        // Respond to heartbeat
        this.sendMessage(connectionId, { type: 'heartbeat' })
        break

      default:
        console.log(`Unknown message type: ${message.type}`)
    }
  }

  private sendMessage(connectionId: string, message: WebSocketMessage) {
    const connection = this.connections.get(connectionId)
    if (!connection?.socket || connection.socket.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot send message, WebSocket not ready: ${connectionId}`)
      return false
    }

    try {
      connection.socket.send(JSON.stringify(message))
      return true
    } catch (error) {
      console.error(`Failed to send WebSocket message for ${connectionId}:`, error)
      return false
    }
  }

  // Public API
  public createConnection(connectionId: string, url: string): boolean {
    if (this.connections.has(connectionId)) {
      console.warn(`Connection ${connectionId} already exists`)
      return false
    }

    const connection = this.initializeConnection(url)
    this.connections.set(connectionId, connection)
    this.connect(connectionId)
    return true
  }

  public subscribe(connectionId: string, channel: string, handler?: (data: any) => void): boolean {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      console.error(`Connection ${connectionId} not found`)
      return false
    }

    connection.subscriptions.add(channel)
    
    if (handler) {
      connection.messageHandlers.set(channel, handler)
    }

    // Send subscribe message if connection is open
    if (connection.socket?.readyState === WebSocket.OPEN) {
      return this.sendMessage(connectionId, {
        type: 'subscribe',
        channel
      })
    }

    return true // Will subscribe when connection opens
  }

  public unsubscribe(connectionId: string, channel: string): boolean {
    const connection = this.connections.get(connectionId)
    if (!connection) return false

    connection.subscriptions.delete(channel)
    connection.messageHandlers.delete(channel)

    return this.sendMessage(connectionId, {
      type: 'unsubscribe',
      channel
    })
  }

  public addGlobalHandler(channel: string, handler: (data: any) => void): void {
    if (!this.globalHandlers.has(channel)) {
      this.globalHandlers.set(channel, new Set())
    }
    this.globalHandlers.get(channel)!.add(handler)
  }

  public removeGlobalHandler(channel: string, handler: (data: any) => void): void {
    const handlers = this.globalHandlers.get(channel)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.globalHandlers.delete(channel)
      }
    }
  }

  public disconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    connection.isManuallyDisconnected = true
    connection.socket?.close()
    this.connections.delete(connectionId)
  }

  public disconnectAll(): void {
    this.connections.forEach((_, connectionId) => {
      this.disconnect(connectionId)
    })
    this.globalHandlers.clear()
  }

  public getConnectionStatus(connectionId: string): string {
    const connection = this.connections.get(connectionId)
    if (!connection) return 'not_found'
    
    if (!connection.socket) return 'disconnected'
    
    switch (connection.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'closed'
      default:
        return 'unknown'
    }
  }

  public isConnected(connectionId: string): boolean {
    return this.getConnectionStatus(connectionId) === 'connected'
  }
}

// Global instance
export const webSocketManager = new WebSocketManager()

// React hook for WebSocket integration
export const useWebSocket = () => {
  return {
    createConnection: webSocketManager.createConnection.bind(webSocketManager),
    subscribe: webSocketManager.subscribe.bind(webSocketManager),
    unsubscribe: webSocketManager.unsubscribe.bind(webSocketManager),
    disconnect: webSocketManager.disconnect.bind(webSocketManager),
    getConnectionStatus: webSocketManager.getConnectionStatus.bind(webSocketManager),
    isConnected: webSocketManager.isConnected.bind(webSocketManager),
    addGlobalHandler: webSocketManager.addGlobalHandler.bind(webSocketManager),
    removeGlobalHandler: webSocketManager.removeGlobalHandler.bind(webSocketManager),
  }
}
