<template>
  <section id="tijdlijn" class="section timeline-section">
    <div class="container">
      <header class="head" v-reveal>
        <p class="eyebrow">Mijn pad</p>
        <h2 class="section-title">Tijdlijn</h2>
        <p class="lead">Een overzicht van mijn stages, werk en opleidingen door de jaren heen.</p>
      </header>

      <div v-if="items.length" class="timeline">
        <div class="line" aria-hidden="true"></div>
        <div
          v-for="(item, i) in items"
          :key="item.id"
          class="t-item"
          :class="i % 2 === 0 ? 'left' : 'right'"
          v-reveal
        >
          <div class="t-dot" :style="dotStyle(item.type)" aria-hidden="true"></div>
          <div class="t-card">
            <span class="t-period">{{ item.period }}</span>
            <h3 class="t-label">{{ item.label }}</h3>
            <span v-if="item.type" class="t-type" :style="typeStyle(item.type)">{{
              typeLabel(item.type)
            }}</span>
            <p v-if="item.note" class="t-note">{{ item.note }}</p>
          </div>
        </div>
      </div>

      <p v-else class="empty">Nog geen tijdlijn-items toegevoegd.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/firebase.js'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const items = ref([])

const TYPE_COLORS = {
  stage: '#6c93c9',
  werk: 'var(--accent)',
  opleiding: '#7b8b6a',
  anders: '#9b938a',
}
const TYPE_LABELS = { stage: 'Stage', werk: 'Werk', opleiding: 'Opleiding', anders: 'Overig' }

const typeLabel = (t) => TYPE_LABELS[t] || t
const color = (t) => TYPE_COLORS[t] || 'var(--accent)'
const dotStyle = (t) => ({ background: color(t) })
const typeStyle = (t) => ({
  color: color(t),
  background: `color-mix(in srgb, ${color(t)} 14%, transparent)`,
})

onMounted(async () => {
  const q = query(collection(db, 'timeline'), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  items.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
})
</script>

<style scoped>
.timeline-section {
  background: var(--surface);
  border-block: 1px solid var(--line);
}
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

.timeline {
  position: relative;
  max-width: 920px;
  margin-inline: auto;
}
.line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(var(--line), var(--line));
}

.t-item {
  position: relative;
  width: 50%;
  padding: 0.6rem 2.4rem 1.6rem;
}
.t-item.left {
  left: 0;
  text-align: right;
}
.t-item.right {
  left: 50%;
}
.t-dot {
  position: absolute;
  top: 1.4rem;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 3px solid var(--surface);
  box-shadow: 0 0 0 2px var(--line);
}
.t-item.left .t-dot {
  right: -8px;
}
.t-item.right .t-dot {
  left: -8px;
}

.t-card {
  display: inline-block;
  text-align: left;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 1.1rem 1.3rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--t-fast) var(--ease), box-shadow var(--t-fast);
}
.t-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.t-period {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.t-label {
  font-size: 1.2rem;
  margin: 0.15rem 0 0.4rem;
}
.t-type {
  display: inline-block;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
}
.t-note {
  margin-top: 0.6rem;
  color: var(--text-soft);
  font-size: 0.95rem;
}

@media (max-width: 720px) {
  .line {
    left: 9px;
  }
  .t-item,
  .t-item.left,
  .t-item.right {
    width: 100%;
    left: 0;
    text-align: left;
    padding: 0.4rem 0 1.4rem 2.2rem;
  }
  .t-item.left .t-dot,
  .t-item.right .t-dot {
    left: 1px;
    right: auto;
  }
}
</style>
