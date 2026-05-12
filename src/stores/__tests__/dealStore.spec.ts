import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDealStore } from '../dealStore'
import { DealStatus } from '@/types'
import type { Deal } from '@/types'

describe('Deal Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Deduplication Logic', () => {
    it('should deduplicate deals by dealId', () => {
      const store = useDealStore()

      const deals: Deal[] = [
        {
          dealId: 'DEAL-001',
          dealName: 'Test Deal 1',
          accountName: 'Test Account',
          status: DealStatus.OPEN,
          amount: 10000,
          createdDate: '2026-01-01T00:00:00Z',
          updatedDate: '2026-01-01T00:00:00Z',
        },
        {
          dealId: 'DEAL-001', // Duplicate
          dealName: 'Test Deal 1 Updated',
          accountName: 'Test Account',
          status: DealStatus.APPROVED,
          amount: 15000,
          createdDate: '2026-01-01T00:00:00Z',
          updatedDate: '2026-01-02T00:00:00Z', // More recent
        },
      ]

      store.addDeals(deals)

      expect(store.allDeals.length).toBe(1)
      expect(store.allDeals[0]?.dealName).toBe('Test Deal 1 Updated')
      expect(store.allDeals[0]?.amount).toBe(15000)
    })

    it('should keep the most recently updated deal when deduplicating', () => {
      const store = useDealStore()

      const olderDeal: Deal = {
        dealId: 'DEAL-002',
        dealName: 'Old Version',
        accountName: 'Test Account',
        status: DealStatus.OPEN,
        amount: 10000,
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-01T12:00:00Z',
      }

      const newerDeal: Deal = {
        dealId: 'DEAL-002',
        dealName: 'New Version',
        accountName: 'Test Account',
        status: DealStatus.APPROVED,
        amount: 20000,
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-02T12:00:00Z',
      }

      // Add older first
      store.addDeals([olderDeal])
      expect(store.allDeals[0]?.dealName).toBe('Old Version')

      // Add newer - should replace
      store.addDeals([newerDeal])
      expect(store.allDeals.length).toBe(1)
      expect(store.allDeals[0]?.dealName).toBe('New Version')
      expect(store.allDeals[0]?.amount).toBe(20000)
    })

    it('should not replace with older version', () => {
      const store = useDealStore()

      const newerDeal: Deal = {
        dealId: 'DEAL-003',
        dealName: 'New Version',
        accountName: 'Test Account',
        status: DealStatus.APPROVED,
        amount: 20000,
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-02T12:00:00Z',
      }

      const olderDeal: Deal = {
        dealId: 'DEAL-003',
        dealName: 'Old Version',
        accountName: 'Test Account',
        status: DealStatus.OPEN,
        amount: 10000,
        createdDate: '2026-01-01T00:00:00Z',
        updatedDate: '2026-01-01T12:00:00Z',
      }

      // Add newer first
      store.addDeals([newerDeal])
      expect(store.allDeals[0]?.dealName).toBe('New Version')

      // Try to add older - should NOT replace
      store.addDeals([olderDeal])
      expect(store.allDeals.length).toBe(1)
      expect(store.allDeals[0]?.dealName).toBe('New Version')
      expect(store.allDeals[0]?.amount).toBe(20000)
    })

    it('should handle multiple unique deals', () => {
      const store = useDealStore()

      const deals: Deal[] = [
        {
          dealId: 'DEAL-001',
          dealName: 'Deal 1',
          accountName: 'Account A',
          status: DealStatus.OPEN,
          amount: 10000,
          createdDate: '2026-01-01T00:00:00Z',
        },
        {
          dealId: 'DEAL-002',
          dealName: 'Deal 2',
          accountName: 'Account B',
          status: DealStatus.APPROVED,
          amount: 20000,
          createdDate: '2026-01-02T00:00:00Z',
        },
        {
          dealId: 'DEAL-003',
          dealName: 'Deal 3',
          accountName: 'Account C',
          status: DealStatus.REJECTED,
          amount: 30000,
          createdDate: '2026-01-03T00:00:00Z',
        },
      ]

      store.addDeals(deals)
      expect(store.allDeals.length).toBe(3)
    })
  })

  describe('Basic CRUD Operations', () => {
    it('should set deals and clear existing ones', () => {
      const store = useDealStore()

      const initialDeals: Deal[] = [
        {
          dealId: 'DEAL-001',
          dealName: 'Initial Deal',
          accountName: 'Account A',
          status: DealStatus.OPEN,
          amount: 10000,
          createdDate: '2026-01-01T00:00:00Z',
        },
      ]

      store.setDeals(initialDeals)
      expect(store.allDeals.length).toBe(1)

      const newDeals: Deal[] = [
        {
          dealId: 'DEAL-002',
          dealName: 'New Deal',
          accountName: 'Account B',
          status: DealStatus.APPROVED,
          amount: 20000,
          createdDate: '2026-01-02T00:00:00Z',
        },
      ]

      store.setDeals(newDeals)
      expect(store.allDeals.length).toBe(1)
      expect(store.allDeals[0]?.dealId).toBe('DEAL-002')
    })

    it('should get deal by ID', () => {
      const store = useDealStore()

      const deals: Deal[] = [
        {
          dealId: 'DEAL-001',
          dealName: 'Test Deal',
          accountName: 'Test Account',
          status: DealStatus.OPEN,
          amount: 10000,
          createdDate: '2026-01-01T00:00:00Z',
        },
      ]

      store.setDeals(deals)

      const deal = store.getDealById('DEAL-001')
      expect(deal).toBeDefined()
      expect(deal?.dealName).toBe('Test Deal')

      const notFound = store.getDealById('DEAL-999')
      expect(notFound).toBeUndefined()
    })

    it('should clear all deals', () => {
      const store = useDealStore()

      const deals: Deal[] = [
        {
          dealId: 'DEAL-001',
          dealName: 'Deal 1',
          accountName: 'Account A',
          status: DealStatus.OPEN,
          amount: 10000,
          createdDate: '2026-01-01T00:00:00Z',
        },
      ]

      store.setDeals(deals)
      expect(store.allDeals.length).toBe(1)

      store.clearDeals()
      expect(store.allDeals.length).toBe(0)
    })

    it('should manage loading state', () => {
      const store = useDealStore()

      expect(store.loading).toBe(false)

      store.setLoading(true)
      expect(store.loading).toBe(true)

      store.setLoading(false)
      expect(store.loading).toBe(false)
    })

    it('should manage error state', () => {
      const store = useDealStore()

      expect(store.error).toBeNull()

      store.setError('Test error')
      expect(store.error).toBe('Test error')

      store.setError(null)
      expect(store.error).toBeNull()
    })
  })

  describe('Sorting', () => {
    it('should sort deals by most recent first', () => {
      const store = useDealStore()

      const deals: Deal[] = [
        {
          dealId: 'DEAL-001',
          dealName: 'Old Deal',
          accountName: 'Account A',
          status: DealStatus.OPEN,
          amount: 10000,
          createdDate: '2026-01-01T00:00:00Z',
        },
        {
          dealId: 'DEAL-002',
          dealName: 'Recent Deal',
          accountName: 'Account B',
          status: DealStatus.APPROVED,
          amount: 20000,
          createdDate: '2026-01-15T00:00:00Z',
        },
        {
          dealId: 'DEAL-003',
          dealName: 'Newest Deal',
          accountName: 'Account C',
          status: DealStatus.OPEN,
          amount: 30000,
          createdDate: '2026-02-01T00:00:00Z',
        },
      ]

      store.setDeals(deals)

      expect(store.allDeals[0]?.dealName).toBe('Newest Deal')
      expect(store.allDeals[1]?.dealName).toBe('Recent Deal')
      expect(store.allDeals[2]?.dealName).toBe('Old Deal')
    })
  })
})
