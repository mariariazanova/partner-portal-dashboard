<template>
  <v-navigation-drawer
    v-model="isOpen"
    :location="mobile ? 'bottom' : 'right'"
    :temporary="mobile"
    :permanent="!mobile"
    width="400"
    class="filter-panel"
  >
    <v-card flat>
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Filters</span>
        <div>
          <v-chip
            v-if="activeFilterCount > 0"
            color="primary"
            size="small"
            class="mr-2"
          >
            {{ activeFilterCount }}
          </v-chip>
          <v-btn
            v-if="activeFilterCount > 0"
            variant="text"
            size="small"
            color="error"
            @click="handleClearAll"
          >
            Clear All
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <!-- Filter Content -->
      <v-card-text class="pa-4">
        <!-- Status Filter -->
        <div class="mb-4">
          <v-label class="mb-2 d-block font-weight-medium">Status</v-label>
          <v-select
            v-model="localFilters.statusFilter"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            multiple
            chips
            closable-chips
            variant="outlined"
            density="comfortable"
            placeholder="Select status"
            clearable
          >
            <template #chip="{ item, props }">
              <v-chip
                v-bind="props"
                :color="getStatusColor(item.value)"
                size="small"
              >
                {{ item.title }}
              </v-chip>
            </template>
          </v-select>
        </div>

        <!-- Amount Range Filter -->
        <div class="mb-4">
          <v-label class="mb-2 d-block font-weight-medium">Amount Range</v-label>
          <div class="d-flex gap-2">
            <v-text-field
              :model-value="localFilters.amountMin ?? undefined"
              type="number"
              variant="outlined"
              density="comfortable"
              placeholder="Min"
              prefix="$"
              clearable
              hide-details
              @update:model-value="handleAmountMinChange"
            />
            <v-text-field
              :model-value="localFilters.amountMax ?? undefined"
              type="number"
              variant="outlined"
              density="comfortable"
              placeholder="Max"
              prefix="$"
              clearable
              hide-details
              @update:model-value="handleAmountMaxChange"
            />
          </div>
        </div>

        <!-- Date Range Filter -->
        <div class="mb-4">
          <v-label class="mb-2 d-block font-weight-medium">Date Range</v-label>
          <div class="d-flex flex-column gap-2">
            <!-- Date From Picker -->
            <v-menu
              v-model="dateFromMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ props }">
                <v-text-field
                  :model-value="localFilters.dateFrom"
                  label="From"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  clearable
                  hide-details
                  v-bind="props"
                  @click:clear="localFilters.dateFrom = null"
                />
              </template>
              <v-date-picker
                v-model="dateFromPicker"
                @update:model-value="onDateFromChange"
              />
            </v-menu>

            <!-- Date To Picker -->
            <v-menu
              v-model="dateToMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ props }">
                <v-text-field
                  :model-value="localFilters.dateTo"
                  label="To"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  clearable
                  hide-details
                  v-bind="props"
                  @click:clear="localFilters.dateTo = null"
                />
              </template>
              <v-date-picker
                v-model="dateToPicker"
                @update:model-value="onDateToChange"
              />
            </v-menu>
          </div>
        </div>

        <!-- Account Name Filter -->
        <div class="mb-4">
          <v-label class="mb-2 d-block font-weight-medium">Account Name</v-label>
          <v-text-field
            v-model="localFilters.accountNameFilter"
            variant="outlined"
            density="comfortable"
            placeholder="Filter by account name"
            clearable
            hide-details
          />
        </div>

        <!-- Deal Name Filter -->
        <div class="mb-4">
          <v-label class="mb-2 d-block font-weight-medium">Deal Name</v-label>
          <v-text-field
            v-model="localFilters.dealNameFilter"
            variant="outlined"
            density="comfortable"
            placeholder="Filter by deal name"
            clearable
            hide-details
          />
        </div>
      </v-card-text>

      <!-- Active Filters Summary -->
      <v-card-text v-if="activeFilterChips.length > 0" class="pt-0">
        <v-divider class="mb-3" />
        <v-label class="mb-2 d-block font-weight-medium">Active Filters</v-label>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="chip in activeFilterChips"
            :key="chip.key"
            closable
            size="small"
            @click:close="chip.onClose"
          >
            {{ chip.label }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useDealStore } from '@/stores/dealStore'
