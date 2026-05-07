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
          {{ $t('dealDetails.backToDeals') }}
        </v-btn>

        <!-- Loading State -->
        <v-card v-if="loading">
          <div class="d-flex flex-column justify-center align-center pa-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <div class="mt-4 text-body-1">{{ $t('dealDetails.loading') }}</div>
          </div>
        </v-card>

        <!-- Error State -->
        <v-card v-else-if="error">
          <v-card-text class="d-flex align-center justify-center pa-8">
            <div class="text-center">
              <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
              <div class="text-body-1 mb-4">{{ $t(error) }}</div>
              <v-btn
                color="primary"
                variant="elevated"
                @click="loadDealData"
                class="mr-2"
              >
                {{ $t('common.retry') }}
              </v-btn>
              <v-btn
                variant="outlined"
                @click="goBack"
              >
                {{ $t('dealDetails.backToDeals') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Deal Not Found -->
        <v-empty-state
          v-else-if="!deal"
          icon="mdi-briefcase-off-outline"
          :title="$t('dealDetails.notFoundTitle')"
          :text="$t('dealDetails.notFoundText')"
        >
          <template #actions>
            <v-btn
              color="primary"
              variant="elevated"
              @click="goBack"
            >
              {{ $t('dealDetails.backToDeals') }}
            </v-btn>
          </template>
        </v-empty-state>

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
                    <div class="text-caption text-grey">{{ $t('dealDetails.status') }}</div>
                    <v-chip
                      :color="getStatusColor(deal.status)"
                      size="large"
                      variant="flat"
                      class="mt-1"
                    >
                      {{ $t(`dealStatus.${deal.status.toLowerCase()}`) }}
                    </v-chip>
                  </div>
                  <div class="mb-4">
                    <div class="text-caption text-grey">{{ $t('dealDetails.amount') }}</div>
                    <div class="text-h4 text-primary mt-1">
                      {{ formatCurrency(deal.amount) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">{{ $t('dealDetails.createdDate') }}</div>
                    <div class="text-body-1 mt-1">
                      {{ formatDate(deal.createdDate) }}
                    </div>
                  </div>
                  <div v-if="deal.updatedDate" class="mb-4">
                    <div class="text-caption text-grey">{{ $t('dealDetails.lastUpdated') }}</div>
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
              {{ $t('dealDetails.accountInfo') }}
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">{{ $t('dealDetails.accountName') }}</div>
                    <div class="text-body-1 mt-1">{{ deal.accountName }}</div>
                  </div>
                </v-col>
                <v-col v-if="deal.assignedTo" cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">{{ $t('dealDetails.assignedTo') }}</div>
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
              {{ $t('dealDetails.contactInfo') }}
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row>
                <v-col v-if="deal.contactPerson" cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">{{ $t('dealDetails.contactPerson') }}</div>
                    <div class="text-body-1 mt-1">{{ deal.contactPerson }}</div>
                  </div>
                </v-col>
                <v-col v-if="deal.contactEmail" cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey">{{ $t('dealDetails.email') }}</div>
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
              {{ $t('dealDetails.description') }}
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
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const router = useRouter()
const dealStore = useDealStore()
const notification = useNotification()

// State
const loading = ref(true)
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
  await loadDealData()
})

async function loadDealData() {
  // Hide any existing notifications when retrying
  notification.hide()

  // If store is empty, load deals
  if (dealStore.allDeals.length === 0) {
    loading.value = true
    error.value = null
    try {
      const { fetchAllDeals } = await import('@/services/dealService')
      const deals = await fetchAllDeals()
      dealStore.setDeals(deals)
    } catch (err) {
      // Store translation key, not translated string
      error.value = 'errors.loadDealDetails'
      console.error('[DealDetailsView] Error loading deals:', err)

      // Show error notification
      notification.showErrorFromException(err)
    } finally {
      loading.value = false
    }
  } else {
    // Data already loaded, show content after brief delay
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
}
</script>
