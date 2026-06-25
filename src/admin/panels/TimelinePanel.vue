<template>
  <div>
    <div class="panel-head">
      <div>
        <h2 class="adm-section-title">Tijdlijn</h2>
        <p class="adm-hint">Stages, werk en opleidingen — in volgorde op de homepagina.</p>
      </div>
    </div>

    <!-- Nieuw item -->
    <div class="adm-card">
      <h3 class="card-h">Nieuw item</h3>
      <div class="adm-grid-2">
        <label class="adm-field">
          <span>Titel *</span>
          <input v-model.trim="draft.label" class="adm-input" placeholder="Bijv. Stage bij …" />
        </label>
        <label class="adm-field">
          <span>Periode</span>
          <input v-model.trim="draft.period" class="adm-input" placeholder="Bijv. 2023 – 2024" />
        </label>
      </div>
      <label class="adm-field">
        <span>Type</span>
        <select v-model="draft.type" class="adm-select">
          <option value="stage">Stage</option>
          <option value="werk">Werk</option>
          <option value="opleiding">Opleiding</option>
          <option value="anders">Overig</option>
        </select>
      </label>
      <label class="adm-field">
        <span>Toelichting (optioneel)</span>
        <textarea v-model="draft.note" class="adm-textarea" placeholder="Korte beschrijving…"></textarea>
      </label>
      <button class="adm-btn primary" @click="add" :disabled="busy">+ Toevoegen</button>
    </div>

    <!-- Bestaande items -->
    <p v-if="loading" class="adm-empty">Laden…</p>
    <p v-else-if="!items.length" class="adm-empty">Nog geen tijdlijn-items.</p>

    <div v-for="(it, i) in items" :key="it.id" class="adm-card item">
      <div class="item-top">
        <span class="item-tag">{{ typeLabel(it.type) }}</span>
        <div class="adm-row">
          <button class="adm-btn icon" :disabled="i === 0" @click="move(i, -1)">↑</button>
          <button class="adm-btn icon" :disabled="i === items.length - 1" @click="move(i, 1)">↓</button>
        </div>
      </div>
      <div class="adm-grid-2">
        <label class="adm-field"><span>Titel</span><input v-model.trim="it.label" class="adm-input" /></label>
        <label class="adm-field"><span>Periode</span><input v-model.trim="it.period" class="adm-input" /></label>
      </div>
      <label class="adm-field">
        <span>Type</span>
        <select v-model="it.type" class="adm-select">
          <option value="stage">Stage</option>
          <option value="werk">Werk</option>
          <option value="opleiding">Opleiding</option>
          <option value="anders">Overig</option>
        </select>
      </label>
      <label class="adm-field"><span>Toelichting</span><textarea v-model="it.note" class="adm-textarea"></textarea></label>
      <div class="adm-row">
        <button class="adm-btn primary" @click="save(it)" :disabled="busy">Opslaan</button>
        <button class="adm-btn danger" @click="remove(it)" :disabled="busy">Verwijderen</button>
        <span class="adm-status" :class="it._status === 'ok' ? 'ok' : ''">{{ it._msg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { db } from '../../firebase/firebase.js'
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'

const items = ref([])
const loading = ref(true)
const busy = ref(false)
const draft = reactive({ label: '', period: '', type: 'stage', note: '' })

const LABELS = { stage: 'Stage', werk: 'Werk', opleiding: 'Opleiding', anders: 'Overig' }
const typeLabel = (t) => LABELS[t] || 'Overig'

const fetch = async () => {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'timeline'), orderBy('order', 'asc')))
    items.value = snap.docs.map((d) => ({ id: d.id, _msg: '', _status: '', ...d.data() }))
  } finally {
    loading.value = false
  }
}

const add = async () => {
  if (!draft.label) return alert('Titel is verplicht.')
  busy.value = true
  try {
    const maxOrder = items.value.reduce((m, it) => Math.max(m, it.order ?? 0), 0)
    await addDoc(collection(db, 'timeline'), {
      label: draft.label,
      period: draft.period,
      type: draft.type,
      note: draft.note,
      order: maxOrder + 1,
    })
    Object.assign(draft, { label: '', period: '', type: 'stage', note: '' })
    await fetch()
  } finally {
    busy.value = false
  }
}

const save = async (it) => {
  busy.value = true
  it._msg = ''
  try {
    await updateDoc(doc(db, 'timeline', it.id), {
      label: it.label,
      period: it.period,
      type: it.type,
      note: it.note,
      order: it.order ?? 0,
    })
    it._status = 'ok'
    it._msg = 'Opgeslagen ✓'
    setTimeout(() => (it._msg = ''), 2000)
  } catch (e) {
    it._status = 'err'
    it._msg = 'Fout: ' + (e?.message || e)
  } finally {
    busy.value = false
  }
}

const remove = async (it) => {
  if (!confirm(`“${it.label}” verwijderen?`)) return
  busy.value = true
  try {
    await deleteDoc(doc(db, 'timeline', it.id))
    await fetch()
  } finally {
    busy.value = false
  }
}

// Wissel met buur en bewaar de nieuwe order-waarden.
const move = async (i, dir) => {
  const j = i + dir
  if (j < 0 || j >= items.value.length) return
  busy.value = true
  try {
    const a = items.value[i]
    const b = items.value[j]
    const ao = a.order ?? i
    const bo = b.order ?? j
    a.order = bo
    b.order = ao
    await Promise.all([
      updateDoc(doc(db, 'timeline', a.id), { order: a.order }),
      updateDoc(doc(db, 'timeline', b.id), { order: b.order }),
    ])
    items.value.sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
  } finally {
    busy.value = false
  }
}

onMounted(fetch)
</script>

<style scoped>
.panel-head {
  margin-bottom: 1.4rem;
}
.card-h {
  font-size: 1.15rem;
  margin-bottom: 0.8rem;
}
.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}
.item-tag {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--accent);
}
</style>
