<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(false)

const navItems = [
  { title: 'Home', icon: 'mdi-home', route: '/' },
  { title: 'Deals', icon: 'mdi-briefcase-outline', route: '/deals' },
]

function navigateTo(route: string) {
  router.push(route)
  drawer.value = false
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon
        color="white"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title>Partner Portal - Deal Management</v-toolbar-title>
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
