<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useDealStore } from '@/stores/dealStore'
import { UserRole } from '@/types'
import GlobalNotification from '@/components/GlobalNotification.vue'

const router = useRouter()
const { mobile } = useDisplay()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const dealStore = useDealStore()
const drawer = ref(false)

const navItems = computed(() => [
  { title: t('nav.home'), icon: 'mdi-home', route: '/' },
  { title: t('nav.deals'), icon: 'mdi-briefcase-outline', route: '/deals' },
])

const languages = [
  { value: 'en', title: 'English', short: 'EN' },
  { value: 'ja', title: '日本語', short: 'JA' },
  { value: 'de', title: 'Deutsch', short: 'DE' },
  { value: 'es', title: 'Español', short: 'ES' },
]

// Full language names for dropdown items
const languageItems = computed(() =>
  languages.map(lang => ({ value: lang.value, title: lang.title }))
)

// Abbreviated for display on mobile
const currentLanguageDisplay = computed(() => {
  const lang = languages.find(l => l.value === locale.value)
  return mobile.value ? lang?.short : lang?.title
})

const roles = computed(() => [
  { value: UserRole.ADMIN, title: t('userRole.admin'), short: t('userRole.admin').substring(0, 3) },
  { value: UserRole.PARTNER, title: t('userRole.partner'), short: t('userRole.partner').substring(0, 3) },
])

// Full role names for dropdown items
const roleItems = computed(() =>
  roles.value.map(role => ({ value: role.value, title: role.title }))
)

// Abbreviated for display on mobile
const currentRoleDisplay = computed(() => {
  const role = roles.value.find(r => r.value === authStore.currentRole)
  return mobile.value ? role?.short : role?.title
})

function navigateTo(route: string) {
  router.push(route)
  drawer.value = false
}

function changeLanguage(newLocale: string) {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

function changeRole(newRole: UserRole) {
  authStore.setRole(newRole)
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" :prominent="!mobile">
      <v-app-bar-nav-icon
        color="white"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>
        <span v-if="mobile">{{ $t('app.titleShort') }}</span>
        <span v-else>{{ $t('app.title') }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- WebSocket Connection Status -->
      <v-tooltip :text="dealStore.wsConnected ? 'Real-time updates active' : 'Connecting...'" location="bottom">
        <template #activator="{ props }">
          <v-icon
            v-bind="props"
            :icon="dealStore.wsConnected ? 'mdi-wifi' : 'mdi-wifi-off'"
            :color="dealStore.wsConnected ? 'success' : 'warning'"
            class="mr-3"
          />
        </template>
      </v-tooltip>

      <!-- Role Switcher -->
      <v-select
        :model-value="authStore.currentRole"
        :items="roleItems"
        item-title="title"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        :prepend-inner-icon="mobile ? undefined : 'mdi-account-circle'"
        class="role-select"
        @update:model-value="changeRole"
      >
        <template #selection>
          <span>{{ currentRoleDisplay }}</span>
        </template>
      </v-select>

      <!-- Language Switcher -->
      <v-select
        :model-value="locale"
        :items="languageItems"
        item-title="title"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="language-select"
        @update:model-value="changeLanguage"
      >
        <template #selection>
          <span>{{ currentLanguageDisplay }}</span>
        </template>
      </v-select>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-for="item in navItems"
          :key="item.route"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="navigateTo(item.route)"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>

    <!-- Global Notification Snackbar -->
    <GlobalNotification />
  </v-app>
</template>

<style scoped>
.role-select {
  max-width: 160px;
  min-width: 140px;
  margin-right: 12px;
}

/* Mobile: Make role select very compact */
@media (max-width: 600px) {
  .role-select {
    max-width: 85px;
    min-width: 85px;
    margin-right: 6px;
  }

  .role-select :deep(.v-field__input) {
    padding-left: 8px;
    padding-right: 0;
  }

  .role-select :deep(.v-field__append-inner) {
    padding-left: 2px;
  }
}

.role-select :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.role-select :deep(.v-field__input) {
  color: white;
  min-height: 36px;
}

.role-select :deep(.v-select__selection-text) {
  color: white;
}

.role-select :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}

.role-select :deep(.v-icon) {
  color: white;
}

.language-select {
  max-width: 150px;
  min-width: 120px;
  margin-right: 16px;
}

/* Mobile: Make language select very compact */
@media (max-width: 600px) {
  .language-select {
    max-width: 75px;
    min-width: 75px;
    margin-right: 8px;
  }

  .language-select :deep(.v-field__input) {
    padding-left: 8px;
    padding-right: 0;
  }

  .language-select :deep(.v-field__append-inner) {
    padding-left: 2px;
  }
}

.language-select :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.language-select :deep(.v-field__input) {
  color: white;
  min-height: 36px;
}

.language-select :deep(.v-select__selection-text) {
  color: white;
}

.language-select :deep(.v-field__outline) {
  --v-field-border-opacity: 0.3;
}
</style>
