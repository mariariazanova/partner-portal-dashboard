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
                <v-btn
                  :color="dealStore.activeFilterCount > 0 ? 'primary' : 'default'"
                  variant="outlined"
                  :prepend-icon="isMobile ? undefined : 'mdi-filter-variant'"
                  :icon="isMobile ? 'mdi-filter-variant' : undefined"
                  @click="filterDrawer = !filterDrawer"
                  block
                >
                  <span v-if="!isMobile">{{ $t('filters.title') }}</span>
                  <v-badge
                    v-if="dealStore.activeFilterCount > 0"
                    :content="dealStore.activeFilterCount"
                    color="primary"
                    :inline="!isMobile"
                    :floating="isMobile"
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
          <v-alert v-else-if="dealStore.error" type="error" class="ma-4">
            {{ dealStore.error }}
            <template #append>
              <v-btn
                variant="text"
                @click="loadDeals"
              >
                {{ $t('common.retry') }}
              </v-btn>
            </template>
          </v-alert>

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
            class="elevation-0 deals-table"
            item-value="dealId"
          >
            <!-- Deal ID Column Template -->
            <template #[`item.dealId`]="{ item }">
              <div class="text-truncate-cell" :title="item.dealId">
                {{ item.dealId }}
              </div>
            </template>

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
                {{ item.status }}
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

            <!-- Actions Column Template -->
            <template #[`item.actions`]="{ item }">
              <v-btn
                icon="mdi-eye-outline"
                size="small"
                variant="text"
                @click="viewDeal(item.dealId)"
              ></v-btn>
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

const router = useRouter()
const { mobile, lgAndUp } = useDisplay()
const { t } = useI18n()
const dealStore = useDealStore()

// State
const page = ref(1)
const itemsPerPage = 10
const mobilePage = ref(1)
const itemsPerPageMobile = 10
const filterDrawer = ref(lgAndUp.value) // Open by default on large screens (1280px+), closed on mobile/tablet

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
  { title: t('dealList.table.dealId'), key: 'dealId', sortable: true, width: '120px' },
  { title: t('dealList.table.dealName'), key: 'dealName', sortable: true, width: '250px' },
  { title: t('dealList.table.accountName'), key: 'accountName', sortable: true, width: '200px' },
  { title: t('dealList.table.status'), key: 'status', sortable: true, width: '120px' },
  { title: t('dealList.table.amount'), key: 'amount', sortable: true, width: '140px' },
  { title: t('dealList.table.createdDate'), key: 'createdDate', sortable: true, width: '140px' },
  { title: t('dealList.table.actions'), key: 'actions', sortable: false, align: 'center' as const, width: '100px' },
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
  return new Date(dateString).toLocaleDateString('en-US', {
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
  dealStore.setLoading(true)
  dealStore.setError(null)
  try {
    const { fetchAllDeals } = await import('@/services/dealService')
    const deals = await fetchAllDeals()
    dealStore.setDeals(deals)
  } catch (error) {
    dealStore.setError('Failed to load deals')
    console.error('Error loading deals:', error)
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

:deep(.deals-table th:nth-child(1)),
:deep(.deals-table td:nth-child(1)) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}

:deep(.deals-table th:nth-child(2)),
:deep(.deals-table td:nth-child(2)) {
  width: 250px !important;
  min-width: 250px !important;
  max-width: 250px !important;
}

:deep(.deals-table th:nth-child(3)),
:deep(.deals-table td:nth-child(3)) {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}

:deep(.deals-table th:nth-child(4)),
:deep(.deals-table td:nth-child(4)) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}

:deep(.deals-table th:nth-child(5)),
:deep(.deals-table td:nth-child(5)) {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
}

:deep(.deals-table th:nth-child(6)),
:deep(.deals-table td:nth-child(6)) {
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
}

:deep(.deals-table th:nth-child(7)),
:deep(.deals-table td:nth-child(7)) {
  width: 100px !important;
  min-width: 100px !important;
  max-width: 100px !important;
}
</style>
