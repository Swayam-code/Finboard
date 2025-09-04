# FinBoard API Examples

This document provides examples of how to integrate with popular financial APIs in FinBoard.

## Free APIs (No API Key Required)

### 1. Coinbase Exchange Rates
**URL**: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
**Type**: Cryptocurrency
**Rate Limit**: No limit
**Best For**: Card widgets

**Sample Fields**:
- `data.currency` - Base currency (BTC)
- `data.rates.USD` - USD exchange rate
- `data.rates.EUR` - EUR exchange rate

### 2. Exchange Rate API
**URL**: `https://api.exchangerate-api.com/v4/latest/USD`
**Type**: Forex
**Rate Limit**: 1500 requests/month
**Best For**: Table and Chart widgets

**Sample Fields**:
- `base` - Base currency
- `rates.EUR` - Euro rate
- `rates.GBP` - British Pound rate
- `rates.JPY` - Japanese Yen rate

### 3. CoinGecko API
**URL**: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`
**Type**: Cryptocurrency
**Rate Limit**: 50 calls/minute
**Best For**: Card and Table widgets

**Sample Fields**:
- `bitcoin.usd` - Bitcoin price in USD
- `ethereum.usd` - Ethereum price in USD

## APIs Requiring Registration (Free Tier)

### 1. Alpha Vantage
**URL**: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_API_KEY`
**Type**: Stock Market
**Rate Limit**: 5 requests/minute, 500 requests/day
**Best For**: Card widgets

**Sample Fields**:
- `Global Quote.01. symbol` - Stock symbol
- `Global Quote.05. price` - Current price
- `Global Quote.09. change` - Price change
- `Global Quote.10. change percent` - Percentage change

### 2. Finnhub
**URL**: `https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY`
**Type**: Stock Market
**Rate Limit**: 60 requests/minute
**Best For**: Card widgets

**Sample Fields**:
- `c` - Current price
- `h` - High price of the day
- `l` - Low price of the day
- `o` - Open price of the day
- `pc` - Previous close price

### 3. Polygon.io
**URL**: `https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apikey=YOUR_API_KEY`
**Type**: Stock Market
**Rate Limit**: 5 requests/minute (free)
**Best For**: Chart widgets

**Sample Fields**:
- `results.0.c` - Close price
- `results.0.h` - High price
- `results.0.l` - Low price
- `results.0.o` - Open price
- `results.0.v` - Volume

## Widget Configuration Examples

### Bitcoin Price Tracker (Card)
```json
{
  "name": "Bitcoin Price",
  "type": "card",
  "apiUrl": "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
  "refreshInterval": 30,
  "selectedFields": [
    "data.currency",
    "data.rates.USD",
    "data.rates.EUR"
  ]
}
```

### Stock Portfolio (Table)
```json
{
  "name": "My Stocks",
  "type": "table", 
  "apiUrl": "https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY",
  "refreshInterval": 60,
  "selectedFields": [
    "c",
    "h", 
    "l",
    "o"
  ]
}
```

### Currency Exchange Rates (Chart)
```json
{
  "name": "USD Exchange Rates",
  "type": "chart",
  "apiUrl": "https://api.exchangerate-api.com/v4/latest/USD",
  "refreshInterval": 300,
  "selectedFields": [
    "rates.EUR",
    "rates.GBP", 
    "rates.JPY"
  ]
}
```

## Best Practices

### 1. Refresh Intervals
- **High-frequency data** (crypto, forex): 30-60 seconds
- **Stock prices**: 60-300 seconds  
- **Daily summaries**: 300+ seconds
- **Historical data**: 3600+ seconds

### 2. API Key Management
- Store API keys in `.env.local` file
- Use environment variables for security
- Never commit API keys to version control
- Monitor your usage to avoid rate limits

### 3. Error Handling
- Test API connections before creating widgets
- Set appropriate refresh intervals
- Have fallback data or graceful degradation
- Monitor for API changes or deprecations

### 4. Data Selection
- **Cards**: Pick 3-5 key metrics
- **Tables**: Select 4-6 columns for readability  
- **Charts**: Choose 2-4 numeric fields
- Avoid deeply nested objects when possible

## Common Issues & Solutions

### CORS Errors
Some APIs don't allow browser requests. Solutions:
1. Use APIs that support CORS
2. Implement a proxy server
3. Use serverless functions as intermediaries

### Rate Limiting
Stay within API limits:
1. Increase refresh intervals
2. Implement smart caching
3. Use multiple API keys if allowed
4. Upgrade to paid plans for higher limits

### Data Format Issues
APIs return different structures:
1. Test APIs before creating widgets
2. Use the field explorer to understand structure
3. Select appropriate widget types for data
4. Transform data if needed using custom logic

## Additional Resources

- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Finnhub API Documentation](https://finnhub.io/docs/api/)
- [CoinGecko API Documentation](https://www.coingecko.com/en/api/documentation)
- [Polygon.io Documentation](https://polygon.io/docs/)
- [Exchange Rate API Documentation](https://exchangerate-api.com/docs)
