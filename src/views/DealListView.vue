<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center pe-2">
            <v-icon icon="mdi-briefcase-outline" class="me-2"></v-icon>
            {{ $t('dealList.title') }}
            <v-spacer></v-spacer>
            <v-chip v-if="totalDeals > 0 && !loading" color="primary" variant="outlined">
              {{ $t('dealList.count', { filtered: filteredDeals.length, total: totalDeals }) }}
            </v-chip>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Search and Filter Bar -->
          <v-card-text v-if="!loading && !dealStore.error && totalDeals > 0">
            <v-row dense>
              <v-col cols="12" sm="9" md="10">
                <SearchBar />
              </v-col>
              <v-col cols="12" sm="3" md="2">
                <v-badge
                  v-if="isMobile && dealStore.activeFilterCount > 0"
                  :content="dealStore.activeFilterCount"
                  color="primary"
                  floating
                >
                  <v-btn
                    :color="dealStore.activeFilterCount > 0 ? 'primary' : 'default'"
                    variant="outlined"
                    icon="mdi-filter-variant"
                    @click="filterDrawer = !filterDrawer"
                    block
                  />
                </v-badge>
                <v-btn
                  v-else
                  :color="dealStore.activeFilterCount > 0 ? 'primary' : 'default'"
                  variant="outlined"
                  :prepend-icon="isMobile ? 'mdi-filter-variant' : 'mdi-filter-variant'"
                  @click="filterDrawer = !filterDrawer"
                  block
                >
                  <span v-if="!isMobile">{{ $t('filters.title') }}</span>
                  <v-badge
                    v-if="!isMobile && dealStore.activeFilterCount > 0"
                    :content="dealStore.activeFilterCount"
                    color="primary"
                    inline
                  />
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider v-if="!loading && !dealStore.error && totalDeals > 0"></v-divider>

          <!-- Loading State -->
          <div v-if="loading" class="d-flex justify-center align-center pa-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
          </div>

          <!-- Error State -->
          <v-card-text v-else-if="dealStore.error" class="d-flex align-center justify-center pa-8">
            <div class="text-center">
              <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
              <div class="text-body-1 mb-4">{{ $t(dealStore.error) }}</div>
              <v-btn
                color="primary"
                variant="elevated"
                @click="loadDeals"
              >
                {{ $t('common.retry') }}
              </v-btn>
            </div>
          </v-card-text>

          <!-- Empty State - No Deals at All -->
          <v-empty-state
            v-else-if="totalDeals === 0"
            icon="mdi-briefcase-off-outline"
            :title="$t('dealList.emptyTitle')"
            :text="$t('dealList.emptyText')"
            class="my-8"
          >
            <template #actions>
              <v-btn
                color="primary"
                variant="elevated"
                @click="loadDeals"
              >
                {{ $t('common.refresh') }}
              </v-btn>
            </template>
          </v-empty-state>

          <!-- Empty State - Filtered Results -->
          <v-empty-state
            v-else-if="filteredDeals.length === 0"
            icon="mdi-filter-off-outline"
            :title="$t('dealList.noMatchTitle')"
            :text="$t('dealList.noMatchText')"
            class="my-8"
          >
            <template #actions>
              <v-btn
                color="primary"
                variant="elevated"
                @click="dealStore.clearFilters"
              >
                {{ $t('filters.title') }} {{ $t('common.clear') }}
              </v-btn>
            </template>
          </v-empty-state>

          <!-- Desktop Table View -->
          <v-data-table
            v-else
            v-show="!isMobile"
            :headers="headers"
            :items="paginatedDeals"
            :loading="loading"
            :items-per-page="itemsPerPage"
            hide-default-footer
            disable-sort
            class="elevation-0 deals-table clickable-rows"
            item-value="dealId"
            hover
            @click:row="(event, { item }) => viewDeal(item.dealId)"
          >
            <!-- Deal Name Column Template -->
            <template #[`item.dealName`]="{ item }">
              <div class="text-truncate-cell" :title="item.dealName">
                {{ item.dealName }}
              </div>
            </template>

            <!-- Account Column Template -->
            <template #[`item.accountName`]="{ item }">
              <div class="text-truncate-cell" :title="item.accountName">
                {{ item.accountName }}
              </div>
            </template>

            <!-- Status Column Template -->
            <template #[`item.status`]="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="flat"
              >
                {{ $t(`dealStatus.${item.status.toLowerCase()}`) }}
              </v-chip>
            </template>

            <!-- Amount Column Template -->
            <template #[`item.amount`]="{ item }">
              {{ formatCurrency(item.amount) }}
            </template>

            <!-- Created Date Column Template -->
            <template #[`item.createdDate`]="{ item }">
              {{ formatDate(item.createdDate) }}
            </template>
          </v-data-table>

          <!-- Desktop Pagination -->
          <div v-show="!isMobile && !loading && !dealStore.error && totalDeals > 0" class="d-flex justify-center align-center pa-4">
            <v-pagination
              v-model="page"
              :length="totalPagesDesktop"
              :total-visible="7"
            ></v-pagination>
          </div>

          <!-- Mobile Card View -->
          <div v-show="isMobile && !loading && !dealStore.error && totalDeals > 0" class="pa-4">
            <DealCard
              v-for="deal in paginatedDealsForMobile"
              :key="deal.dealId"
              :deal="deal"
              @view="viewDeal"
              class="mb-3"
            />
            <!-- Mobile Pagination -->
            <v-pagination
              v-if="totalPages > 1"
              v-model="mobilePage"
              :length="totalPages"
              :total-visible="5"
              class="mt-4"
            ></v-pagination>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Panel -->
    <FilterPanel v-model="filterDrawer" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useDealStore } from '@/stores/dealStore'
