// Demo configuration for FinBoard
// This file contains example widget configurations for testing

export const demoWidgets = [
  {
    name: "Bitcoin Price",
    type: "card" as const,
    apiUrl: "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
    refreshInterval: 30,
    selectedFields: ["data.currency", "data.rates.USD"],
    config: {
      title: "Bitcoin (BTC)",
      showTimestamp: true,
    }
  },
  {
    name: "Cryptocurrency Rates",
    type: "table" as const,
    apiUrl: "https://api.coinbase.com/v2/exchange-rates?currency=ETH",
    refreshInterval: 60,
    selectedFields: ["data.rates"],
    config: {
      title: "Ethereum Exchange Rates",
      maxItems: 10,
    }
  },
  {
    name: "Exchange Rates Chart",
    type: "chart" as const,
    apiUrl: "https://api.exchangerate-api.com/v4/latest/USD",
    refreshInterval: 300,
    selectedFields: ["rates.EUR", "rates.GBP", "rates.JPY"],
    config: {
      title: "USD Exchange Rates",
      chartType: "line",
    }
  }
]

export const exampleAPIs = [
  {
    name: "Coinbase Exchange Rates",
    url: "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
    description: "Real-time cryptocurrency exchange rates",
    fields: ["data.currency", "data.rates.USD", "data.rates.EUR"],
    rateLimit: "No limit",
    apiKey: false
  },
  {
    name: "Exchange Rate API",
    url: "https://api.exchangerate-api.com/v4/latest/USD",
    description: "Foreign exchange rates",
    fields: ["base", "rates.EUR", "rates.GBP"],
    rateLimit: "1500 requests/month",
    apiKey: false
  },
  {
    name: "Alpha Vantage Global Quote",
    url: "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=demo",
    description: "Real-time stock quotes",
    fields: ["Global Quote.01. symbol", "Global Quote.05. price"],
    rateLimit: "5 requests/minute",
    apiKey: true
  }
]
