<template>
  <div>
    <div class="panel-head">
      <div>
        <h2 class="adm-section-title">Werkervaring</h2>
        <p class="adm-hint">LinkedIn-stijl lijst: functie, bedrijf en periode.</p>
      </div>
    </div>

    <!-- Nieuw item -->
    <div class="adm-card">
      <h3 class="card-h">Nieuwe ervaring</h3>
      <div class="adm-grid-2">
        <label class="adm-field"><span>Functie *</span><input v-model.trim="draft.role" class="adm-input" placeholder="Bijv. Stagiair marketing" /></label>
        <label class="adm-field"><span>Bedrijf *</span><input v-model.trim="draft.company" class="adm-input" placeholder="Bedrijfsnaam" /></label>
      </div>
      <div class="adm-grid-2">
        <label class="adm-field"><span>Locatie</span><input v-model.trim="draft.location" class="adm-input" placeholder="Stad" /></label>
        <label class="adm-field check">
          <input type="checkbox" v-model="draft.current" />
          <span>Werk ik nu nog</span>
        </label>
      </div>
      <div class="adm-grid-2">
        <label class="adm-field"><span>Van</span><input v-model.trim="draft.start" class="adm-input" placeholder="Bijv. jan 2023" /></label>
        <label class="adm-field"><span>Tot</span><input v-model.trim="draft.end" class="adm-input" placeholder="Bijv. jun 2024" :disabled="draft.current" /></label>
      </div>
      <label class="adm-field"><span>Beschrijving (optioneel)</span><textarea v-model="draft.description" class="adm-textarea" placeholder="Wat deed je daar?"></textarea></label>
      <button class="adm-btn primary" @click="add" :disabled="busy">+ Toevoegen</button>
    </div>

    <p v-if="loading" class="adm-empty">Laden…</p>
    <p v-else-if="!items.length" class="adm-empty">Nog geen werkervaring.</p>

    <div v-for="(it, i) in items" :key="it.id" class="adm-card">
      <div class="item-top">
        <span class="item-tag">{{ it.company || 'Ervaring' }}</span>
        <div class="adm-row">
          <button class="adm-btn icon" :disabled="i === 0" @click="move(i, -1)">↑</button>
          <button class="adm-btn icon" :disabled="i === items.length - 1" @click="move(i, 1)">↓</button>
        </div>
      </div>
      <div class="adm-grid-2">
        <label class="adm-field"><span>Functie</span><input v-model.trim="it.role" class="adm-input" /></label>
        <label class="adm-field"><span>Bedrijf</span><input v-model.trim="it.company" class="adm-input" /></label>
      </div>
      <div class="adm-grid-2">
        <label class="adm-field"><span>Locatie</span><input v-model.trim="it.location" class="adm-input" /></label>
        <label class="adm-field check"><input type="checkbox" v-model="it.current" /><span>Werk ik nu nog</span></label>
      </div>
      <div class="adm-grid-2">
        <label class="adm-field"><span>Van</span><input v-model.trim="it.start" class="adm-input" /></label>
        <label class="adm-field"><span>Tot</span><input v-model.trim="it.end" class="adm-input" :disabled="it.current" /></label>
      </div>
      <label class="adm-field"><span>Beschrijving</span><textarea v-model="it.description" class="adm-textarea"></textarea></label>
      <div class="adm-row">
        <button class="adm-btn primary" @click="save(it)" :disabled="busy">Opslaan</button>
        <button class="adm-btn danger" @click="remove(it)" :disabled="busy">Verwijderen</button>
        <span class="adm-status ok">{{ it._msg }}</span>
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
const blank = () => ({
  role: '',
  company: '',
  location: '',
  start: '',
  end: '',
  current: false,
  description: '',
})
const draft = reactive(blank())

const fetch = async () => {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'experience'), orderBy('order', 'asc')))
    items.value = snap.docs.map((d) => ({ id: d.id, _msg: '', ...d.data() }))
  } finally {
    loading.value = false
  }
}

const fields = (o) => ({
  role: o.role || '',
  company: o.company || '',
  location: o.location || '',
  start: o.start || '',
  end: o.current ? '' : o.end || '',
  current: !!o.current,
  description: o.description || '',
})

const add = async () => {
  if (!draft.role || !draft.company) return alert('Functie en bedrijf zijn verplicht.')
  busy.value = true
  try {
    const maxOrder = items.value.reduce((m, it) => Math.max(m, it.order ?? 0), 0)
    await addDoc(collection(db, 'experience'), { ...fields(draft), order: maxOrder + 1 })
    Object.assign(draft, blank())
    await fetch()
  } finally {
    busy.value = false
  }
}

const save = async (it) => {
  busy.value = true
  it._msg = ''
  try {
    await updateDoc(doc(db, 'experience', it.id), { ...fields(it), order: it.order ?? 0 })
    it._msg = 'Opgeslagen ✓'
    setTimeout(() => (it._msg = ''), 2000)
  } catch (e) {
    it._msg = 'Fout: ' + (e?.message || e)
  } finally {
    busy.value = false
  }
}

const remove = async (it) => {
  if (!confirm(`“${it.role} bij ${it.company}” verwijderen?`)) return
  busy.value = true
  try {
    await deleteDoc(doc(db, 'experience', it.id))
    await fetch()
  } finally {
    busy.value = false
  }
}

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
      updateDoc(doc(db, 'experience', a.id), { order: a.order }),
      updateDoc(doc(db, 'experience', b.id), { order: b.order }),
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
.adm-field.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: end;
  padding-bottom: 0.7rem;
}
.adm-field.check span {
  margin: 0;
}
.adm-field.check input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}
</style>
