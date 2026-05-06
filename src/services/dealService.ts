import type { Deal, DealsApiResponse } from '@/types'
import mockDeals from '@/data/mockDeals.json'

/**
 * Deal Service
 * Handles API calls for deal operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== 'false'

/**
 * Simulates API delay
 */
function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch deals with pagination
 */
export async function fetchDeals(
  page: number = 1,
  itemsPerPage: number = 10
): Promise<DealsApiResponse> {
  if (MOCK_MODE) {
    await simulateDelay()

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
    await simulateDelay()
    return mockDeals as Deal[]
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
    await simulateDelay()
    const deal = (mockDeals as Deal[]).find((d) => d.dealId === dealId)
    return deal || null
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
