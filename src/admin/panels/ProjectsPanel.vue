<template>
  <div>
    <!-- Editor -->
    <ProjectEditor
      v-if="mode !== 'list'"
      :key="editing?.id || 'new'"
      :project="editing"
      @cancel="backToList"
      @saved="onSaved"
    />

    <!-- Overzicht -->
    <template v-else>
      <div class="panel-head">
        <div>
          <h2 class="adm-section-title">Projecten</h2>
          <p class="adm-hint">Maak projecten aan, bewerk of verwijder ze.</p>
        </div>
        <button class="adm-btn primary" @click="newProject">+ Nieuw project</button>
      </div>

      <p v-if="loading" class="adm-empty">Laden…</p>
      <p v-else-if="!projects.length" class="adm-empty">
        Nog geen projecten. Klik op “Nieuw project” om te beginnen.
      </p>

      <div v-else class="proj-grid">
        <div v-for="p in projects" :key="p.id" class="adm-card proj">
          <img
            v-if="p.cover?.thumb || p.cover?.full"
            :src="p.cover.thumb || p.cover.full"
            class="adm-thumb"
            alt=""
          />
          <div v-else class="adm-thumb empty">Geen afbeelding</div>

          <h3 class="proj-title">{{ p.title }}</h3>
          <p class="proj-meta">
            {{ (p.images?.length || 0) }} foto's · {{ (p.videos?.length || 0) }} video's
          </p>

          <div class="adm-row">
            <button class="adm-btn" @click="editProject(p)">Bewerken</button>
            <button class="adm-btn danger" @click="remove(p)" :disabled="deletingId === p.id">
              {{ deletingId === p.id ? 'Verwijderen…' : 'Verwijderen' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase/firebase.js'
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { deleteImages } from '../../lib/imageProcessing.js'
import ProjectEditor from './ProjectEditor.vue'

const projects = ref([])
const loading = ref(true)
const mode = ref('list') // 'list' | 'new' | 'edit'
const editing = ref(null)
const deletingId = ref('')

const fetch = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    projects.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } finally {
    loading.value = false
  }
}

const newProject = () => {
  editing.value = null
  mode.value = 'new'
}
const editProject = (p) => {
  editing.value = p
  mode.value = 'edit'
}
const backToList = () => {
  mode.value = 'list'
  editing.value = null
}
const onSaved = async () => {
  backToList()
  await fetch()
}

const remove = async (p) => {
  if (!confirm(`Project “${p.title}” verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return
  deletingId.value = p.id
  try {
    const urls = [
      p.cover?.full,
      p.cover?.thumb,
      ...(p.images || []).flatMap((i) => [i.full, i.thumb]),
    ]
    await deleteImages(urls)
    await deleteDoc(doc(db, 'projects', p.id))
    await fetch()
  } catch (e) {
    alert('Fout bij verwijderen: ' + (e?.message || e))
  } finally {
    deletingId.value = ''
  }
}

onMounted(fetch)
</script>

<style scoped>
.panel-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
  flex-wrap: wrap;
}
.proj-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 1.1rem;
}
.proj-title {
  font-size: 1.15rem;
  margin: 0.8rem 0 0.2rem;
}
.proj-meta {
  font-size: 0.85rem;
  color: var(--text-faint);
  margin-bottom: 0.9rem;
}
.adm-thumb.empty {
  display: grid;
  place-items: center;
  color: var(--text-faint);
  font-size: 0.85rem;
}
</style>