import { DealStatus } from '@/types'

/**
 * FilterPanel Component
 *
 * - Collapsible filter drawer (v-navigation-drawer)
 * - Status multi-select with chips
 * - Amount range filter (min/max)
 * - Date range filter
 * - Text filters for account and deal name
 * - Clear all filters button
 * - Active filter chip indicators
 * - Responsive (drawer on mobile, permanent on desktop)
 */

interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
})

const emit = defineEmits<Emits>()

const dealStore = useDealStore()
const { mobile } = useDisplay()

// Local drawer state
const isOpen = ref(props.modelValue)

// Flag to prevent store watcher from overwriting local changes
let updatingFromLocal = false

// Date picker menu states
const dateFromMenu = ref(false)
const dateToMenu = ref(false)

// Date picker values (Date objects for v-date-picker)
const dateFromPicker = ref<Date | null>(
  dealStore.filters.dateFrom ? new Date(dealStore.filters.dateFrom) : null
)
const dateToPicker = ref<Date | null>(
  dealStore.filters.dateTo ? new Date(dealStore.filters.dateTo) : null
)

// Local filter state (for immediate UI updates)
const localFilters = ref({
  statusFilter: [...dealStore.filters.statusFilter],
  amountMin: dealStore.filters.amountMin,
  amountMax: dealStore.filters.amountMax,
  dateFrom: dealStore.filters.dateFrom,
  dateTo: dealStore.filters.dateTo,
  accountNameFilter: dealStore.filters.accountNameFilter,
  dealNameFilter: dealStore.filters.dealNameFilter,
})

// Status options for select
const statusOptions = [
  { label: 'Open', value: DealStatus.OPEN },
  { label: 'Approved', value: DealStatus.APPROVED },
  { label: 'Rejected', value: DealStatus.REJECTED },
]

// Active filter count
const activeFilterCount = computed(() => dealStore.activeFilterCount)

// Get status color
function getStatusColor(status: DealStatus) {
  switch (status) {
    case DealStatus.OPEN:
      return 'info'
    case DealStatus.APPROVED:
      return 'success'
    case DealStatus.REJECTED:
      return 'error'
    default:
      return 'default'
  }
}

// Build active filter chips
const activeFilterChips = computed(() => {
  const chips: Array<{ key: string; label: string; onClose: () => void }> = []

  // Status chips
  localFilters.value.statusFilter.forEach((status) => {
    chips.push({
      key: `status-${status}`,
      label: `Status: ${status}`,
      onClose: () => {
        localFilters.value.statusFilter = localFilters.value.statusFilter.filter(
          (s) => s !== status
        )
      },
    })
  })

  // Amount min chip
  if (localFilters.value.amountMin !== null && localFilters.value.amountMin !== undefined) {
    chips.push({
      key: 'amount-min',
      label: `Min: $${localFilters.value.amountMin}`,
      onClose: () => {
        localFilters.value.amountMin = null
      },
    })
  }

  // Amount max chip
  if (localFilters.value.amountMax !== null && localFilters.value.amountMax !== undefined) {
    chips.push({
      key: 'amount-max',
      label: `Max: $${localFilters.value.amountMax}`,
      onClose: () => {
        localFilters.value.amountMax = null
      },
    })
  }

  // Date from chip
  if (localFilters.value.dateFrom) {
    chips.push({
      key: 'date-from',
      label: `From: ${localFilters.value.dateFrom}`,
      onClose: () => {
        localFilters.value.dateFrom = null
        dateFromPicker.value = null
      },
    })
  }

  // Date to chip
  if (localFilters.value.dateTo) {
    chips.push({
      key: 'date-to',
      label: `To: ${localFilters.value.dateTo}`,
      onClose: () => {
        localFilters.value.dateTo = null
        dateToPicker.value = null
      },
    })
  }

  // Account name chip
  if (localFilters.value.accountNameFilter) {
    chips.push({
      key: 'account-name',
      label: `Account: ${localFilters.value.accountNameFilter}`,
      onClose: () => {
        localFilters.value.accountNameFilter = ''
      },
    })
  }

  // Deal name chip
  if (localFilters.value.dealNameFilter) {
    chips.push({
      key: 'deal-name',
      label: `Deal: ${localFilters.value.dealNameFilter}`,
      onClose: () => {
        localFilters.value.dealNameFilter = ''
      },
    })
  }

  return chips
})

