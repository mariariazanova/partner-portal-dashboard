import type { Deal, DealsApiResponse } from '@/types'
import mockDeals from '@/data/mockDeals.json'

/**
 * Deal Service
 * Handles API calls for deal operations with realistic mock behavior
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
 */
export async function fetchAllDeals(): Promise<Deal[]> {
  if (MOCK_MODE) {
    const mockRequest = async () => {
      await simulateDelay()
      simulateErrors()
      return mockDeals as Deal[]
    }

    return withTimeout(mockRequest(), MOCK_CONFIG.timeoutDuration)
  }

  // Real API call
  const response = await fetch(`${API_BASE_URL}/deals/all`)

  if (!response.ok) {
    throw new Error(`Failed to fetch all deals: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || data
}

/**
 * Fetch a single deal by ID
 */
export async function fetchDealById(dealId: string): Promise<Deal | null> {
  if (MOCK_MODE) {
    const mockRequest = async () => {
      await simulateDelay()
      simulateErrors()
      const deal = (mockDeals as Deal[]).find((d) => d.dealId === dealId)
      return deal || null
    }

    return withTimeout(mockRequest(), MOCK_CONFIG.timeoutDuration)
  }

  // Real API call
  const response = await fetch(`${API_BASE_URL}/deals/${dealId}`)

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Failed to fetch deal: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || data
}
