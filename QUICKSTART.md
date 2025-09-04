# FinBoard - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Launch the Application
The development server should already be running at `http://localhost:3000`. If not, run:
```bash
npm run dev
```

### Step 2: Create Your First Widget

1. **Click "Add Widget"** in the header or the green "Add Your First Widget" button
2. **Enter Widget Details**:
   - **Name**: "Bitcoin Price" 
   - **API URL**: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
   - **Refresh Interval**: 30 seconds

3. **Test the Connection**:
   - Click the "Test" button 
   - You should see: "API connection successful! X top-level fields found."

4. **Select Data Fields**:
   - Choose `data.currency` for the currency code
   - Choose `data.rates.USD` for the USD price
   - Choose `data.rates.EUR` for the EUR price

5. **Choose Display Mode**: Select "Card" for a clean display

6. **Create Widget**: Click "Add Widget"

### Step 3: Explore More Features

Try these additional APIs:

#### Exchange Rates (Table Widget)
- **Name**: "USD Exchange Rates"
- **URL**: `https://open.er-api.com/v6/latest/USD`
- **Display**: Table
- **Fields**: `base_code`, `rates.EUR`, `rates.GBP`, `rates.JPY`

#### Ethereum Price (Chart Widget)  
- **Name**: "Ethereum Chart"
- **URL**: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur,gbp`
- **Display**: Chart
- **Fields**: `ethereum.usd`, `ethereum.eur`, `ethereum.gbp`

## 🎯 Key Features Demonstrated

✅ **Real-time Data**: Widgets auto-refresh every 30 seconds  
✅ **API Integration**: Connect to any JSON API instantly  
✅ **Multiple Views**: Card, Table, and Chart displays  
✅ **Drag & Drop**: Rearrange widgets by dragging  
✅ **Theme Toggle**: Switch between light and dark modes  
✅ **Data Persistence**: Your dashboard saves automatically  
✅ **Responsive Design**: Works on all screen sizes  

## 🔧 Pro Tips

- **Test APIs First**: Always click "Test" before creating widgets
- **Choose Appropriate Refresh Rates**: 30s for crypto, 60s+ for stocks
- **Select Relevant Fields**: Pick 3-5 key metrics for best display
- **Use Different Widget Types**: Cards for key metrics, Tables for lists, Charts for trends

## 🌐 Example APIs to Try

### Free APIs (No Registration)
- **Coinbase**: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
- **Exchange Rates**: `https://open.er-api.com/v6/latest/USD`
- **CoinGecko**: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`

### APIs with Free Tiers (Registration Required)
- **Alpha Vantage**: Stock market data
- **Finnhub**: Real-time stock quotes
- **Polygon.io**: Financial market data

See `docs/API_EXAMPLES.md` for detailed examples and configuration.

## 📱 What's Working

Your FinBoard application now includes:

- ✅ Complete widget management system
- ✅ Real-time data visualization  
- ✅ Drag-and-drop functionality
- ✅ API testing and integration
- ✅ Theme switching
- ✅ Data persistence
- ✅ Responsive design
- ✅ Error handling
- ✅ Comprehensive documentation

## 🚀 Next Steps

1. **Add More Widgets**: Try different financial APIs
2. **Customize Themes**: Modify colors in `globals.css`
3. **Deploy**: Push to Vercel for production deployment
4. **Extend**: Add new widget types or features

Happy dashboard building! 🎉
