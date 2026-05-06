<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <!-- Back Button -->
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          color="primary"
          @click="goBack"
          class="mb-4"
        >
          Back to Deals
        </v-btn>

        <!-- Loading State -->
        <v-card v-if="loading" class="pa-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <span class="ml-4">Loading deal details...</span>
        </v-card>

        <!-- Error State -->
        <v-alert v-else-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <!-- Deal Not Found -->
        <v-alert v-else-if="!deal" type="warning" class="mb-4">
          Deal not found
        </v-alert>

        <!-- Deal Details -->
        <template v-else>
          <!-- Header Card -->
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-briefcase-outline" class="me-2"></v-icon>
              {{ deal.dealName }}
            </v-card-title>
            <v-card-subtitle>{{ deal.dealId }}</v-card-subtitle>
            <v-divider></v-divider>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">Status</div>
                    <v-chip
                      :color="getStatusColor(deal.status)"
                      size="large"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ deal.status }}
                    </v-chip>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-grey">Amount</div>
                    <div class="text-h4 text-primary mt-1">
                      {{ formatCurrency(deal.amount) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">Created Date</div>
                    <div class="text-body-1 mt-1">
                      {{ formatDate(deal.createdDate) }}
                    </div>
                  </div>
                  <div v-if="deal.updatedDate" class="mb-4">
                    <div class="text-caption text-grey">Last Updated</div>
                    <div class="text-body-1 mt-1">
                      {{ formatDate(deal.updatedDate) }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Account Information Card -->
          <v-card class="mb-4">
            <v-card-title>
              <v-icon icon="mdi-office-building" class="me-2"></v-icon>
              Account Information
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">Account Name</div>
                    <div class="text-body-1 mt-1">{{ deal.accountName }}</div>
                  </div>
                </v-col>
                <v-col v-if="deal.assignedTo" cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">Assigned To</div>
                    <div class="text-body-1 mt-1">{{ deal.assignedTo }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Contact Information Card -->
          <v-card v-if="deal.contactPerson || deal.contactEmail" class="mb-4">
            <v-card-title>
              <v-icon icon="mdi-account" class="me-2"></v-icon>
              Contact Information
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row>
                <v-col v-if="deal.contactPerson" cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">Contact Person</div>
                    <div class="text-body-1 mt-1">{{ deal.contactPerson }}</div>
                  </div>
                </v-col>
                <v-col v-if="deal.contactEmail" cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">Email</div>
                    <div class="text-body-1 mt-1">
                      <a :href="`mailto:${deal.contactEmail}`">{{ deal.contactEmail }}</a>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Description Card -->
          <v-card v-if="deal.description">
            <v-card-title>
              <v-icon icon="mdi-text" class="me-2"></v-icon>
              Description
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <div class="text-body-1">{{ deal.description }}</div>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDealStore } from '@/stores/dealStore'
import { DealStatus } from '@/types'
import type { Deal } from '@/types'

const route = useRoute()
const router = useRouter()
const dealStore = useDealStore()

// State
const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const dealId = computed(() => route.params.id as string)
const deal = computed((): Deal | undefined => dealStore.getDealById(dealId.value))

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function goBack(): void {
  router.push('/deals')
}

// Lifecycle
onMounted(async () => {
  // If store is empty, load deals
  if (dealStore.allDeals.length === 0) {
    loading.value = true
    error.value = null
    try {
      const { fetchAllDeals } = await import('@/services/dealService')
      const deals = await fetchAllDeals()
      dealStore.setDeals(deals)
    } catch (err) {
      error.value = 'Failed to load deal details'
      console.error('Error loading deals:', err)
    } finally {
      loading.value = false
    }
  }
})
</script>
