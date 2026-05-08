import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Deal, DealFilters, DealStatus } from '@/types'
import { useAuthStore } from './authStore'
import { websocketService } from '@/services/websocketService'
import { invalidateAllDealsCache } from '@/services/dealService'

/**
 * Deal Store with deduplication logic
 *
 * - Store deals in a Map for O(1) deduplication by dealId
 * - Keep most recently updated record when duplicates occur
 * - Basic CRUD operations
 *
 * - Multi-field search (dealName, accountName, status, description, contactPerson)
 * - Filter by status, amount range, date range, and specific fields
 * - Debounced search integration
 *
 * - Role-based filtering (Admin sees all, Partner sees only assigned deals)
 * - WebSocket-based real-time updates
 */
export const useDealStore = defineStore('deals', () => {
  const authStore = useAuthStore()

  // WebSocket connection status
  const wsConnected = ref(false)
  // State
  const deals = ref<Map<string, Deal>>(new Map()) // Using Map for O(1) deduplication
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filter state
  const filters = ref<DealFilters>({
    search: '',
    statusFilter: [],
    amountMin: null,
    amountMax: null,
    dateFrom: null,
    dateTo: null,
    accountNameFilter: '',
    dealNameFilter: '',
  })

  // Getters
  /**
   * Get all deals as an array, sorted by most recent first
   */
  const allDeals = computed(() => {
    return Array.from(deals.value.values()).sort((a, b) => {
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    })
  })

  /**
   * Get filtered deals based on current filter state
   * Applies multi-field search and all active filters
   * Block 5: Also applies role-based filtering
   */
  const filteredDeals = computed(() => {
    let result = allDeals.value

    // Apply role-based filtering
    // Partners can only see deals assigned to them
    // Admins can see all deals
    if (authStore.isPartner()) {
      result = result.filter((deal) => deal.assignedTo === authStore.partnerId)
    }

    // Apply global search across multiple fields
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase().trim()
      result = result.filter((deal) => {
        return (
          deal.dealId.toLowerCase().includes(searchLower) ||
          deal.dealName.toLowerCase().includes(searchLower) ||
          deal.accountName.toLowerCase().includes(searchLower) ||
          deal.status.toLowerCase().includes(searchLower) ||
          (deal.description && deal.description.toLowerCase().includes(searchLower)) ||
          (deal.contactPerson && deal.contactPerson.toLowerCase().includes(searchLower))
        )
      })
    }

    // Apply status filter
    if (filters.value.statusFilter.length > 0) {
      result = result.filter((deal) => filters.value.statusFilter.includes(deal.status))
    }

    // Apply amount range filter
    if (filters.value.amountMin !== null && filters.value.amountMin !== undefined) {
      const minAmount = Number(filters.value.amountMin)
      result = result.filter((deal) => Number(deal.amount) >= minAmount)
    }
    if (filters.value.amountMax !== null && filters.value.amountMax !== undefined) {
      const maxAmount = Number(filters.value.amountMax)
      result = result.filter((deal) => Number(deal.amount) <= maxAmount)
    }

    // Apply date range filter
    if (filters.value.dateFrom) {
      const dateFrom = new Date(filters.value.dateFrom).getTime()
      result = result.filter((deal) => {
        return new Date(deal.createdDate).getTime() >= dateFrom
      })
    }
    if (filters.value.dateTo) {
      const dateTo = new Date(filters.value.dateTo).getTime()
      result = result.filter((deal) => {
        return new Date(deal.createdDate).getTime() <= dateTo
      })
    }

    // Apply account name filter
    if (filters.value.accountNameFilter) {
      const accountFilter = filters.value.accountNameFilter.toLowerCase().trim()
      result = result.filter((deal) =>
        deal.accountName.toLowerCase().includes(accountFilter)
      )
    }

    // Apply deal name filter
    if (filters.value.dealNameFilter) {
      const dealFilter = filters.value.dealNameFilter.toLowerCase().trim()
      result = result.filter((deal) => deal.dealName.toLowerCase().includes(dealFilter))
    }

    return result
  })

  /**
   * Count active filters (excluding search)
   */
  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.value.statusFilter.length > 0) count++
    if (filters.value.amountMin !== null && filters.value.amountMin !== undefined) count++
    if (filters.value.amountMax !== null && filters.value.amountMax !== undefined) count++
    if (filters.value.dateFrom) count++
    if (filters.value.dateTo) count++
    if (filters.value.accountNameFilter) count++
    if (filters.value.dealNameFilter) count++
    return count
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

  // WebSocket Real-Time Updates
  /**
   * Initialize WebSocket connection for real-time updates
   */
  function initializeWebSocket() {
    console.log('[DealStore] Initializing WebSocket connection...')

    // Subscribe to deal updates
    websocketService.onMessage((updatedDeals) => {
      console.log('[DealStore] Received real-time updates:', updatedDeals.length, 'deals')

      // Invalidate cache since we have new data
      // This ensures subsequent API calls fetch fresh data
      invalidateAllDealsCache()

      // Add deals with automatic deduplication
      addDeals(updatedDeals)
    })

    // Subscribe to connection status
    websocketService.onStatusChange((connected) => {
      console.log('[DealStore] WebSocket connection status:', connected)
      wsConnected.value = connected
    })

    // Connect to WebSocket
    websocketService.connect()
  }

  /**
   * Disconnect WebSocket
   */
  function disconnectWebSocket() {
    websocketService.disconnect()
    wsConnected.value = false
  }

  // Filter Actions
  /**
   * Set global search query
   */
  function setSearch(search: string) {
    filters.value.search = search
  }

  /**
   * Set status filter
   */
  function setStatusFilter(statuses: DealStatus[]) {
    filters.value.statusFilter = statuses
  }

  /**
   * Set amount range filter
   */
  function setAmountRange(min: number | null, max: number | null) {
    // Ensure values are proper numbers and handle edge cases
    if (min !== null && min !== undefined) {
      const numMin = Number(min)
      filters.value.amountMin = !isNaN(numMin) ? numMin : null
    } else {
      filters.value.amountMin = null
    }

    if (max !== null && max !== undefined) {
      const numMax = Number(max)
      filters.value.amountMax = !isNaN(numMax) ? numMax : null
    } else {
      filters.value.amountMax = null
    }
  }

  /**
   * Set date range filter
   */
  function setDateRange(from: string | null, to: string | null) {
    filters.value.dateFrom = from
    filters.value.dateTo = to
  }

  /**
   * Set account name filter
   */
  function setAccountNameFilter(accountName: string) {
    filters.value.accountNameFilter = accountName
  }

  /**
   * Set deal name filter
   */
  function setDealNameFilter(dealName: string) {
    filters.value.dealNameFilter = dealName
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    filters.value = {
      search: '',
      statusFilter: [],
      amountMin: null,
      amountMax: null,
      dateFrom: null,
      dateTo: null,
      accountNameFilter: '',
      dealNameFilter: '',
    }
  }

  return {
    // State
    deals,
    loading,
    error,
    filters,
    wsConnected,

    // Getters
    allDeals,
    filteredDeals,
    activeFilterCount,

    // Actions
    addDeals,
    setDeals,
    getDealById,
    setLoading,
    setError,
    clearDeals,

    // WebSocket Actions
    initializeWebSocket,
    disconnectWebSocket,

    // Filter Actions
    setSearch,
    setStatusFilter,
    setAmountRange,
    setDateRange,
    setAccountNameFilter,
    setDealNameFilter,
    clearFilters,
  }
})
