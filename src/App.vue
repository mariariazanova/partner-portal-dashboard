<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { mobile } = useDisplay()
const { t, locale } = useI18n()
const drawer = ref(false)

const navItems = computed(() => [
  { title: t('nav.home'), icon: 'mdi-home', route: '/' },
  { title: t('nav.deals'), icon: 'mdi-briefcase-outline', route: '/deals' },
])

const languages = [
  { value: 'en', title: 'English' },
  { value: 'ja', title: '日本語' },
  { value: 'de', title: 'Deutsch' },
  { value: 'es', title: 'Español' },
]

function navigateTo(route: string) {
  router.push(route)
  drawer.value = false
}

function changeLanguage(newLocale: string) {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
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

      <!-- Language Switcher -->
      <v-select
        :model-value="locale"
        :items="languages"
        item-title="title"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        class="language-select"
        @update:model-value="changeLanguage"
      />
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
  </v-app>
</template>

<style scoped>
.language-select {
  max-width: 150px;
  min-width: 120px;
  margin-right: 16px;
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
