import type { Deal, DealsApiResponse } from '@/types'
import mockDeals from '@/data/mockDeals.json'

/**
 * Deal Service
 * Handles API calls for deal operations with realistic mock behavior
 * Added in-memory cache with 5-minute TTL
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'

// Mock configuration
const MOCK_CONFIG = {
  minDelay: Number(import.meta.env.VITE_MOCK_MIN_DELAY) || 300,
  maxDelay: Number(import.meta.env.VITE_MOCK_MAX_DELAY) || 1000,
  errorRate: Number(import.meta.env.VITE_MOCK_ERROR_RATE) || 0, // 0-100 percentage
  timeoutRate: Number(import.meta.env.VITE_MOCK_TIMEOUT_RATE) || 0, // 0-100 percentage
  timeoutDuration: Number(import.meta.env.VITE_MOCK_TIMEOUT_DURATION) || 5000,
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T
  timestamp: number
}

/**
 * In-memory cache using Map with timestamps
 * Stores API responses with TTL to reduce unnecessary API calls
 */
class InMemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()

  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      console.log(`[Cache] MISS - No entry found for key: ${key}`)
      return null
    }

    const now = Date.now()
    const age = now - entry.timestamp

    if (age > CACHE_TTL) {
      console.log(`[Cache] EXPIRED - Entry is ${Math.round(age / 1000)}s old (TTL: ${CACHE_TTL / 1000}s) for key: ${key}`)
      this.cache.delete(key)
      return null
    }

    console.log(`[Cache] HIT - Entry is ${Math.round(age / 1000)}s old for key: ${key}`)
    return entry.data as T
  }

  /**
   * Store data in cache with current timestamp
   */
  set<T>(key: string, data: T): void {
    console.log(`[Cache] SET - Storing data for key: ${key}`)
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Clear a specific cache entry
   */
  delete(key: string): void {
    console.log(`[Cache] DELETE - Removing entry for key: ${key}`)
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    console.log('[Cache] CLEAR - Removing all cache entries')
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Singleton cache instance
const cache = new InMemoryCache()

/**
 * Error types for mock API
 */
class MockApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'MockApiError'
  }
}

class MockTimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message)
    this.name = 'MockTimeoutError'
  }
}

/**
 * Simulates realistic API delay with variability
 */
function simulateDelay(): Promise<void> {
  const delay =
    MOCK_CONFIG.minDelay + Math.random() * (MOCK_CONFIG.maxDelay - MOCK_CONFIG.minDelay)
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Simulates random API errors based on configuration
 */
function simulateErrors(): void {
  // Simulate timeout
  if (Math.random() * 100 < MOCK_CONFIG.timeoutRate) {
    throw new MockTimeoutError('Request timeout - please try again')
  }

  // Simulate 500 error
  if (Math.random() * 100 < MOCK_CONFIG.errorRate) {
    throw new MockApiError('Internal server error', 500, 'Internal Server Error')
  }
}

/**
 * Simulates timeout with abort capability
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new MockTimeoutError(`Request timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

/**
 * Fetch deals with pagination
 */
export async function fetchDeals(
  page: number = 1,
  itemsPerPage: number = 10
): Promise<DealsApiResponse> {
  if (MOCK_MODE) {
    const mockRequest = async () => {
      await simulateDelay()
      simulateErrors()

      const start = (page - 1) * itemsPerPage
      const end = start + itemsPerPage
      const paginatedDeals = (mockDeals as Deal[]).slice(start, end)

      return {
        data: paginatedDeals,
        total: mockDeals.length,
        page,
        hasMore: end < mockDeals.length,
      }
    }

    return withTimeout(mockRequest(), MOCK_CONFIG.timeoutDuration)
  }

  // Real API call (to be implemented when backend is ready)
  const response = await fetch(
    `${API_BASE_URL}/deals?page=${page}&itemsPerPage=${itemsPerPage}`
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch deals: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch all deals (no pagination)
 * Added caching with 5-minute TTL
 */
export async function fetchAllDeals(): Promise<Deal[]> {
  const cacheKey = 'deals:all'

  // Check cache first
  const cachedData = cache.get<Deal[]>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Cache miss - fetch from API
  if (MOCK_MODE) {
    const mockRequest = async () => {
      await simulateDelay()
      simulateErrors()
      return mockDeals as Deal[]
    }

    const data = await withTimeout(mockRequest(), MOCK_CONFIG.timeoutDuration)

    // Store in cache
    cache.set(cacheKey, data)

    return data
  }

  // Real API call
  const response = await fetch(`${API_BASE_URL}/deals/all`)

  if (!response.ok) {
    throw new Error(`Failed to fetch all deals: ${response.statusText}`)
  }

  const responseData = await response.json()
  const deals = responseData.data || responseData

  // Store in cache
  cache.set(cacheKey, deals)

  return deals
}

/**
 * Fetch a single deal by ID
 * Added caching with 5-minute TTL
 */
export async function fetchDealById(dealId: string): Promise<Deal | null> {
  const cacheKey = `deal:${dealId}`

  // Check cache first
  const cachedData = cache.get<Deal | null>(cacheKey)
  if (cachedData !== null) {
    return cachedData
  }

  // Cache miss - fetch from API
  if (MOCK_MODE) {
    const mockRequest = async () => {
      await simulateDelay()
      simulateErrors()
      const deal = (mockDeals as Deal[]).find((d) => d.dealId === dealId)
      return deal || null
    }

    const data = await withTimeout(mockRequest(), MOCK_CONFIG.timeoutDuration)

    // Store in cache (even if null to avoid repeated lookups for non-existent deals)
    cache.set(cacheKey, data)

    return data
  }

  // Real API call
  const response = await fetch(`${API_BASE_URL}/deals/${dealId}`)

  if (!response.ok) {
    if (response.status === 404) {
      // Cache the 404 result to avoid repeated lookups
      cache.set(cacheKey, null)
      return null
    }
    throw new Error(`Failed to fetch deal: ${response.statusText}`)
  }

  const responseData = await response.json()
  const deal = responseData.data || responseData

  // Store in cache
  cache.set(cacheKey, deal)

  return deal
}

/**
 * Cache management functions
 */

/**
 * Clear all cached data
 * Use when you need to force refresh from API
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Invalidate cache for a specific deal
 * Use when a deal is updated via WebSocket or other means
 */
export function invalidateDealCache(dealId: string): void {
  cache.delete(`deal:${dealId}`)
  // Also clear the all deals cache since it contains this deal
  cache.delete('deals:all')
}

/**
 * Invalidate all deals cache
 * Use when deals are updated via WebSocket
 */
export function invalidateAllDealsCache(): void {
  cache.delete('deals:all')
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats() {
  return cache.getStats()
}
