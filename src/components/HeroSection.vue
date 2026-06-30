<template>
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-text">
        <p class="eyebrow hero-eyebrow">{{ s.eyebrow }}</p>
        <h1 class="hero-title">{{ s.name }}</h1>
        <p class="hero-intro">{{ s.intro }}</p>
        <div class="hero-cta">
          <a
            v-if="showProjectsCta"
            href="#projecten"
            class="btn btn-primary"
            @click.prevent="scrollTo('projecten')"
          >
            Bekijk mijn werk
          </a>
          <a
            v-if="showExperienceCta"
            href="#ervaring"
            class="btn btn-ghost"
            @click.prevent="scrollTo('ervaring')"
          >
            Mijn ervaring
          </a>
        </div>
      </div>

      <div class="hero-photo">
        <div class="photo-shape" aria-hidden="true"></div>
        <img
          v-if="photo"
          :src="photo"
          :alt="s.name"
          class="photo"
        />
        <div v-else class="photo placeholder" aria-hidden="true">
          {{ initials }}
        </div>
      </div>
    </div>

    <button class="scroll-hint" @click="scrollTo(firstSection)" aria-label="Scroll naar beneden">
      <span></span>
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useSettings } from '../lib/useSettings.js'
import { cdnUrl } from '../lib/imageProcessing.js'

const props = defineProps({ firstSection: { type: String, default: 'projecten' } })
const { state } = useSettings()
const s = computed(() => state.settings)

// Hero-knoppen volgen de zichtbaarheid van hun sectie (verborgen sectie -> geen knop).
const visible = computed(() => s.value.sectionVisibility || {})
const showProjectsCta = computed(() => visible.value.projects !== false)
const showExperienceCta = computed(() => visible.value.experience !== false)

const photo = computed(() => cdnUrl(s.value.profilePhoto?.full || s.value.profilePhoto?.thumb || ''))
const initials = computed(() =>
  (s.value.name || 'M')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding-top: 68px;
  overflow: hidden;
}
.hero::before {
  /* zachte accent-gloed op de achtergrond */
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  max-width: 720px;
  max-height: 720px;
  background: radial-gradient(circle, var(--accent-soft), transparent 68%);
  filter: blur(10px);
  z-index: 0;
}
.hero-inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
  width: 100%;
}
.hero-eyebrow {
  animation: rise 0.7s var(--ease) both;
}
.hero-title {
  font-size: clamp(2.8rem, 1.6rem + 6vw, 5.5rem);
  margin: 0.4rem 0 1.2rem;
  animation: rise 0.7s var(--ease) 0.08s both;
}
.hero-intro {
  color: var(--text-soft);
  font-size: clamp(1.05rem, 1rem + 0.4vw, 1.25rem);
  max-width: 46ch;
  animation: rise 0.7s var(--ease) 0.16s both;
}
.hero-cta {
  display: flex;
  gap: 0.9rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  animation: rise 0.7s var(--ease) 0.24s both;
}

.hero-photo {
  position: relative;
  justify-self: center;
  width: min(100%, 420px);
  aspect-ratio: 4 / 5;
  animation: rise 0.9s var(--ease) 0.2s both;
}
.photo-shape {
  position: absolute;
  inset: -6% -6% 6% 6%;
  border-radius: 38% 62% 56% 44% / 48% 42% 58% 52%;
  background: var(--accent);
  opacity: 0.16;
  animation: morph 14s ease-in-out infinite;
}
.photo {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}
.photo.placeholder {
  display: grid;
  place-items: center;
  background: var(--surface-2);
  color: var(--accent);
  font-family: var(--font-display);
  font-size: 5rem;
}

.scroll-hint {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 42px;
  border: 2px solid var(--text-faint);
  border-radius: 999px;
  background: none;
  z-index: 1;
}
.scroll-hint span {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 4px;
  height: 8px;
  margin-left: -2px;
  border-radius: 2px;
  background: var(--accent);
  animation: scrolldot 1.6s var(--ease) infinite;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
}
@keyframes morph {
  50% {
    border-radius: 56% 44% 38% 62% / 54% 56% 44% 46%;
  }
}
@keyframes scrolldot {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  35% {
    opacity: 1;
  }
  70%,
  100% {
    opacity: 0;
    transform: translateY(14px);
  }
}

@media (max-width: 820px) {
  .hero-inner {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2.5rem;
    padding-top: 2rem;
  }
  .hero-intro {
    margin-inline: auto;
  }
  .hero-cta {
    justify-content: center;
  }
  .hero-photo {
    order: -1;
    width: min(74%, 320px);
  }
  .scroll-hint {
    display: none;
  }
}
</style>
