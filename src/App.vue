<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { loadSettings } from './lib/useSettings.js'

// Laad de accentkleur zo vroeg mogelijk, zodat de hele site 'm meteen heeft.
onMounted(() => {
  loadSettings()
})
</script>
