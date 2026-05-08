<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="text-center pa-8">
          <v-icon icon="mdi-hand-wave" size="64" color="primary" class="mb-4" />

          <h1 class="text-h3 mb-4">{{ t('home.welcome') }}</h1>

          <p class="text-h6 text-medium-emphasis mb-6">
            {{ t('home.subtitle') }}
          </p>

          <v-divider class="my-6" />

          <p class="text-body-1 mb-4">
            {{ t('home.currentRole') }}:
            <v-chip color="primary" class="ml-2">
              {{ t(`userRole.${authStore.currentRole.toLowerCase()}`) }}
            </v-chip>
          </p>

          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            prepend-icon="mdi-briefcase-outline"
            to="/deals"
            class="mt-4"
          >
            {{ t('home.viewDeals') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px);
}
</style>
