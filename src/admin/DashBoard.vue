<template>
  <div class="dash">
    <header class="dash-top">
      <div class="container dash-top-inner">
        <div class="dash-brand">
          <span class="dash-dot"></span>
          <h1>Dashboard</h1>
        </div>
        <div class="dash-actions">
          <RouterLink to="/" class="adm-btn" target="_blank">Bekijk site ↗</RouterLink>
          <button class="adm-btn" @click="logout">Uitloggen</button>
        </div>
      </div>
    </header>

    <nav class="dash-tabs">
      <div class="container dash-tabs-inner">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="tab"
          :class="{ active: tab === t.key }"
          @click="tab = t.key"
        >
          {{ t.label }}
        </button>
      </div>
    </nav>

    <main class="container dash-main">
      <ProjectsPanel v-if="tab === 'projects'" />
      <TimelinePanel v-else-if="tab === 'timeline'" />
      <ExperiencePanel v-else-if="tab === 'experience'" />
      <HomeSettingsPanel v-else-if="tab === 'home'" />
      <LayoutPanel v-else-if="tab === 'layout'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { auth } from '../firebase/firebase.js'
import '../css/admin.css'
import ProjectsPanel from './panels/ProjectsPanel.vue'
import TimelinePanel from './panels/TimelinePanel.vue'
import ExperiencePanel from './panels/ExperiencePanel.vue'
import HomeSettingsPanel from './panels/HomeSettingsPanel.vue'
import LayoutPanel from './panels/LayoutPanel.vue'

const router = useRouter()
const tab = ref('projects')
const tabs = [
  { key: 'projects', label: 'Projecten' },
  { key: 'timeline', label: 'Tijdlijn' },
  { key: 'experience', label: 'Werkervaring' },
  { key: 'home', label: 'Homepagina' },
  { key: 'layout', label: 'Indeling' },
]

const logout = async () => {
  await auth.signOut()
  router.push('/admin')
}
</script>

<style scoped>
.dash {
  min-height: 100svh;
  background: var(--surface-2);
  padding-bottom: 4rem;
}
.dash-top {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.dash-top-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 64px;
}
.dash-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.dash-brand h1 {
  font-size: 1.3rem;
}
.dash-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--accent);
}
.dash-actions {
  display: flex;
  gap: 0.6rem;
}

.dash-tabs {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.dash-tabs-inner {
  display: flex;
  gap: 0.3rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.dash-tabs-inner::-webkit-scrollbar {
  display: none;
}
.tab {
  flex: 0 0 auto;
  border: 0;
  background: none;
  padding: 1rem 0.9rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-soft);
  border-bottom: 2px solid transparent;
  transition: color var(--t-fast), border-color var(--t-fast);
  white-space: nowrap;
}
.tab:hover {
  color: var(--text);
}
.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.dash-main {
  padding-top: 1.8rem;
}
</style>