// Handle amount min change
function handleAmountMinChange(value: string | number | null) {
  if (value === null || value === '' || value === undefined) {
    localFilters.value.amountMin = null
  } else {
    const numValue = Number(value)
    localFilters.value.amountMin = isNaN(numValue) ? null : numValue
  }
}

// Handle amount max change
function handleAmountMaxChange(value: string | number | null) {
  if (value === null || value === '' || value === undefined) {
    localFilters.value.amountMax = null
  } else {
    const numValue = Number(value)
    localFilters.value.amountMax = isNaN(numValue) ? null : numValue
  }
}

// Handle date from change
function onDateFromChange(date: Date | null) {
  if (date) {
    // Format date in local timezone to avoid timezone offset issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    localFilters.value.dateFrom = `${year}-${month}-${day}`
    dateFromMenu.value = false
  }
}

// Handle date to change
function onDateToChange(date: Date | null) {
  if (date) {
    // Format date in local timezone to avoid timezone offset issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    localFilters.value.dateTo = `${year}-${month}-${day}`
    dateToMenu.value = false
  }
}

// Clear all filters
function handleClearAll() {
  // Update local state - watcher will sync to store automatically
  localFilters.value.statusFilter = []
  localFilters.value.amountMin = null
  localFilters.value.amountMax = null
  localFilters.value.dateFrom = null
  localFilters.value.dateTo = null
  localFilters.value.accountNameFilter = ''
  localFilters.value.dealNameFilter = ''

  dateFromPicker.value = null
  dateToPicker.value = null
}

// Watch local filters and update store
watch(
  localFilters,
  (newFilters) => {
    // Set flag to prevent store watcher from overwriting
    updatingFromLocal = true

    dealStore.setStatusFilter(newFilters.statusFilter)
    dealStore.setAmountRange(newFilters.amountMin, newFilters.amountMax)
    dealStore.setDateRange(newFilters.dateFrom, newFilters.dateTo)
    dealStore.setAccountNameFilter(newFilters.accountNameFilter)
    dealStore.setDealNameFilter(newFilters.dealNameFilter)

    // Reset flag in next tick
    setTimeout(() => {
      updatingFromLocal = false
    }, 0)
  },
  { deep: true }
)

// Watch store filters for external updates (e.g., from other components)
watch(
  () => dealStore.filters,
  (newFilters) => {
    // Don't overwrite local state if we're updating from local changes
    if (updatingFromLocal) return

    localFilters.value = {
      statusFilter: [...newFilters.statusFilter],
      amountMin: newFilters.amountMin,
      amountMax: newFilters.amountMax,
      dateFrom: newFilters.dateFrom,
      dateTo: newFilters.dateTo,
      accountNameFilter: newFilters.accountNameFilter,
      dealNameFilter: newFilters.dealNameFilter,
    }
    // Sync date picker values
    dateFromPicker.value = newFilters.dateFrom ? new Date(newFilters.dateFrom) : null
    dateToPicker.value = newFilters.dateTo ? new Date(newFilters.dateTo) : null
  },
  { deep: true }
)

// Watch drawer state
watch(isOpen, (value) => {
  emit('update:modelValue', value)
})

watch(
  () => props.modelValue,
  (value) => {
    isOpen.value = value
  }
)
</script>

<style scoped>
.filter-panel {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}

.gap-2 {
  gap: 8px;
}
</style>
