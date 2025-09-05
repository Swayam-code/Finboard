import { NextRequest, NextResponse } from 'next/server'

// Helper function to wait for a specified amount of time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to make requests with retry logic for real APIs only
async function fetchWithRetry(url: string, maxRetries = 3, baseDelay = 2000) {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} for URL: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
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
      console.error(`Attempt ${attempt + 1} failed:`, error)
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
  
  console.log('Proxy API called with URL:', url)
  
  if (!url) {
    console.log('No URL provided')
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }
  
  try {
    // Validate URL
    new URL(url) // This will throw if URL is invalid
    console.log('URL is valid, making fetch request with retry logic...')
    
    const response = await fetchWithRetry(url, 3, 2000) // 3 retries, 2 second base delay
    const data = await response.json()
    console.log('Successfully fetched real data from API')
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Data-Source': 'real-api'
      },
    })
  } catch (error) {
    console.error('Proxy error details:', error)
    
    // Return proper error instead of mock data
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from API',
        message: error instanceof Error ? error.message : 'Unknown error',
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
