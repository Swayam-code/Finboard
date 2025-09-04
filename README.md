# FinBoard - Customizable Finance Dashboard

![FinBoard](https://img.shields.io/badge/FinBoard-Finance%20Dashboard-emerald)
![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-cyan)

A powerful, customizable real-time finance dashboard that allows users to connect to various financial APIs and create personalized widgets for monitoring stocks, cryptocurrencies, forex, and other financial data.

<img width="993" height="783" alt="image" src="https://github.com/user-attachments/assets/7857cae0-11ed-478e-82e7-7ea96a6d17b5" />

## 🚀 Features

### 📊 Widget Management System
- **Add Widgets**: Create custom finance data widgets by connecting to any financial API
- **Remove Widgets**: Easy deletion of unwanted widgets from the dashboard
- **Rearrange Layout**: Drag-and-drop functionality to reorganize widget positions
- **Widget Configuration**: Customizable settings for each widget including titles, refresh intervals, and display preferences

### 📈 Data Visualization Types
- **Cards**: Clean, focused display of key financial metrics
- **Tables**: Paginated, searchable, and sortable data tables with filtering
- **Charts**: Interactive line and bar charts using Recharts library
- **Real-time Updates**: Configurable refresh intervals for live data monitoring

### 🔌 API Integration
- **Dynamic Data Mapping**: Explore API responses and select specific fields to display
- **Field Selection**: Interactive JSON explorer for choosing display fields
- **API Testing**: Built-in connection testing before creating widgets
- **Error Handling**: Comprehensive error states and retry mechanisms
- **Rate Limiting**: Intelligent caching to prevent API quota exhaustion

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes with persistence
- **Responsive Design**: Fully responsive layout supporting all screen sizes
- **Loading States**: Beautiful loading animations and skeleton states
- **Error States**: User-friendly error messages and recovery options
- **Data Persistence**: All configurations saved to browser storage

### 🏗️ Technical Features
- **Real-time Data**: WebSocket support for live updates
- **Caching System**: Intelligent data caching to optimize API calls
- **State Management**: Robust state management using Zustand
- **TypeScript**: Full type safety throughout the application
- **Performance**: Optimized with lazy loading and code splitting

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15.5.2 with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: Zustand for lightweight state management
- **Data Visualization**: Recharts for interactive charts
- **Drag & Drop**: @hello-pangea/dnd for widget rearrangement
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React for beautiful icons
- **Deployment**: Vercel-ready configuration

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Clone the Repository
```bash
git clone https://github.com/yourusername/finboard.git
cd finboard
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Start Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🚀 Getting Started

### 1. Create Your First Widget

1. Click the "Add Widget" button in the header or the "Add Your First Widget" card
2. Enter a descriptive name for your widget
3. Add your financial API URL
4. Click "Test" to verify the connection
5. Select the fields you want to display
6. Choose your display mode (Card, Table, or Chart)
7. Set your refresh interval
8. Click "Add Widget"

### 2. Supported API Examples

#### Cryptocurrency (Coinbase)
```
https://api.coinbase.com/v2/exchange-rates?currency=BTC
```

#### Stock Market (Alpha Vantage) - Requires API Key
```
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_API_KEY
```

#### Indian Stock Market (IndianAPI)
```
https://indianapi.in/api/stocks/nse
```

#### Forex Rates
```
https://api.exchangerate-api.com/v4/latest/USD
```

### 3. Widget Customization

- **Drag & Drop**: Rearrange widgets by dragging them to new positions
- **Refresh Control**: Each widget can have individual refresh intervals
- **Field Selection**: Choose exactly which data points to display
- **Visual Modes**: Switch between card, table, and chart views

## 📋 API Integration Guidelines

### Supported API Types
- RESTful APIs returning JSON data
- APIs with CORS enabled or proxy support
- Both free and premium financial data providers

### API Requirements
- Must return valid JSON responses
- Should include numeric data for chart visualizations
- Array data preferred for table widgets
- Consistent field naming across requests

### Rate Limiting Best Practices
- Use appropriate refresh intervals (30+ seconds recommended)
- Monitor your API usage in the provider's dashboard
- Consider caching strategies for frequently accessed data
- Implement fallback mechanisms for rate limit scenarios

### Popular Financial API Providers

1. **Alpha Vantage**
   - Free tier: 5 requests/minute, 500 requests/day
   - Comprehensive stock market data
   - [Documentation](https://www.alphavantage.co/documentation/)

2. **Finnhub**
   - Free tier: 60 requests/minute
   - Real-time stock prices and market data
   - [Documentation](https://finnhub.io/docs/api/)

3. **IndianAPI**
   - Indian stock market data
   - [Documentation](https://indianapi.in/indian-stock-market)

4. **Coinbase API**
   - Cryptocurrency exchange rates
   - No API key required for basic data
   - [Documentation](https://developers.coinbase.com/api/v2)

## 🏗️ Project Structure

```
finboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── input.tsx       # Input component
│   │   │   └── modal.tsx       # Modal component
│   │   ├── widgets/            # Widget components
│   │   │   ├── CardWidget.tsx  # Card display widget
│   │   │   ├── TableWidget.tsx # Table display widget
│   │   │   ├── ChartWidget.tsx # Chart display widget
│   │   │   └── WidgetRenderer.tsx # Widget renderer
│   │   ├── AddWidgetModal.tsx  # Add widget modal
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   └── DraggableWidgetGrid.tsx # Drag & drop grid
│   ├── stores/                 # Zustand stores
│   │   ├── dashboardStore.ts   # Dashboard state
│   │   └── apiStore.ts         # API data management
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Shared types
│   └── lib/                    # Utility functions
│       └── utils.ts            # Helper functions
├── public/                     # Static assets
├── package.json                # Dependencies
└── README.md                   # Documentation
```

## 🎯 Key Components

### Dashboard Store (`src/stores/dashboardStore.ts`)
Manages the overall dashboard state including:
- Widget list and layout
- Theme preferences
- Persistence to localStorage
- Widget CRUD operations

### API Store (`src/stores/apiStore.ts`)
Handles all API-related operations:
- HTTP requests and caching
- Connection testing
- Field extraction from JSON responses
- Error handling and retry logic

### Widget Components
- **CardWidget**: Displays key-value pairs in a clean card format
- **TableWidget**: Sortable, searchable table with pagination
- **ChartWidget**: Interactive charts using Recharts library

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for API keys:

```env
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key
```

### Customization Options

#### Theme Customization
Modify `src/app/globals.css` to customize colors and styling:

```css
:root {
  --emerald-600: #059669; /* Primary color */
  --gray-900: #111827;    /* Dark background */
  --gray-800: #1f2937;    /* Card background */
}
```

#### Default Widget Settings
Update `src/stores/dashboardStore.ts` to modify default widget behavior:

```typescript
const defaultWidgetConfig = {
  refreshInterval: 30, // seconds
  showTimestamp: true,
  showHeader: true,
};
```

## 📊 Performance Optimizations

### Caching Strategy
- API responses cached for 30 seconds by default
- Configurable cache duration per widget
- Automatic cache invalidation on errors

### Bundle Optimization
- Code splitting for widget components
- Lazy loading of chart libraries
- Tree shaking for unused dependencies

### Memory Management
- Automatic cleanup of intervals on widget removal
- Efficient state updates using Zustand
- Memoized components for stable renders

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
```
Access to fetch at 'api.example.com' from origin 'localhost:3000' has been blocked by CORS policy
```
**Solution**: Use APIs that support CORS or implement a proxy server.

#### API Rate Limits
```
API rate limit exceeded
```
**Solution**: Increase refresh intervals or upgrade to a premium API plan.

#### Chart Not Displaying
**Solution**: Ensure the selected fields contain numeric data.

#### Widget Not Updating
**Solution**: Check the API URL and verify the API is returning valid JSON.

### Debug Mode
Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('finboard-debug', 'true');
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Tailwind CSS** - For beautiful, responsive styling
- **Recharts** - For powerful data visualization
- **Zustand** - For simple, scalable state management
- **Lucide React** - For beautiful, consistent icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [GitHub issues](https://github.com/yourusername/finboard/issues)
3. Create a new issue with detailed information
4. Join our community discussions

## 🗺️ Roadmap

### Upcoming Features
- [ ] WebSocket support for real-time data
- [ ] Widget templates marketplace
- [ ] Data export functionality
- [ ] Advanced charting options
- [ ] Multi-dashboard support
- [ ] Collaborative features
- [ ] Mobile app companion

### Version History
- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Drag & drop support (planned)
- **v1.2.0** - Advanced charting (planned)

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
