import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  fetchAllDeals,
  fetchDealById,
  clearCache,
  invalidateDealCache,
  invalidateAllDealsCache,
  getCacheStats
} from '../dealService'
import {DealStatus} from "../../types";

// Mock the environment variables
vi.stubEnv('VITE_MOCK_MODE', 'true')
vi.stubEnv('VITE_MOCK_MIN_DELAY', '0')
vi.stubEnv('VITE_MOCK_MAX_DELAY', '0')
vi.stubEnv('VITE_MOCK_ERROR_RATE', '0')
vi.stubEnv('VITE_MOCK_TIMEOUT_RATE', '0')

describe('dealService', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearCache()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearCache()
  })

  describe('fetchAllDeals', () => {
    it('should fetch all deals successfully', async () => {
      const deals = await fetchAllDeals()

      expect(deals).toBeDefined()
      expect(Array.isArray(deals)).toBe(true)
      expect(deals.length).toBeGreaterThan(0)
    })

    it('should return deals with required fields', async () => {
      const deals = await fetchAllDeals()

      deals.forEach(deal => {
        expect(deal).toHaveProperty('dealId')
        expect(deal).toHaveProperty('dealName')
        expect(deal).toHaveProperty('accountName')
        expect(deal).toHaveProperty('status')
        expect(deal).toHaveProperty('amount')
        expect(deal).toHaveProperty('createdDate')
      })
    })
  })

  describe('fetchDealById', () => {
    it('should fetch a specific deal by ID', async () => {
      const deals = await fetchAllDeals()
      const firstDeal = deals[0]

      if (!firstDeal) {
        throw new Error('No deal found in test data')
      }

      const deal = await fetchDealById(firstDeal.dealId)

      expect(deal).toBeDefined()
      expect(deal?.dealId).toBe(firstDeal.dealId)
    })

    it('should return null for non-existent deal', async () => {
      const deal = await fetchDealById('NON-EXISTENT-ID')

      expect(deal).toBeNull()
    })
  })

  describe('Caching', () => {
    it('should cache fetchAllDeals results', async () => {
      // First call - should fetch from API
      const deals1 = await fetchAllDeals()

      // Second call - should return cached data
      const deals2 = await fetchAllDeals()

      // Both calls should return the same data
      expect(deals1).toBe(deals2) // Same reference = cached
    })

    it('should cache fetchDealById results', async () => {
      const deals = await fetchAllDeals()
      const firstDeal = deals[0]

      if (!firstDeal) {
        throw new Error('No deal found in test data')
      }


      // First call - should fetch from API
      const deal1 = await fetchDealById(firstDeal.dealId)

      // Second call - should return cached data
      const deal2 = await fetchDealById(firstDeal.dealId)

      // Both calls should return the same data
      expect(deal1).toBe(deal2) // Same reference = cached
    })

    it('should store cache entries in getCacheStats', async () => {
      clearCache()
      let stats = getCacheStats()
      expect(stats.size).toBe(0)

      await fetchAllDeals()
      stats = getCacheStats()
      expect(stats.size).toBeGreaterThan(0)
      expect(stats.keys.some(key => key.includes('deals:all'))).toBe(true)
    })

    it('should clear all cache entries with clearCache', async () => {
      await fetchAllDeals()

      let stats = getCacheStats()
      expect(stats.size).toBeGreaterThan(0)

      clearCache()

      stats = getCacheStats()
      expect(stats.size).toBe(0)
    })

    it('should invalidate specific deal cache', async () => {
      const deals = await fetchAllDeals()
      const firstDeal = deals[0]

      if (!firstDeal) {
        throw new Error('No deal found in test data')
      }

      await fetchDealById(firstDeal.dealId)

      const statsBefore = getCacheStats()
      expect(statsBefore.size).toBeGreaterThan(0)

      invalidateDealCache(firstDeal.dealId)

      const statsAfter = getCacheStats()
      // Should have cleared both the specific deal and deals:all
      expect(statsAfter.size).toBeLessThan(statsBefore.size)
    })

    it('should invalidate all deals cache', async () => {
      await fetchAllDeals()

      let stats = getCacheStats()
      expect(stats.keys.some(key => key.includes('deals:all'))).toBe(true)

      invalidateAllDealsCache()

      stats = getCacheStats()
      expect(stats.keys.some(key => key.includes('deals:all'))).toBe(false)
    })
  })

  describe('Cache TTL', () => {
    it('should respect 5-minute cache TTL', async () => {
      vi.useFakeTimers()

      try {
        // Start fetch
        const dealsPromise1 = fetchAllDeals()

        // Run pending timers for simulateDelay()
        await vi.runAllTimersAsync()

        const deals1 = await dealsPromise1

        // Advance time by 4 minutes
        vi.advanceTimersByTime(4 * 60 * 1000)

        const deals2 = await fetchAllDeals()

        expect(deals1).toBe(deals2)

        // Advance beyond TTL
        vi.advanceTimersByTime(2 * 60 * 1000)

        const dealsPromise3 = fetchAllDeals()

        await vi.runAllTimersAsync()

        const deals3 = await dealsPromise3

        expect(deals3).toBeDefined()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('Error Simulation', () => {
    it('should throw error when error rate is 100%', async () => {
      vi.stubEnv('VITE_MOCK_ERROR_RATE', '100')

      await expect(fetchAllDeals()).rejects.toThrow('Internal server error')

      vi.unstubAllEnvs()
    })

    it('should throw timeout error when timeout rate is 100%', async () => {
      vi.stubEnv('VITE_MOCK_TIMEOUT_RATE', '100')

      await expect(fetchAllDeals()).rejects.toThrow('Request timeout - please try again')

      vi.unstubAllEnvs()
    })
  })

  describe('Data Integrity', () => {
    it('should return consistent deal structure', async () => {
      const deals = await fetchAllDeals()

      deals.forEach(deal => {
        // Check all required fields exist
        expect(typeof deal.dealId).toBe('string')
        expect(typeof deal.dealName).toBe('string')
        expect(typeof deal.accountName).toBe('string')
        expect(typeof deal.status).toBe('string')
        expect(typeof deal.amount).toBe('number')
        expect(typeof deal.createdDate).toBe('string')

        // Check valid status values
        expect([DealStatus.OPEN, DealStatus.APPROVED, DealStatus.REJECTED]).toContain(deal.status)

        // Check amount is positive
        expect(deal.amount).toBeGreaterThan(0)

        // Check date is valid ISO string
        expect(() => new Date(deal.createdDate)).not.toThrow()
      })
    })

    it('should maintain data consistency across multiple calls', async () => {
      const deals1 = await fetchAllDeals()
      clearCache()
      const deals2 = await fetchAllDeals()

      // Should return same number of deals
      expect(deals1.length).toBe(deals2.length)

      // Should have same deal IDs (order might differ)
      const ids1 = deals1.map(d => d.dealId).sort()
      const ids2 = deals2.map(d => d.dealId).sort()
      expect(ids1).toEqual(ids2)
    })
  })
})
