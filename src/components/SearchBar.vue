<template>
  <v-text-field
    v-model="localSearch"
    prepend-inner-icon="mdi-magnify"
    :label="$t('search.placeholder')"
    variant="outlined"
    density="comfortable"
    clearable
    single-line
    hide-details
    class="search-bar"
    @update:model-value="onSearchChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDealStore } from '@/stores/dealStore'
import { sanitizeSearchQuery } from '@/utils/sanitize'

/**
 * SearchBar Component
 *
 * - Debounced search input (300ms delay)
 * - Integrates with store's multi-field search
 * - Material Design text field with search icon
 * - XSS Prevention: Sanitizes search input
 */

const dealStore = useDealStore()
const localSearch = ref(dealStore.filters.search)

// Debounce timeout reference
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Handle search input with debounce
 * Waits 300ms after user stops typing before triggering search
 * Sanitizes input to prevent XSS attacks
 */
function onSearchChange(value: string | null) {
  // Clear existing timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  // Set new timeout for debounced search
  debounceTimeout = setTimeout(() => {
    // Sanitize input before setting to store
    const sanitized = sanitizeSearchQuery(value || '')
    dealStore.setSearch(sanitized)
  }, 300)
}

// Watch store search for external updates (e.g., clear all filters)
watch(
  () => dealStore.filters.search,
  (newValue) => {
    localSearch.value = newValue
  }
)
</script>

<style scoped>
.search-bar {
  max-width: 600px;
}
</style>
