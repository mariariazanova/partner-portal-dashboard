<template>
  <v-card elevation="2" @click="$emit('view', deal.dealId)">
    <v-card-text>
      <div class="d-flex justify-space-between align-center mb-2">
        <div class="text-caption text-grey">{{ deal.dealId }}</div>
        <v-chip
          :color="getStatusColor(deal.status)"
          size="small"
          variant="flat"
        >
          {{ $t(`dealStatus.${deal.status.toLowerCase()}`) }}
        </v-chip>
      </div>

      <div class="text-h6 mb-2">{{ deal.dealName }}</div>

      <div class="text-body-2 mb-3">
        <v-icon icon="mdi-office-building" size="small" class="me-1"></v-icon>
        {{ deal.accountName }}
      </div>

      <v-divider class="my-3"></v-divider>

      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-caption text-grey">{{ $t('dealDetails.amount') }}</div>
          <div class="text-h6 text-primary">{{ formatCurrency(deal.amount) }}</div>
        </div>
        <div class="text-end">
          <div class="text-caption text-grey">{{ $t('dealDetails.createdDate') }}</div>
          <div class="text-body-2">{{ formatDate(deal.createdDate) }}</div>
        </div>
      </div>

      <div v-if="deal.contactPerson" class="mt-3">
        <div class="text-caption text-grey">{{ $t('dealDetails.contactPerson') }}</div>
        <div class="text-body-2">
          <v-icon icon="mdi-account" size="small" class="me-1"></v-icon>
          {{ deal.contactPerson }}
        </div>
        <div v-if="deal.contactEmail" class="text-caption text-grey">
          {{ deal.contactEmail }}
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="text"
        append-icon="mdi-arrow-right"
        @click.stop="$emit('view', deal.dealId)"
      >
        {{ $t('common.viewDetails') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Deal } from '@/types'
import { DealStatus } from '@/types'

interface Props {
  deal: Deal
}

defineProps<Props>()

defineEmits<{
  view: [dealId: string]
}>()

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
</script>
