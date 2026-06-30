<template>
  <section id="projecten" class="section projects-section">
    <div class="container">
      <header class="head" v-reveal>
        <p class="eyebrow">Selectie</p>
        <h2 class="section-title">Projecten</h2>
        <p class="lead">Een greep uit het werk waar ik trots op ben. Klik voor het hele verhaal.</p>
      </header>

      <div v-if="projects.length" class="gallery">
        <article
          v-for="(p, i) in projects"
          :key="p.id"
          class="card"
          v-reveal="(i % 3) * 90"
          @click="open(p.id)"
        >
          <div class="card-media">
            <img v-if="coverSrc(p)" :src="coverSrc(p)" :alt="p.title" loading="lazy" />
            <div v-else class="no-cover" aria-hidden="true">Geen afbeelding</div>
          </div>
          <div class="card-cap">
            <h3 class="card-title">{{ p.title }}</h3>
            <span class="card-go" aria-hidden="true">→</span>
          </div>
        </article>
      </div>

      <p v-else-if="!loading" class="empty">Nog geen projecten toegevoegd.</p>

      <div v-if="hasMore" class="more-wrap">
        <button class="btn btn-ghost" @click="loadPage" :disabled="loading">
          {{ loading ? 'Laden…' : 'Meer laden' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase/firebase.js'
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore'
import { cdnUrl } from '../lib/imageProcessing.js'

const router = useRouter()
const open = (id) => router.push(`/project/${id}`)

// Cover kan een object {full, thumb} zijn (of leeg).
const coverSrc = (p) => cdnUrl(p.cover?.thumb || p.cover?.full || '')

const PAGE_SIZE = 9
const projects = ref([])
const hasMore = ref(false)
const loading = ref(false)
let lastDoc = null

const loadPage = async () => {
  loading.value = true
  try {
    const base = [collection(db, 'projects'), orderBy('createdAt', 'desc')]
    const q = lastDoc
      ? query(...base, startAfter(lastDoc), limit(PAGE_SIZE))
      : query(...base, limit(PAGE_SIZE))
    const snap = await getDocs(q)
    snap.docs.forEach((d) => {
      const data = d.data()
      projects.value.push({ id: d.id, title: data.title, cover: data.cover })
    })
    if (snap.docs.length) lastDoc = snap.docs[snap.docs.length - 1]
    hasMore.value = snap.docs.length === PAGE_SIZE
  } finally {
    loading.value = false
  }
}

onMounted(loadPage)
</script>

<style scoped>
.head {
  text-align: center;
  margin-bottom: clamp(2.5rem, 6vw, 4rem);
}
.head .lead {
  margin-inline: auto;
}
.empty {
  text-align: center;
  color: var(--text-faint);
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: clamp(1rem, 2.4vw, 1.8rem);
}
.card {
  cursor: pointer;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  transition: transform var(--t-fast) var(--ease), box-shadow var(--t-fast);
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-md);
}
.card-media {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--surface-2);
}
.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}
.card:hover .card-media img {
  transform: scale(1.06);
}
.no-cover {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--text-faint);
  font-size: 0.9rem;
}
.card-cap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem 1.2rem;
}
.card-title {
  font-size: 1.2rem;
}
.card-go {
  color: var(--accent);
  font-size: 1.2rem;
  transition: transform var(--t-fast) var(--ease);
}
.card:hover .card-go {
  transform: translateX(4px);
}
.more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}
</style>
