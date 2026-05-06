import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Deal } from '@/types'

/**
 * Deal Store with deduplication logic
 *
 * Block 1 Implementation:
 * - Store deals in a Map for O(1) deduplication by dealId
 * - Keep most recently updated record when duplicates occur
 * - Basic CRUD operations
 */
export const useDealStore = defineStore('deals', () => {
  // State
  const deals = ref<Map<string, Deal>>(new Map()) // Using Map for O(1) deduplication
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  /**
   * Get all deals as an array, sorted by most recent first
   */
  const allDeals = computed(() => {
    return Array.from(deals.value.values()).sort((a, b) => {
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    })
  })

  // Actions
  /**
   * Add or update deals with deduplication
   * Uses Map to ensure unique deals by dealId
   * Keeps the most recently updated record
   */
  function addDeals(newDeals: Deal[]) {
    newDeals.forEach((deal) => {
      const existingDeal = deals.value.get(deal.dealId)

      // If deal exists, keep the most recently updated one
      if (existingDeal) {
        const existingUpdatedTime = new Date(
          existingDeal.updatedDate || existingDeal.createdDate
        ).getTime()
        const newUpdatedTime = new Date(
          deal.updatedDate || deal.createdDate
        ).getTime()

        if (newUpdatedTime > existingUpdatedTime) {
          deals.value.set(deal.dealId, deal)
        }
      } else {
        // New deal, add it
        deals.value.set(deal.dealId, deal)
      }
    })
  }

  /**
   * Replace all deals (for initial load)
   */
  function setDeals(newDeals: Deal[]) {
    deals.value.clear()
    addDeals(newDeals)
  }

  /**
   * Get a single deal by ID
   */
  function getDealById(dealId: string): Deal | undefined {
    return deals.value.get(dealId)
  }

  /**
   * Set loading state
   */
  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  /**
   * Set error message
   */
  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  /**
   * Clear all deals
   */
  function clearDeals() {
    deals.value.clear()
  }

  return {
    // State
    deals,
    loading,
    error,

    // Getters
    allDeals,

    // Actions
    addDeals,
    setDeals,
    getDealById,
    setLoading,
    setError,
    clearDeals,
  }
})
