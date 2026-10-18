import { NextRequest, NextResponse } from 'next/server'

let windowStart = Date.now()
let credentialRequests = 0

// Helper function to wait for a specified amount of time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to make requests with retry logic for real APIs only
async function fetchWithRetry(url: string, maxRetries = 3, baseDelay = 2000) {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Never log provider URLs: they may contain credentials.
      
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FinBoard/1.0',
          'Cache-Control': 'no-cache',
        },
      })
      
      console.log(`Fetch response status: ${response.status}`)
      
      // Handle rate limiting (429) with exponential backoff
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const retryAfter = response.headers.get('Retry-After')
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt)
          console.log(`Rate limited (429). Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`)
          await sleep(delay)
          continue
        } else {
          // Throw error instead of returning mock data
          throw new Error(`Rate limited after ${maxRetries} retries. Please try again later.`)
        }
      }
      
      // Handle other HTTP errors
      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`
        console.log('Response not OK:', errorMsg)
        
        // For client errors (4xx), throw immediately
        if (response.status >= 400 && response.status < 500) {
          throw new Error(errorMsg)
        }
        
        // For server errors (5xx), retry
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt)
          console.log(`Server error ${response.status}. Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`)
          await sleep(delay)
          continue
        } else {
          throw new Error(errorMsg)
        }
      }
      
      // Success - return real data only
      return response
      
    } catch (error) {
      console.error(`Provider request attempt ${attempt + 1} failed`)
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.log(`Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`)
        await sleep(delay)
      }
    }
  }
  
  // If all retries failed, throw the last error - NO MOCK DATA
  throw lastError || new Error('All retries failed')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  
  if (!url) {
    console.log('No URL provided')
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }
  
  try {
    // Validate URL
    const target = new URL(url)
    // Only exact HTTPS provider origins may receive server credentials.
    if (target.protocol !== 'https:' || target.port || target.username || target.password) {
      return NextResponse.json({ error: 'Unsupported provider URL' }, { status: 400 })
    }
    const providers: Record<string, [string, string]> = {
      'www.alphavantage.co': ['ALPHA_VANTAGE_API_KEY', 'apikey'],
      'finnhub.io': ['FINNHUB_API_KEY', 'token'],
      'api.polygon.io': ['POLYGON_API_KEY', 'apiKey'],
    }
    const provider = providers[target.hostname]
    if (provider) {
      const allowed = target.hostname === 'www.alphavantage.co'
        ? target.pathname === '/query' && ['GLOBAL_QUOTE', 'OVERVIEW', 'TOP_GAINERS_LOSERS'].includes(target.searchParams.get('function') || '')
        : target.hostname === 'finnhub.io'
          ? ['/api/v1/quote', '/api/v1/stock/profile2', '/api/v1/crypto/candle', '/api/v1/news'].includes(target.pathname)
          : /^\/v2\/aggs\/ticker\/[A-Za-z0-9._-]+\/prev$/.test(target.pathname)
      if (!allowed) return NextResponse.json({ error: 'Unsupported provider endpoint' }, { status: 400 })
      if (Date.now() - windowStart >= 60000) { windowStart = Date.now(); credentialRequests = 0 }
      if (++credentialRequests > 30) return NextResponse.json({ error: 'Provider request limit reached' }, { status: 429 })
      const [variable, parameter] = provider
      const key = process.env[variable]
      if (!key) return NextResponse.json({ error: 'Provider is not configured' }, { status: 503 })
      for (const name of Array.from(target.searchParams.keys())) {
        if (/^(apikey|token|access_key)$/i.test(name)) target.searchParams.delete(name)
      }
      target.searchParams.set(parameter, key)
    }

    console.log('URL is valid, making fetch request with retry logic...')
    
    const response = await fetchWithRetry(target.toString(), 3, 2000) // 3 retries, 2 second base delay
    const data = await response.json()
    if (data.error || data.Error || data['Error Message']) throw new Error('Provider error')
    
    const key = provider ? process.env[provider[0]] : undefined
    const serialized = JSON.stringify(data)
    const safeData = key ? JSON.parse(serialized.split(key).join('[redacted]').split(encodeURIComponent(key)).join('[redacted]')) : data
    return NextResponse.json(safeData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Data-Source': 'real-api'
      },
    })
  } catch (error) {
    console.error('Provider request failed')
    
    // Return proper error instead of mock data
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from API',
        message: 'Provider request failed. Check server configuration and provider availability.',
        timestamp: new Date().toISOString()
      },
      { 
        status: 503,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
