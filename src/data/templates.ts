export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: string
  widgets: any[]
  difficulty?: string
  estimatedSetupTime?: number
  tags?: string[]
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'crypto-tracker',
    name: 'Crypto Price Tracker',
    description: 'Track cryptocurrency prices with real-time data',
    category: 'Cryptocurrency',
    difficulty: 'beginner',
    estimatedSetupTime: 3,
    tags: ['crypto', 'bitcoin', 'ethereum', 'real-time'],
    widgets: [
      {
        id: 'btc-price',
        type: 'card',
        name: 'Bitcoin Price',
        title: 'Bitcoin (BTC)',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
        refreshInterval: 30,
        selectedFields: ['data.rates.USD'],
        displayField: 'data.rates.USD',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {
          title: 'Bitcoin (BTC)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: '#f7931a15',
          textColor: '#f7931a',
          borderColor: '#f7931a40'
        }
      },
      {
        id: 'eth-price',
        type: 'card',
        name: 'Ethereum Price',
        title: 'Ethereum (ETH)',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=ETH',
        refreshInterval: 30,
        selectedFields: ['data.rates.USD'],
        displayField: 'data.rates.USD',
        position: { x: 320, y: 0 },
        size: { width: 300, height: 200 },
        config: {
          title: 'Ethereum (ETH)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: '#62768815',
          textColor: '#627688',
          borderColor: '#62768840'
        }
      },
      {
        id: 'crypto-rates-chart',
        type: 'chart',
        name: 'Crypto Exchange Rates',
        title: 'Crypto Exchange Rates',
        apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
        refreshInterval: 60,
        selectedFields: ['data.rates.USD', 'data.rates.EUR', 'data.rates.GBP'],
        position: { x: 0, y: 220 },
        size: { width: 640, height: 300 },
        config: {
          title: 'Bitcoin Exchange Rates',
          chartType: 'line',
          showLegend: true,
          showTimestamp: true,
          backgroundColor: '#1f2937',
          borderColor: '#f7931a',
          pointBackgroundColor: '#f7931a',
          tension: 0.4
        }
      }
    ]
  },
  {
    id: 'forex-dashboard',
    name: 'Forex Exchange Rates',
    description: 'Monitor major currency exchange rates',
    category: 'Finance',
    difficulty: 'intermediate',
    estimatedSetupTime: 5,
    tags: ['forex', 'currency', 'exchange', 'rates'],
    widgets: [
      {
        id: 'usd-rates-chart',
        type: 'chart',
        name: 'USD Exchange Rates',
        title: 'USD Exchange Rates',
        apiUrl: 'https://api.exchangerate-api.com/v4/latest/USD',
        refreshInterval: 60,
        selectedFields: ['rates.EUR', 'rates.GBP', 'rates.JPY', 'rates.CAD', 'rates.AUD'],
        position: { x: 0, y: 0 },
        size: { width: 700, height: 300 },
        config: {
          title: 'USD Exchange Rates',
          chartType: 'line',
          showLegend: true,
          showTimestamp: true,
          backgroundColor: '#1f2937',
          borderColor: '#3b82f6',
          pointBackgroundColor: '#3b82f6',
          tension: 0.4
        }
      },
      {
        id: 'currency-chart',
        type: 'chart',
        name: 'EUR Exchange Rates',
        title: 'EUR Exchange Rates',
        apiUrl: 'https://api.exchangerate-api.com/v4/latest/EUR',
        refreshInterval: 120,
        selectedFields: ['rates.USD', 'rates.GBP', 'rates.JPY', 'rates.AUD', 'rates.CAD'],
        position: { x: 0, y: 320 },
        size: { width: 700, height: 300 },
        config: {
          title: 'EUR Exchange Rates',
          chartType: 'line',
          showLegend: true,
          showTimestamp: true,
          backgroundColor: '#1f2937',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981',
          tension: 0.4
        }
      }
    ]
  },
  {
    id: 'stock-market',
    name: 'Stock Market Overview',
    description: 'Real-time stock market data using Finnhub API',
    category: 'Stocks',
    difficulty: 'advanced',
    estimatedSetupTime: 7,
    tags: ['stocks', 'market', 'finnhub', 'real-time'],
    widgets: [
      {
        id: 'aapl-stock',
        type: 'card',
        name: 'Apple Stock',
        title: 'Apple (AAPL)',
        apiUrl: 'https://finnhub.io/api/v1/quote?symbol=AAPL&token=d2sqg4hr01qkuv3hvpo0d2sqg4hr01qkuv3hvpog',
        refreshInterval: 30,
        selectedFields: ['c'],
        displayField: 'c',
        position: { x: 0, y: 0 },
        size: { width: 280, height: 200 },
        config: {
          title: 'Apple (AAPL)',
          currency: 'USD',
          showTimestamp: true
        }
      },
      {
        id: 'googl-stock',
        type: 'card',
        name: 'Google Stock',
        title: 'Google (GOOGL)',
        apiUrl: 'https://finnhub.io/api/v1/quote?symbol=GOOGL&token=d2sqg4hr01qkuv3hvpo0d2sqg4hr01qkuv3hvpog',
        refreshInterval: 30,
        selectedFields: ['c'],
        displayField: 'c',
        position: { x: 300, y: 0 },
        size: { width: 280, height: 200 },
        config: {
          title: 'Google (GOOGL)',
          currency: 'USD',
          showTimestamp: true
        }
      },
      {
        id: 'market-news',
        type: 'table',
        name: 'Market News',
        title: 'Market News',
        apiUrl: 'https://finnhub.io/api/v1/news?category=general&token=d2sqg4hr01qkuv3hvpo0d2sqg4hr01qkuv3hvpog',
        refreshInterval: 300,
        selectedFields: ['headline', 'source', 'category'],
        position: { x: 0, y: 220 },
        size: { width: 800, height: 300 },
        config: {
          title: 'Market News',
          maxItems: 15,
          showTimestamp: true
        }
      }
    ]
  },
  {
    id: 'polygon-dashboard',
    name: 'Polygon Market Data',
    description: 'Advanced market data using Polygon.io API',
    category: 'Stocks',
    difficulty: 'advanced',
    estimatedSetupTime: 8,
    tags: ['polygon', 'market', 'etf', 'advanced'],
    widgets: [
      {
        id: 'spy-ticker',
        type: 'card',
        name: 'SPY ETF',
        title: 'SPDR S&P 500 (SPY)',
        apiUrl: 'https://api.polygon.io/v2/aggs/ticker/SPY/prev?adjusted=true&apikey=_HqKj4LupipWppC0pCnyQK8svEm1XLpy',
        refreshInterval: 30,
        selectedFields: ['results.0.c'],
        displayField: 'results.0.c',
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        config: {
          title: 'SPDR S&P 500 (SPY)',
          currency: 'USD',
          showTimestamp: true
        }
      },
      {
        id: 'qqq-ticker',
        type: 'card',
        name: 'QQQ ETF',
        title: 'Invesco QQQ (QQQ)',
        apiUrl: 'https://api.polygon.io/v2/aggs/ticker/QQQ/prev?adjusted=true&apikey=_HqKj4LupipWppC0pCnyQK8svEm1XLpy',
        refreshInterval: 30,
        selectedFields: ['results.0.c'],
        displayField: 'results.0.c',
        position: { x: 320, y: 0 },
        size: { width: 300, height: 200 },
        config: {
          title: 'Invesco QQQ (QQQ)',
          currency: 'USD',
          showTimestamp: true
        }
      }
    ]
  }
]

// Helper functions for backward compatibility
export const DASHBOARD_TEMPLATES = dashboardTemplates

export const TEMPLATE_CATEGORIES = [
  { id: 'cryptocurrency', name: 'Cryptocurrency' },
  { id: 'finance', name: 'Finance' },
  { id: 'stocks', name: 'Stocks' }
]

export function getTemplatesByCategory(category: string): DashboardTemplate[] {
  return dashboardTemplates.filter(template => 
    template.category.toLowerCase() === category.toLowerCase()
  )
}

export function searchTemplates(query: string): DashboardTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return dashboardTemplates.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery) ||
    (template.tags && template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  )
}

export function createWidgetsFromTemplate(templateId: string) {
  const template = dashboardTemplates.find(t => t.id === templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  return template.widgets.map(widget => ({
    ...widget,
    id: `${widget.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }))
}
