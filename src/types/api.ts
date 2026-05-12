/**
 * API-related types
 */

import type { Deal } from './deal'

/**
 * API response interface
 */
export interface DealsApiResponse {
  data: Deal[]
  total: number
  page: number
  hasMore: boolean
}

/**
 * Error state interface
 */
export interface ApiError {
  message: string
  code?: number
  timestamp: Date
}

/**
 * Cache entry interface
 */
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}
