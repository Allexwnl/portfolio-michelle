<template>
  <footer class="footer">
    <div class="container footer-inner">
      <span class="footer-brand">{{ state.settings.name }}</span>
      <span class="footer-meta">© {{ year }} · Portfolio</span>
      <RouterLink to="/admin" class="footer-admin" aria-label="Beheer">Beheer</RouterLink>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useSettings } from '../lib/useSettings.js'

const { state } = useSettings()
// Vaste waarde — Date.now() is hier niet nodig en blijft jaarlijks vanzelf goed via build.
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  padding-block: 2rem;
  background: var(--surface);
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  color: var(--text-soft);
  font-size: 0.9rem;
}
.footer-brand {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--text);
}
.footer-admin {
  color: var(--text-faint);
  transition: color var(--t-fast);
}
.footer-admin:hover {
  color: var(--accent);
}
</style>
