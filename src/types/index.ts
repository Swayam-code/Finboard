export interface Widget {
  id: string
  name: string
  type: 'card' | 'table' | 'chart'
  apiUrl: string
  refreshInterval: number // in seconds
  selectedFields: string[]
  displayField?: string
  chartType?: 'line' | 'candlestick' | 'bar'
  position: { x: number; y: number }
  size: { width: number; height: number }
  lastUpdated?: string
  config?: WidgetConfig
  webSocket?: WebSocketConfig
}

export interface WebSocketConfig {
  enabled: boolean
  url?: string
  channel?: string
  subscribeMessage?: string
  heartbeatInterval?: number
}

export interface WidgetConfig {
  title?: string
  showHeader?: boolean
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  currency?: string
  dateFormat?: string
  showTimestamp?: boolean
  maxItems?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isPaused?: boolean
  isMinimized?: boolean
  isExpanded?: boolean
  chartType?: 'line' | 'bar'
  showLegend?: boolean
  tension?: number
  pointBackgroundColor?: string
}

export interface ApiField {
  key: string
  value: any
  type: string
  path: string
}

export interface ApiResponse {
  data: any
  fields: ApiField[]
  timestamp: string
  status: 'success' | 'error'
  error?: string
}

export interface DashboardState {
  widgets: Widget[]
  layout: Widget[]
  theme: Theme
  isLoading: boolean
  error?: string
}

export interface ApiCache {
  [url: string]: {
    data: any
    timestamp: number
    expiresIn: number
  }
}

export interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume?: number
  marketCap?: number
  high52Week?: number
  low52Week?: number
  pe?: number
  eps?: number
}

export interface ChartData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type WidgetType = 'card' | 'table' | 'chart'
export type ChartType = 'line' | 'candlestick' | 'bar'
export type Theme = 'light' | 'dark' | 'auto'
