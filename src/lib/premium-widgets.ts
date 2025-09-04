// Premium API widget configurations using user's API keys
export const premiumWidgetConfigs = [
  // Alpha Vantage - Real-time Stock Quote
  {
    name: "Apple Stock (AAPL)",
    type: "card" as const,
    apiUrl: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`,
    refreshInterval: 60,
    selectedFields: [
      "Global Quote.01. symbol",
      "Global Quote.05. price", 
      "Global Quote.09. change",
      "Global Quote.10. change percent"
    ],
    config: {
      title: "Apple Inc (AAPL)",
      showTimestamp: true,
    }
  },

  // Alpha Vantage - Company Overview
  {
    name: "Tesla Overview",
    type: "card" as const,
    apiUrl: `https://www.alphavantage.co/query?function=OVERVIEW&symbol=TSLA&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`,
    refreshInterval: 300,
    selectedFields: [
      "Symbol",
      "MarketCapitalization",
      "PERatio",
      "DividendYield",
      "52WeekHigh"
    ],
    config: {
      title: "Tesla Inc Overview",
      showTimestamp: true,
    }
  },

  // Finnhub - Stock Quote
  {
    name: "Microsoft Stock",
    type: "chart" as const,
    apiUrl: `https://finnhub.io/api/v1/quote?symbol=MSFT&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
    refreshInterval: 60,
    selectedFields: [
      "c", // current price
      "h", // high
      "l", // low
      "o"  // open
    ],
    config: {
      title: "Microsoft Corp (MSFT)",
      chartType: "line",
    }
  },

  // Finnhub - Company Profile
  {
    name: "Amazon Profile",
    type: "card" as const,
    apiUrl: `https://finnhub.io/api/v1/stock/profile2?symbol=AMZN&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
    refreshInterval: 300,
    selectedFields: [
      "name",
      "marketCapitalization", 
      "shareOutstanding",
      "country",
      "currency"
    ],
    config: {
      title: "Amazon.com Inc Profile",
      showTimestamp: true,
    }
  },

  // Alpha Vantage - Top Gainers/Losers
  {
    name: "Market Movers",
    type: "table" as const,
    apiUrl: `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`,
    refreshInterval: 300,
    selectedFields: [
      "top_gainers.0.ticker",
      "top_gainers.0.price",
      "top_gainers.0.change_percentage",
      "top_losers.0.ticker",
      "top_losers.0.price",
      "top_losers.0.change_percentage"
    ],
    config: {
      title: "Top Market Movers",
      maxItems: 10,
    }
  },

  // Finnhub - Crypto
  {
    name: "Bitcoin Price",
    type: "card" as const,
    apiUrl: `https://finnhub.io/api/v1/crypto/candle?symbol=BINANCE:BTCUSDT&resolution=1&from=${Math.floor(Date.now()/1000) - 86400}&to=${Math.floor(Date.now()/1000)}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
    refreshInterval: 30,
    selectedFields: [
      "c.0", // latest close price
      "h.0", // latest high
      "l.0", // latest low
      "v.0"  // latest volume
    ],
    config: {
      title: "Bitcoin (BTC/USDT)",
      showTimestamp: true,
    }
  },

  // Polygon - Stock Aggregates
  {
    name: "Google Stock Aggs",
    type: "chart" as const,
    apiUrl: `https://api.polygon.io/v2/aggs/ticker/GOOGL/prev?adjusted=true&apikey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`,
    refreshInterval: 300,
    selectedFields: [
      "results.0.c", // close
      "results.0.h", // high  
      "results.0.l", // low
      "results.0.o", // open
      "results.0.v"  // volume
    ],
    config: {
      title: "Alphabet Inc (GOOGL)",
      chartType: "candlestick",
    }
  }
]

// Function to add a premium widget
export const addPremiumWidget = (widgetConfig: any, addWidget: (widget: any) => void) => {
  addWidget({
    ...widgetConfig,
    id: undefined, // Will be generated
    position: undefined, // Will be generated
  })
}
