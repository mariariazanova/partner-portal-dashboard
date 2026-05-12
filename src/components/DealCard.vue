<template>
  <v-card elevation="2" hover class="clickable-card" @click="$emit('view', deal.dealId)">
    <v-card-text>
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="text-h6">{{ deal.dealName }}</div>
        <v-chip
          :color="getStatusColor(deal.status)"
          size="small"
          variant="flat"
        >
          {{ $t(`dealStatus.${deal.status.toLowerCase()}`) }}
        </v-chip>
      </div>

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
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Deal } from '@/types'
import { DealStatus } from '@/types'

const { locale } = useI18n()

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
  return new Date(dateString).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.clickable-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-card:hover {
  transform: translateY(-2px);
}
</style>
