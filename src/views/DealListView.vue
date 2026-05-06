<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center pe-2">
            <v-icon icon="mdi-briefcase-outline" class="me-2"></v-icon>
            Deals
            <v-spacer></v-spacer>
            <v-chip v-if="totalDeals" color="primary" variant="outlined">
              {{ totalDeals }} deals
            </v-chip>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Desktop Table View -->
          <v-data-table
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
          <div v-show="!isMobile" class="d-flex justify-center align-center pa-4">
            <v-pagination
              v-model="page"
              :length="totalPagesDesktop"
              :total-visible="7"
            ></v-pagination>
          </div>

          <!-- Mobile Card View -->
          <div v-show="isMobile" class="pa-4">
            <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
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
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useDealStore } from '@/stores/dealStore'
import { DealStatus } from '@/types'
import DealCard from '@/components/DealCard.vue'

const { mobile } = useDisplay()
const dealStore = useDealStore()

// State
const page = ref(1)
const itemsPerPage = 10
const mobilePage = ref(1)
const itemsPerPageMobile = 10

// Computed
const isMobile = computed(() => mobile.value)
const deals = computed(() => dealStore.allDeals)
const loading = computed(() => dealStore.loading)
const totalDeals = computed(() => deals.value.length)

// Desktop pagination
const totalPagesDesktop = computed(() => Math.ceil(totalDeals.value / itemsPerPage))
const paginatedDeals = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return deals.value.slice(start, end)
})

// Mobile pagination
const totalPages = computed(() => Math.ceil(totalDeals.value / itemsPerPageMobile))
const paginatedDealsForMobile = computed(() => {
  const start = (mobilePage.value - 1) * itemsPerPageMobile
  const end = start + itemsPerPageMobile
  return deals.value.slice(start, end)
})

// Table headers
const headers = [
  { title: 'Deal ID', key: 'dealId', sortable: true, width: '120px' },
  { title: 'Deal Name', key: 'dealName', sortable: true, width: '250px' },
  { title: 'Account', key: 'accountName', sortable: true, width: '200px' },
  { title: 'Status', key: 'status', sortable: true, width: '120px' },
  { title: 'Amount', key: 'amount', sortable: true, width: '140px' },
  { title: 'Created Date', key: 'createdDate', sortable: true, width: '140px' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const, width: '100px' },
]

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
  console.log('View deal:', dealId)
  // Will be implemented in later blocks
}

// Lifecycle
onMounted(async () => {
  await loadDeals()
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
