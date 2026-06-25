<template>
  <header class="nav" :class="{ scrolled }">
    <div class="container nav-inner">
      <RouterLink to="/" class="brand" @click="closeMenu">{{ name }}</RouterLink>

      <button
        class="burger"
        :class="{ open }"
        :aria-expanded="open"
        aria-label="Menu"
        @click="open = !open"
      >
        <span></span><span></span><span></span>
      </button>

      <nav class="links" :class="{ open }">
        <a v-for="l in links" :key="l.hash" :href="`/#${l.hash}`" @click.prevent="go(l.hash)">
          {{ l.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSettings } from '../lib/useSettings.js'

const { state } = useSettings()
const name = ref(state.settings.name)
const router = useRouter()

const links = [
  { hash: 'tijdlijn', label: 'Tijdlijn' },
  { hash: 'ervaring', label: 'Ervaring' },
  { hash: 'projecten', label: 'Projecten' },
]

const open = ref(false)
const scrolled = ref(false)
const closeMenu = () => (open.value = false)

const go = async (hash) => {
  open.value = false
  if (router.currentRoute.value.path !== '/') {
    await router.push({ path: '/', hash: `#${hash}` })
  } else {
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
  }
}

const onScroll = () => (scrolled.value = window.scrollY > 24)
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  // Naam kan na het laden van instellingen veranderen.
  setTimeout(() => (name.value = state.settings.name), 600)
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  transition: background var(--t-med), box-shadow var(--t-med), backdrop-filter var(--t-med);
}
.nav.scrolled {
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: saturate(1.4) blur(12px);
  box-shadow: 0 1px 0 var(--line);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}
.brand {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.links {
  display: flex;
  gap: 2rem;
}
.links a {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-soft);
  position: relative;
  transition: color var(--t-fast);
}
.links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  height: 2px;
  width: 0;
  background: var(--accent);
  transition: width var(--t-fast) var(--ease);
}
.links a:hover {
  color: var(--text);
}
.links a:hover::after {
  width: 100%;
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: 0;
  padding: 8px;
}
.burger span {
  width: 24px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: transform var(--t-fast) var(--ease), opacity var(--t-fast);
}
.burger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.burger.open span:nth-child(2) {
  opacity: 0;
}
.burger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 720px) {
  .burger {
    display: flex;
  }
  .links {
    position: fixed;
    inset: 68px 0 auto 0;
    flex-direction: column;
    gap: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--line);
    box-shadow: var(--shadow-md);
    padding: 0.5rem var(--gutter) 1rem;
    transform: translateY(-12px);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--t-fast), transform var(--t-fast) var(--ease);
  }
  .links.open {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
  .links a {
    padding: 0.9rem 0;
    font-size: 1.05rem;
    border-bottom: 1px solid var(--line);
  }
  .links a:last-child {
    border-bottom: 0;
  }
}
</style>
