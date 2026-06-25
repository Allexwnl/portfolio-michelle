<template>
  <section id="ervaring" class="section experience-section">
    <div class="container">
      <header class="head" v-reveal>
        <p class="eyebrow">Werkervaring</p>
        <h2 class="section-title">Waar ik heb gewerkt</h2>
        <p class="lead">Mijn banen en stages — net als op LinkedIn, maar dan hier.</p>
      </header>

      <div v-if="items.length" class="xp-list">
        <article v-for="item in items" :key="item.id" class="xp" v-reveal>
          <div class="xp-rail" aria-hidden="true"><span class="xp-dot"></span></div>
          <div class="xp-body">
            <div class="xp-top">
              <h3 class="xp-role">{{ item.role }}</h3>
              <span class="xp-period">{{ periodText(item) }}</span>
            </div>
            <p class="xp-company">
              <strong>{{ item.company }}</strong>
              <span v-if="item.location"> · {{ item.location }}</span>
            </p>
            <p v-if="item.description" class="xp-desc">{{ item.description }}</p>
          </div>
        </article>
      </div>

      <p v-else class="empty">Nog geen werkervaring toegevoegd.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/firebase.js'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const items = ref([])

const periodText = (item) => {
  const end = item.current ? 'heden' : item.end || ''
  return [item.start, end].filter(Boolean).join(' — ')
}

onMounted(async () => {
  const q = query(collection(db, 'experience'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  items.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
})
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

.xp-list {
  max-width: 760px;
  margin-inline: auto;
}
.xp {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 1rem;
}
.xp-rail {
  position: relative;
  display: flex;
  justify-content: center;
}
.xp-rail::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--line);
}
.xp:last-child .xp-rail::before {
  bottom: auto;
  height: 26px;
}
.xp-dot {
  position: relative;
  margin-top: 8px;
  width: 13px;
  height: 13px;
  border-radius: 999px;
  background: var(--accent);
  border: 3px solid var(--bg);
  box-shadow: 0 0 0 2px var(--line);
}
.xp-body {
  padding-bottom: 2.2rem;
}
.xp-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.xp-role {
  font-size: 1.25rem;
}
.xp-period {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-faint);
  white-space: nowrap;
}
.xp-company {
  color: var(--text-soft);
  margin-top: 0.1rem;
}
.xp-company strong {
  color: var(--text);
}
.xp-desc {
  margin-top: 0.6rem;
  color: var(--text-soft);
}
</style>
