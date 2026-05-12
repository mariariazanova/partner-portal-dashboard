<template>
  <v-snackbar
    v-model="notification.state.value.visible"
    :timeout="notification.state.value.timeout"
    :color="getColor(notification.state.value.type)"
    location="top"
    multi-line
  >
    <div class="d-flex align-center">
      <v-icon
        :icon="getIcon(notification.state.value.type)"
        class="mr-3"
      />
      <span>{{ translatedMessage }}</span>
    </div>

    <template #actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="notification.hide"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotification, type NotificationType } from '@/composables/useNotification'

const notification = useNotification()
const { t, te } = useI18n()

// Reactive message that checks if it's a translation key
const translatedMessage = computed(() => {
  const message = notification.state.value.message
  // Check if message is a translation key (starts with known prefixes)
  if (te(message)) {
    return t(message)
  }
  // Otherwise return as-is (already translated or plain text)
  return message
})

function getColor(type: NotificationType): string {
  switch (type) {
    case 'error':
      return 'error'
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'info':
    default:
      return 'info'
  }
}

function getIcon(type: NotificationType): string {
  switch (type) {
    case 'error':
      return 'mdi-alert-circle'
    case 'success':
      return 'mdi-check-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
    default:
      return 'mdi-information'
  }
}
</script>