import { DealStatus } from '@/types'
import DealCard from '@/components/DealCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const { mobile } = useDisplay()
const { t, locale } = useI18n()
const dealStore = useDealStore()
const notification = useNotification()

// State
const page = ref(1)
const itemsPerPage = 10
const mobilePage = ref(1)
const itemsPerPageMobile = 10
const filterDrawer = ref(false) // Open by default on large screens (1280px+), closed on mobile/tablet

// Computed
const isMobile = computed(() => mobile.value)
const deals = computed(() => dealStore.allDeals)
const filteredDeals = computed(() => dealStore.filteredDeals)
const loading = computed(() => dealStore.loading)
const totalDeals = computed(() => deals.value.length)

// Desktop pagination
const totalPagesDesktop = computed(() => Math.ceil(filteredDeals.value.length / itemsPerPage))
const paginatedDeals = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDeals.value.slice(start, end)
})

// Mobile pagination
const totalPages = computed(() => Math.ceil(filteredDeals.value.length / itemsPerPageMobile))
const paginatedDealsForMobile = computed(() => {
  const start = (mobilePage.value - 1) * itemsPerPageMobile
  const end = start + itemsPerPageMobile
  return filteredDeals.value.slice(start, end)
})

// Table headers (computed for i18n reactivity)
const headers = computed(() => [
  { title: t('dealList.table.dealName'), key: 'dealName', width: '300px' },
  { title: t('dealList.table.accountName'), key: 'accountName', width: '250px' },
  { title: t('dealList.table.status'), key: 'status', width: '140px' },
  { title: t('dealList.table.amount'), key: 'amount', width: '160px' },
  { title: t('dealList.table.createdDate'), key: 'createdDate', width: '160px' },
])

// Methods
function getStatusColor(status: DealStatus): string {
  switch (status) {
    case DealStatus.OPEN:
      return 'blue'
    case DealStatus.APPROVED:
      return 'green'
    case DealStatus.REJECTED:
      return 'red'
    default:
      return 'grey'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function viewDeal(dealId: string): void {
  router.push(`/deals/${dealId}`)
}

// Lifecycle
onMounted(async () => {
  await loadDeals()

  // Initialize WebSocket for real-time updates
  dealStore.initializeWebSocket()
})

onUnmounted(() => {
  // Disconnect WebSocket when component unmounts
  dealStore.disconnectWebSocket()
})

async function loadDeals() {
  // Hide any existing notifications when retrying
  notification.hide()

  dealStore.setLoading(true)
  dealStore.setError(null)
  try {
    const { fetchAllDeals } = await import('@/services/dealService')
    const deals = await fetchAllDeals()
    dealStore.setDeals(deals)
    dealStore.setError(null) // Clear any previous errors
  } catch (error) {
    // Store translation key, not translated string
    dealStore.setError('errors.loadDeals')
    console.error('[DealListView] Error loading deals:', error)

    // Show error notification
    notification.showErrorFromException(error)
  } finally {
    dealStore.setLoading(false)
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.text-truncate-cell {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.deals-table table) {
  table-layout: fixed;
}

/* Clickable rows styling */
:deep(.clickable-rows tbody tr) {
  cursor: pointer;
}

/* Deal Name - Column 1 */
:deep(.deals-table th:nth-child(1)),
:deep(.deals-table td:nth-child(1)) {
  width: 300px !important;
  min-width: 300px !important;
  max-width: 300px !important;
}

/* Account Name - Column 2 */
:deep(.deals-table th:nth-child(2)),
:deep(.deals-table td:nth-child(2)) {
  width: 250px !important;
  min-width: 250px !important;
  max-width: 250px !important;
}

/* Status - Column 3 */
:deep(.deals-table th:nth-child(3)),
:deep(.deals-table td:nth-child(3)) {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
}

/* Amount - Column 4 */
:deep(.deals-table th:nth-child(4)),
:deep(.deals-table td:nth-child(4)) {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
}

/* Created Date - Column 5 */
:deep(.deals-table th:nth-child(5)),
:deep(.deals-table td:nth-child(5)) {
  width: 160px !important;
  min-width: 160px !important;
  max-width: 160px !important;
}
</style>
