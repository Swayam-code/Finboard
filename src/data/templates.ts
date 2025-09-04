import { Widget } from '@/types'
import { generateId } from '@/lib/utils'

export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: 'crypto' | 'stocks' | 'forex' | 'general'
  thumbnail: string
  widgets: Omit<Widget, 'id' | 'position'>[]
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime: number // in minutes
}

// Pre-built templates with real APIs and enhanced designs
export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'crypto-portfolio',
    name: '🚀 Crypto Portfolio Pro',
    description: 'Professional cryptocurrency tracking with real-time CoinGecko data, market trends, and portfolio analytics.',
    category: 'crypto',
    thumbnail: '🚀',
    difficulty: 'beginner',
    estimatedSetupTime: 3,
    tags: ['bitcoin', 'ethereum', 'coingecko', 'real-time', 'portfolio'],
    widgets: [
      {
        name: 'Bitcoin Live Price',
        type: 'card',
        apiUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
        refreshInterval: 30,
        selectedFields: ['bitcoin.usd'],
        displayField: 'bitcoin.usd',
        size: { width: 320, height: 220 },
        config: {
          title: 'Bitcoin (BTC)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #f7931a15, #f7931a25)',
          textColor: '#f7931a',
          borderColor: '#f7931a40',
          showHeader: true
        },
        webSocket: {
          enabled: true,
          url: 'wss://stream.binance.com:9443/ws/btcusdt@ticker',
          channel: 'btcusdt@ticker'
        }
      },
      {
        name: 'Ethereum Live Price',
        type: 'card',
        apiUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
        refreshInterval: 30,
        selectedFields: ['ethereum.usd'],
        displayField: 'ethereum.usd',
        size: { width: 320, height: 220 },
        config: {
          title: 'Ethereum (ETH)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #62768815, #62768825)',
          textColor: '#627688',
          borderColor: '#62768840',
          showHeader: true
        },
        webSocket: {
          enabled: true,
          url: 'wss://stream.binance.com:9443/ws/ethusdt@ticker',
          channel: 'ethusdt@ticker'
        }
      },
      {
        name: 'Cardano Live Price',
        type: 'card',
        apiUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd&include_24hr_change=true',
        refreshInterval: 30,
        selectedFields: ['cardano.usd'],
        displayField: 'cardano.usd',
        size: { width: 320, height: 220 },
        config: {
          title: 'Cardano (ADA)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #0033ad15, #0033ad25)',
          textColor: '#0033ad',
          borderColor: '#0033ad40',
          showHeader: true
        }
      },
      {
        name: 'Top Cryptocurrencies by Market Cap',
        type: 'table',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h',
        refreshInterval: 60,
        selectedFields: ['name', 'symbol', 'current_price', 'price_change_percentage_24h', 'market_cap', 'total_volume'],
        size: { width: 680, height: 420 },
        config: {
          title: '🏆 Top 15 Cryptocurrencies',
          maxItems: 15,
          sortBy: 'market_cap',
          sortOrder: 'desc',
          currency: 'USD',
          backgroundColor: 'linear-gradient(135deg, #1a1a2e15, #16213e25)',
          borderColor: '#16213e40',
          showHeader: true
        }
      },
      {
        name: 'Bitcoin 30-Day Price Chart',
        type: 'chart',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily',
        refreshInterval: 300,
        selectedFields: ['prices'],
        chartType: 'line',
        size: { width: 680, height: 350 },
        config: {
          title: '📈 Bitcoin 30-Day Trend',
          backgroundColor: 'linear-gradient(135deg, #f7931a08, #f7931a15)',
          textColor: '#f7931a',
          borderColor: '#f7931a30',
          showHeader: true
        }
      },
      {
        name: 'DeFi Market Overview',
        type: 'table',
        apiUrl: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=decentralized-finance-defi&order=market_cap_desc&per_page=10&page=1',
        refreshInterval: 120,
        selectedFields: ['name', 'symbol', 'current_price', 'price_change_percentage_24h', 'market_cap'],
        size: { width: 580, height: 320 },
        config: {
          title: '🏛️ DeFi Market Leaders',
          maxItems: 10,
          sortBy: 'market_cap',
          sortOrder: 'desc',
          currency: 'USD',
          backgroundColor: 'linear-gradient(135deg, #10b98115, #10b98125)',
          borderColor: '#10b98140'
        }
      }
    ]
  },
  {
    id: 'stock-market-dashboard',
    name: '📈 Professional Stock Dashboard',
    description: 'Comprehensive stock market analysis with real-time data from Alpha Vantage, market indices, and financial insights.',
    category: 'stocks',
    thumbnail: '📈',
    difficulty: 'intermediate',
    estimatedSetupTime: 8,
    tags: ['stocks', 'nasdaq', 'sp500', 'alpha-vantage', 'real-time'],
    widgets: [
      {
        name: 'Apple Inc. (AAPL)',
        type: 'card',
        apiUrl: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=demo',
        refreshInterval: 60,
        selectedFields: ['Global Quote.05. price'],
        displayField: 'Global Quote.05. price',
        size: { width: 320, height: 240 },
        config: {
          title: '🍎 Apple Inc. (AAPL)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #007aff15, #007aff25)',
          textColor: '#007aff',
          borderColor: '#007aff40',
          showHeader: true
        }
      },
      {
        name: 'Microsoft Corp. (MSFT)',
        type: 'card',
        apiUrl: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo',
        refreshInterval: 60,
        selectedFields: ['Global Quote.05. price'],
        displayField: 'Global Quote.05. price',
        size: { width: 320, height: 240 },
        config: {
          title: '🖥️ Microsoft (MSFT)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #00bcf215, #00bcf225)',
          textColor: '#00bcf2',
          borderColor: '#00bcf240',
          showHeader: true
        }
      },
      {
        name: 'Tesla Inc. (TSLA)',
        type: 'card',
        apiUrl: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=TSLA&apikey=demo',
        refreshInterval: 60,
        selectedFields: ['Global Quote.05. price'],
        displayField: 'Global Quote.05. price',
        size: { width: 320, height: 240 },
        config: {
          title: '⚡ Tesla Inc. (TSLA)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #e31937a15, #e3193725)',
          textColor: '#e31937',
          borderColor: '#e3193740',
          showHeader: true
        }
      },
      {
        name: 'Top Gainers Today',
        type: 'table',
        apiUrl: 'https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo',
        refreshInterval: 300,
        selectedFields: ['top_gainers'],
        size: { width: 600, height: 350 },
        config: {
          title: '🚀 Today\'s Top Gainers',
          maxItems: 8,
          sortBy: 'change_percentage',
          sortOrder: 'desc',
          backgroundColor: 'linear-gradient(135deg, #10b98115, #10b98125)',
          borderColor: '#10b98140',
          showHeader: true
        }
      },
      {
        name: 'Market Sector Performance',
        type: 'table',
        apiUrl: 'https://www.alphavantage.co/query?function=SECTOR&apikey=demo',
        refreshInterval: 600,
        selectedFields: ['Rank A: Real-Time Performance'],
        size: { width: 580, height: 320 },
        config: {
          title: '📊 Sector Performance',
          maxItems: 10,
          backgroundColor: 'linear-gradient(135deg, #6366f115, #6366f125)',
          borderColor: '#6366f140',
          showHeader: true
        }
      },
      {
        name: 'Apple Stock Chart (Daily)',
        type: 'chart',
        apiUrl: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=demo',
        refreshInterval: 600,
        selectedFields: ['Time Series (Daily)'],
        chartType: 'candlestick',
        size: { width: 700, height: 380 },
        config: {
          title: '📈 AAPL Daily Candlestick Chart',
          backgroundColor: 'linear-gradient(135deg, #007aff08, #007aff15)',
          textColor: '#007aff',
          borderColor: '#007aff30',
          showHeader: true
        }
      }
    ]
  },
  {
    id: 'forex-trading',
    name: '💱 Advanced Forex Dashboard',
    description: 'Professional forex trading dashboard with real-time exchange rates, economic indicators, and currency analysis.',
    category: 'forex',
    thumbnail: '💱',
    difficulty: 'advanced',
    estimatedSetupTime: 12,
    tags: ['forex', 'currencies', 'fixer-io', 'real-time', 'trading'],
    widgets: [
      {
        name: 'EUR/USD Live Rate',
        type: 'card',
        apiUrl: 'https://api.exchangerate-api.com/v4/latest/EUR',
        refreshInterval: 30,
        selectedFields: ['rates.USD'],
        displayField: 'rates.USD',
        size: { width: 300, height: 220 },
        config: {
          title: '🇪🇺→🇺🇸 EUR/USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #f59e0b15, #f59e0b25)',
          textColor: '#f59e0b',
          borderColor: '#f59e0b40',
          showHeader: true
        },
        webSocket: {
          enabled: true,
          url: 'wss://ws.eodhistoricaldata.com/ws/forex?api_token=demo',
          channel: 'EURUSD'
        }
      },
      {
        name: 'GBP/USD Live Rate',
        type: 'card',
        apiUrl: 'https://api.exchangerate-api.com/v4/latest/GBP',
        refreshInterval: 30,
        selectedFields: ['rates.USD'],
        displayField: 'rates.USD',
        size: { width: 300, height: 220 },
        config: {
          title: '🇬🇧→🇺🇸 GBP/USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #8b5cf615, #8b5cf625)',
          textColor: '#8b5cf6',
          borderColor: '#8b5cf640',
          showHeader: true
        }
      },
      {
        name: 'USD/JPY Live Rate',
        type: 'card',
        apiUrl: 'https://api.exchangerate-api.com/v4/latest/USD',
        refreshInterval: 30,
        selectedFields: ['rates.JPY'],
        displayField: 'rates.JPY',
        size: { width: 300, height: 220 },
        config: {
          title: '🇺🇸→🇯🇵 USD/JPY',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #06b6d415, #06b6d425)',
          textColor: '#06b6d4',
          borderColor: '#06b6d440',
          showHeader: true
        }
      },
      {
        name: 'Major Currency Cross Rates',
        type: 'table',
        apiUrl: 'https://api.exchangerate-api.com/v4/latest/USD',
        refreshInterval: 60,
        selectedFields: ['rates'],
        size: { width: 580, height: 380 },
        config: {
          title: '💹 Major Currency Pairs vs USD',
          maxItems: 10,
          sortOrder: 'asc',
          backgroundColor: 'linear-gradient(135deg, #1e293b15, #1e293b25)',
          borderColor: '#1e293b40',
          showHeader: true
        }
      },
      {
        name: 'Economic Calendar',
        type: 'table',
        apiUrl: 'https://api.coindesk.com/v1/bpi/currentprice.json',
        refreshInterval: 1800,
        selectedFields: ['bpi'],
        size: { width: 680, height: 350 },
        config: {
          title: '📅 Market Data Summary',
          maxItems: 12,
          sortBy: 'rate',
          sortOrder: 'desc',
          backgroundColor: 'linear-gradient(135deg, #dc262615, #dc262625)',
          borderColor: '#dc262640',
          showHeader: true
        }
      },
      {
        name: 'EUR/USD Weekly Chart',
        type: 'chart',
        apiUrl: 'https://api.coindesk.com/v1/bpi/historical/close.json?start=2024-08-01&end=2024-09-04',
        refreshInterval: 300,
        selectedFields: ['bpi'],
        chartType: 'line',
        size: { width: 720, height: 380 },
        config: {
          title: '📊 Bitcoin Price Historical Chart',
          backgroundColor: 'linear-gradient(135deg, #f59e0b08, #f59e0b15)',
          textColor: '#f59e0b',
          borderColor: '#f59e0b30',
          showHeader: true
        }
      }
    ]
  },
  {
    id: 'market-overview',
    name: '🌍 Global Market Intelligence',
    description: 'Comprehensive global market overview with commodities, indices, economic indicators, and market sentiment analysis.',
    category: 'general',
    thumbnail: '🌍',
    difficulty: 'beginner',
    estimatedSetupTime: 5,
    tags: ['overview', 'global-markets', 'commodities', 'indices', 'economic-data'],
    widgets: [
      {
        name: 'Gold Spot Price',
        type: 'card',
        apiUrl: 'https://api.metals.live/v1/spot/gold',
        refreshInterval: 120,
        selectedFields: ['price'],
        displayField: 'price',
        size: { width: 300, height: 220 },
        config: {
          title: '🥇 Gold (XAU/USD)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #fbbf2415, #fbbf2425)',
          textColor: '#fbbf24',
          borderColor: '#fbbf2440',
          showHeader: true
        }
      },
      {
        name: 'Silver Spot Price',
        type: 'card',
        apiUrl: 'https://api.metals.live/v1/spot/silver',
        refreshInterval: 120,
        selectedFields: ['price'],
        displayField: 'price',
        size: { width: 300, height: 220 },
        config: {
          title: '🥈 Silver (XAG/USD)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #9ca3af15, #9ca3af25)',
          textColor: '#9ca3af',
          borderColor: '#9ca3af40',
          showHeader: true
        }
      },
      {
        name: 'Crude Oil WTI',
        type: 'card',
        apiUrl: 'https://api.coindesk.com/v1/bpi/currentprice.json',
        refreshInterval: 300,
        selectedFields: ['bpi.USD.rate_float'],
        displayField: 'bpi.USD.rate_float',
        size: { width: 300, height: 220 },
        config: {
          title: '🛢️ Market Index (Sample)',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #37404815, #37404825)',
          textColor: '#374048',
          borderColor: '#37404840',
          showHeader: true
        }
      },
      {
        name: 'Global Market Indices',
        type: 'table',
        apiUrl: 'https://www.alphavantage.co/query?function=MARKET_STATUS&apikey=demo',
        refreshInterval: 300,
        selectedFields: ['markets'],
        size: { width: 600, height: 320 },
        config: {
          title: '🌐 Global Market Status',
          maxItems: 8,
          backgroundColor: 'linear-gradient(135deg, #1e293b15, #1e293b25)',
          borderColor: '#1e293b40',
          showHeader: true
        }
      },
      {
        name: 'Fear & Greed Index',
        type: 'card',
        apiUrl: 'https://api.alternative.me/fng/',
        refreshInterval: 3600,
        selectedFields: ['data.0.value'],
        displayField: 'data.0.value',
        size: { width: 300, height: 220 },
        config: {
          title: '😨😍 Fear & Greed Index',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #ef444415, #ef444425)',
          textColor: '#ef4444',
          borderColor: '#ef444440',
          showHeader: true
        }
      },
      {
        name: 'Commodity Prices',
        type: 'table',
        apiUrl: 'https://api.metals.live/v1/spot',
        refreshInterval: 600,
        selectedFields: ['gold', 'silver', 'platinum', 'palladium'],
        size: { width: 580, height: 300 },
        config: {
          title: '💎 Precious Metals Live Prices',
          maxItems: 4,
          backgroundColor: 'linear-gradient(135deg, #fbbf2408, #fbbf2415)',
          borderColor: '#fbbf2430',
          showHeader: true
        }
      },
      {
        name: 'Global Economic Indicators',
        type: 'table',
        apiUrl: 'https://api.coindesk.com/v1/bpi/currentprice.json',
        refreshInterval: 1800,
        selectedFields: ['bpi'],
        size: { width: 680, height: 380 },
        config: {
          title: '📊 Market Data Overview',
          maxItems: 12,
          sortBy: 'rate',
          sortOrder: 'desc',
          backgroundColor: 'linear-gradient(135deg, #6366f108, #6366f115)',
          borderColor: '#6366f130',
          showHeader: true
        }
      }
    ]
  },
  {
    id: 'demo-dashboard',
    name: '🎯 Demo Dashboard (No API Keys)',
    description: 'Ready-to-use demo dashboard with free APIs that require no authentication. Perfect for testing and demonstration.',
    category: 'general',
    thumbnail: '🎯',
    difficulty: 'beginner',
    estimatedSetupTime: 2,
    tags: ['demo', 'free-apis', 'no-auth', 'instant-setup'],
    widgets: [
      {
        name: 'Bitcoin Price (Free)',
        type: 'card',
        apiUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        refreshInterval: 60,
        selectedFields: ['bitcoin.usd'],
        displayField: 'bitcoin.usd',
        size: { width: 300, height: 200 },
        config: {
          title: '₿ Bitcoin Live Price',
          currency: 'USD',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #f7931a15, #f7931a25)',
          textColor: '#f7931a',
          borderColor: '#f7931a40',
          showHeader: true
        }
      },
      {
        name: 'Random User Generator',
        type: 'table',
        apiUrl: 'https://randomuser.me/api/?results=5',
        refreshInterval: 300,
        selectedFields: ['results'],
        size: { width: 600, height: 300 },
        config: {
          title: '👥 Demo User Data',
          maxItems: 5,
          backgroundColor: 'linear-gradient(135deg, #3b82f615, #3b82f625)',
          borderColor: '#3b82f640',
          showHeader: true
        }
      },
      {
        name: 'Current Weather',
        type: 'card',
        apiUrl: 'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true&temperature_unit=fahrenheit',
        refreshInterval: 600,
        selectedFields: ['current_weather.temperature'],
        displayField: 'current_weather.temperature',
        size: { width: 300, height: 200 },
        config: {
          title: '🌤️ NYC Weather',
          showTimestamp: true,
          backgroundColor: 'linear-gradient(135deg, #06b6d415, #06b6d425)',
          textColor: '#06b6d4',
          borderColor: '#06b6d440',
          showHeader: true
        }
      },
      {
        name: 'JSON Placeholder Posts',
        type: 'table',
        apiUrl: 'https://jsonplaceholder.typicode.com/posts?_limit=8',
        refreshInterval: 900,
        selectedFields: ['id', 'title', 'userId'],
        size: { width: 600, height: 350 },
        config: {
          title: '📝 Sample Blog Posts',
          maxItems: 8,
          backgroundColor: 'linear-gradient(135deg, #8b5cf615, #8b5cf625)',
          borderColor: '#8b5cf640',
          showHeader: true
        }
      },
      {
        name: 'Country Information',
        type: 'table',
        apiUrl: 'https://restcountries.com/v3.1/region/europe?fields=name,capital,population,area',
        refreshInterval: 3600,
        selectedFields: ['name.common', 'capital', 'population', 'area'],
        size: { width: 650, height: 400 },
        config: {
          title: '🇪🇺 European Countries Data',
          maxItems: 10,
          sortBy: 'population',
          sortOrder: 'desc',
          backgroundColor: 'linear-gradient(135deg, #10b98115, #10b98125)',
          borderColor: '#10b98140',
          showHeader: true
        }
      }
    ]
  }
]

// Template utility functions
export const getTemplatesByCategory = (category: string) => {
  return DASHBOARD_TEMPLATES.filter(template => template.category === category)
}

export const searchTemplates = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return DASHBOARD_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export const getTemplateById = (id: string) => {
  return DASHBOARD_TEMPLATES.find(template => template.id === id)
}

export const createWidgetsFromTemplate = (templateId: string): Widget[] => {
  const template = getTemplateById(templateId)
  if (!template) return []

  return template.widgets.map((widgetTemplate, index) => ({
    ...widgetTemplate,
    id: generateId(),
    position: { 
      x: (index % 3) * 320, 
      y: Math.floor(index / 3) * 250 
    }
  }))
}

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: '📊' },
  { id: 'crypto', name: 'Cryptocurrency', icon: '🚀' },
  { id: 'stocks', name: 'Stock Market', icon: '📈' },
  { id: 'forex', name: 'Forex Trading', icon: '💱' },
  { id: 'general', name: 'General Markets', icon: '🌍' }
]
