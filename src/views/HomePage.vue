<template>
  <div class="home">
    <NavBar />
    <main>
      <HeroSection :first-section="firstVisible" />

      <template v-for="key in order" :key="key">
        <component :is="sectionMap[key]" v-if="visible[key] && sectionMap[key]" />
      </template>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import HeroSection from '../components/HeroSection.vue'
import TimelineSection from '../components/TimelineSection.vue'
import ExperienceSection from '../components/ExperienceSection.vue'
import ProjectGallery from '../components/ProjectGallery.vue'
import { useSettings } from '../lib/useSettings.js'

const route = useRoute()
const { state, loadSettings } = useSettings()

const sectionMap = {
  timeline: TimelineSection,
  experience: ExperienceSection,
  projects: ProjectGallery,
}
const anchorMap = { timeline: 'tijdlijn', experience: 'ervaring', projects: 'projecten' }

const order = computed(() => state.settings.sectionOrder || [])
const visible = computed(() => state.settings.sectionVisibility || {})
const firstVisible = computed(() => {
  const first = order.value.find((k) => visible.value[k])
  return anchorMap[first] || 'projecten'
})

onMounted(async () => {
  await loadSettings()
  // Als er via een #hash genavigeerd is, scroll daar na het laden naartoe.
  if (route.hash) {
    await nextTick()
    setTimeout(
      () => document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth' }),
      120
    )
  }
})
</script>
