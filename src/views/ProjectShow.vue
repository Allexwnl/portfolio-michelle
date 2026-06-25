<template>
  <div class="project-page">
    <NavBar />

    <main v-if="project">
      <!-- Cover / titel -->
      <header class="p-hero">
        <div v-if="project.cover?.full || project.cover?.thumb" class="p-cover">
          <img :src="project.cover.full || project.cover.thumb" :alt="project.title" />
          <div class="p-cover-veil"></div>
        </div>
        <div class="container p-hero-inner" :class="{ 'no-cover': !hasCover }">
          <RouterLink to="/#projecten" class="p-back">← Terug naar projecten</RouterLink>
          <h1 class="p-title">{{ project.title }}</h1>
        </div>
      </header>

      <!-- Tekstblokken: 1 = gecentreerd, 2+ = afwisselend links/rechts -->
      <section v-if="blocks.length" class="section p-text">
        <div class="container">
          <div
            v-for="(block, i) in blocks"
            :key="i"
            class="block"
            :class="blockAlign(i)"
            v-reveal
          >
            <h2 v-if="block.heading" class="block-heading">{{ block.heading }}</h2>
            <p class="block-body">{{ block.body }}</p>
          </div>
        </div>
      </section>

      <!-- Afbeeldingen -->
      <section v-if="images.length" class="section p-media">
        <div class="container">
          <MediaCarousel :images="images" />
        </div>
      </section>

      <!-- Video's -->
      <section v-if="videoIds.length" class="section p-videos">
        <div class="container">
          <div class="videos-grid" :class="{ single: videoIds.length === 1 }">
            <YouTubeEmbed v-for="id in videoIds" :key="id" :id="id" v-reveal />
          </div>
        </div>
      </section>

      <div class="container p-foot">
        <RouterLink to="/#projecten" class="btn btn-ghost">← Alle projecten</RouterLink>
      </div>
    </main>

    <div v-else-if="loading" class="state container">Laden…</div>
    <div v-else class="state container">
      <p>Dit project bestaat niet (meer).</p>
      <RouterLink to="/" class="btn btn-ghost">Naar home</RouterLink>
    </div>

    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import SiteFooter from '../components/SiteFooter.vue'
import MediaCarousel from '../components/MediaCarousel.vue'
import YouTubeEmbed from '../components/YouTubeEmbed.vue'
import { db } from '../firebase/firebase.js'
import { doc, getDoc } from 'firebase/firestore'
import { youtubeId } from '../lib/youtube.js'

const route = useRoute()
const project = ref(null)
const loading = ref(true)

const hasCover = computed(() => !!(project.value?.cover?.full || project.value?.cover?.thumb))
const blocks = computed(() => project.value?.textBlocks || [])
const images = computed(() => project.value?.images || [])
const videoIds = computed(() =>
  (project.value?.videos || []).map((v) => youtubeId(v)).filter(Boolean)
)

// 1 blok -> gecentreerd; meerdere -> blok 1 links, blok 2 rechts, enz.
const blockAlign = (i) => {
  if (blocks.value.length === 1) return 'center'
  return i % 2 === 0 ? 'left' : 'right'
}

const load = async (id) => {
  loading.value = true
  project.value = null
  try {
    const snap = await getDoc(doc(db, 'projects', id))
    if (snap.exists()) project.value = { id: snap.id, ...snap.data() }
  } finally {
    loading.value = false
  }
}

onMounted(() => load(route.params.id))
watch(() => route.params.id, (id) => id && load(id))
</script>

<style scoped>
.p-hero {
  position: relative;
  padding-top: 68px;
}
.p-cover {
  position: relative;
  height: clamp(280px, 52vh, 540px);
  overflow: hidden;
}
.p-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.p-cover-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.55));
}
.p-hero-inner {
  position: relative;
  margin-top: -7rem;
  padding-bottom: 1rem;
  color: #fff;
}
.p-hero-inner.no-cover {
  margin-top: 2rem;
  color: var(--text);
}
.p-back {
  display: inline-block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  opacity: 0.9;
  transition: opacity var(--t-fast);
}
.p-back:hover {
  opacity: 1;
}
.p-title {
  font-size: clamp(2.2rem, 1.4rem + 4vw, 4rem);
  text-shadow: 0 2px 30px rgba(0, 0, 0, 0.35);
}
.p-hero-inner.no-cover .p-title {
  text-shadow: none;
}

.p-text .container {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 5vw, 3.5rem);
}
.block {
  max-width: 60ch;
}
.block.center {
  margin-inline: auto;
  text-align: center;
}
.block.left {
  margin-right: auto;
}
.block.right {
  margin-left: auto;
  text-align: right;
}
.block-heading {
  font-size: clamp(1.4rem, 1.1rem + 1.4vw, 2rem);
  margin-bottom: 0.6rem;
}
.block-body {
  color: var(--text-soft);
  font-size: 1.08rem;
  white-space: pre-line;
}

.p-media {
  padding-top: 0;
}
.p-text + .p-media {
  padding-top: clamp(1rem, 3vw, 2rem);
}
.p-media .container {
  max-width: 940px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: 1.4rem;
  max-width: 940px;
  margin-inline: auto;
}
.videos-grid.single {
  grid-template-columns: 1fr;
}

.p-foot {
  display: flex;
  justify-content: center;
  padding-bottom: 4rem;
}
.state {
  min-height: 50vh;
  display: grid;
  place-content: center;
  gap: 1rem;
  text-align: center;
  color: var(--text-soft);
}

@media (max-width: 720px) {
  .block.right {
    text-align: left;
  }
}
</style>
