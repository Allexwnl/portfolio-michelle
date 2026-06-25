<template>
  <div class="editor">
    <div class="editor-head">
      <h2 class="adm-section-title">{{ isEdit ? 'Project bewerken' : 'Nieuw project' }}</h2>
      <button class="adm-btn" @click="$emit('cancel')">← Terug naar overzicht</button>
    </div>

    <!-- Titel -->
    <div class="adm-card">
      <label class="adm-field">
        <span>Titel *</span>
        <input v-model.trim="title" class="adm-input" placeholder="Naam van het project" />
      </label>
    </div>

    <!-- Hoofdafbeelding (cover) -->
    <div class="adm-card">
      <h3 class="card-h">Hoofdafbeelding</h3>
      <p class="adm-hint">Deze foto wordt op de homepagina getoond.</p>
      <div class="cover-row">
        <img v-if="coverPreview" :src="coverPreview" class="adm-thumb cover-thumb" alt="" />
        <div v-else class="adm-thumb cover-thumb empty">Geen afbeelding</div>
        <div class="cover-actions">
          <label class="adm-file">
            <span>{{ cover ? 'Vervang foto' : 'Kies foto' }}</span>
            <input type="file" accept="image/*" @change="onCover" />
          </label>
          <button v-if="cover" class="adm-btn danger" @click="removeCover">Verwijder</button>
        </div>
      </div>
    </div>

    <!-- Tekstblokken -->
    <div class="adm-card">
      <h3 class="card-h">Tekstblokken</h3>
      <p class="adm-hint">
        1 blok wordt gecentreerd getoond. Bij meerdere blokken wisselt het automatisch
        links / rechts.
      </p>

      <div v-for="(b, i) in textBlocks" :key="i" class="block-edit">
        <div class="block-edit-top">
          <span class="block-num">Blok {{ i + 1 }} · {{ alignHint(i) }}</span>
          <div class="adm-row">
            <button class="adm-btn icon" :disabled="i === 0" @click="moveBlock(i, -1)">↑</button>
            <button
              class="adm-btn icon"
              :disabled="i === textBlocks.length - 1"
              @click="moveBlock(i, 1)"
            >
              ↓
            </button>
            <button
              class="adm-btn icon danger"
              :disabled="textBlocks.length === 1"
              @click="removeBlock(i)"
            >
              ✕
            </button>
          </div>
        </div>
        <input
          v-model.trim="b.heading"
          class="adm-input"
          placeholder="Kopje (optioneel)"
          style="margin-bottom: 0.6rem"
        />
        <textarea v-model="b.body" class="adm-textarea" placeholder="Tekst…"></textarea>
      </div>

      <button class="adm-btn" @click="addBlock">+ Tekstblok toevoegen</button>
    </div>

    <!-- Afbeeldingen (galerij) -->
    <div class="adm-card">
      <h3 class="card-h">Afbeeldingen</h3>
      <p class="adm-hint">Extra foto's bij dit project (carousel op de projectpagina).</p>

      <div v-if="images.length" class="img-grid">
        <div v-for="(img, i) in images" :key="img.thumb || i" class="img-cell">
          <img :src="img.thumb || img.full" class="adm-thumb" alt="" />
          <button class="img-del" @click="removeImage(i)" aria-label="Verwijder">✕</button>
        </div>
      </div>

      <label class="adm-file">
        <span>+ Foto's toevoegen</span>
        <input type="file" accept="image/*" multiple @change="onImages" />
      </label>
    </div>

    <!-- Video's -->
    <div class="adm-card">
      <h3 class="card-h">Video's (YouTube)</h3>
      <p class="adm-hint">Plak een YouTube-link. De video speelt af op de projectpagina.</p>

      <div v-for="(v, i) in videos" :key="i" class="adm-row vid-row">
        <input
          v-model.trim="videos[i]"
          class="adm-input"
          placeholder="https://www.youtube.com/watch?v=…"
        />
        <span class="vid-ok" :class="youtubeId(v) ? 'ok' : 'err'">
          {{ v ? (youtubeId(v) ? '✓' : 'ongeldig') : '' }}
        </span>
        <button class="adm-btn icon danger" @click="videos.splice(i, 1)">✕</button>
      </div>

      <button class="adm-btn" @click="videos.push('')">+ Video toevoegen</button>
    </div>

    <!-- Opslaan -->
    <div class="save-bar">
      <p class="adm-status" :class="statusType">{{ status }}</p>
      <div class="adm-row">
        <button class="adm-btn" @click="$emit('cancel')" :disabled="busy">Annuleren</button>
        <button class="adm-btn primary" @click="save" :disabled="busy">
          {{ busy ? statusBusy : isEdit ? 'Wijzigingen opslaan' : 'Project aanmaken' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { db } from '../../firebase/firebase.js'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { uploadImage, deleteImages } from '../../lib/imageProcessing.js'
import { youtubeId } from '../../lib/youtube.js'

const props = defineProps({ project: { type: Object, default: null } })
const emit = defineEmits(['saved', 'cancel'])

const isEdit = computed(() => !!props.project?.id)

// --- Beginwaarden (kopie van bestaand project of leeg) ---
const title = ref(props.project?.title || '')
const cover = ref(props.project?.cover ? { ...props.project.cover } : null)
const textBlocks = ref(
  props.project?.textBlocks?.length
    ? props.project.textBlocks.map((b) => ({ heading: b.heading || '', body: b.body || '' }))
    : [{ heading: '', body: '' }]
)
const images = ref(props.project?.images ? props.project.images.map((i) => ({ ...i })) : [])
const videos = ref(props.project?.videos ? [...props.project.videos] : [])

// Nieuw gekozen bestanden (nog niet geüpload) en te verwijderen URL's.
const coverFile = ref(null)
const coverLocalPreview = ref('')
const newImageFiles = ref([])
const removedUrls = ref([])

const busy = ref(false)
const status = ref('')
const statusBusy = ref('Bezig…')
const statusType = ref('')

const coverPreview = computed(
  () => coverLocalPreview.value || cover.value?.thumb || cover.value?.full || ''
)

const alignHint = (i) => {
  if (textBlocks.value.length === 1) return 'gecentreerd'
  return i % 2 === 0 ? 'links' : 'rechts'
}

// --- Cover ---
const onCover = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  // Oude cover-URL's later opruimen.
  if (cover.value) removedUrls.value.push(cover.value.full, cover.value.thumb)
  coverFile.value = file
  coverLocalPreview.value = URL.createObjectURL(file)
  cover.value = cover.value || {} // markeer dat er een cover is
  e.target.value = ''
}
const removeCover = () => {
  if (cover.value?.full || cover.value?.thumb) {
    removedUrls.value.push(cover.value.full, cover.value.thumb)
  }
  cover.value = null
  coverFile.value = null
  coverLocalPreview.value = ''
}

// --- Tekstblokken ---
const addBlock = () => textBlocks.value.push({ heading: '', body: '' })
const removeBlock = (i) => textBlocks.value.length > 1 && textBlocks.value.splice(i, 1)
const moveBlock = (i, dir) => {
  const j = i + dir
  if (j < 0 || j >= textBlocks.value.length) return
  const arr = textBlocks.value
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

// --- Afbeeldingen ---
const onImages = (e) => {
  const files = Array.from(e.target.files || [])
  newImageFiles.value.push(...files)
  // Toon meteen lokale previews (worden bij opslaan vervangen door CDN-URL's).
  for (const f of files) images.value.push({ thumb: URL.createObjectURL(f), _file: f })
  e.target.value = ''
}
const removeImage = (i) => {
  const img = images.value[i]
  if (img?._file) {
    newImageFiles.value = newImageFiles.value.filter((f) => f !== img._file)
  } else if (img) {
    removedUrls.value.push(img.full, img.thumb)
  }
  images.value.splice(i, 1)
}

// --- Opslaan ---
const save = async () => {
  if (!title.value) {
    status.value = 'Titel is verplicht.'
    statusType.value = 'err'
    return
  }
  busy.value = true
  status.value = ''
  statusType.value = ''
  try {
    // 1. Cover uploaden indien nieuw gekozen.
    let coverData = cover.value && (cover.value.full || cover.value.thumb) ? cover.value : null
    if (coverFile.value) {
      statusBusy.value = 'Hoofdafbeelding uploaden…'
      coverData = await uploadImage(coverFile.value)
    }

    // 2. Nieuwe galerij-foto's uploaden; bestaande behouden.
    const finalImages = []
    let counter = 0
    for (const img of images.value) {
      if (img._file) {
        counter++
        statusBusy.value = `Foto ${counter} uploaden…`
        finalImages.push(await uploadImage(img._file))
      } else {
        finalImages.push({ full: img.full, thumb: img.thumb })
      }
    }

    // 3. Tekstblokken en video's opschonen.
    const cleanBlocks = textBlocks.value
      .map((b) => ({ heading: (b.heading || '').trim(), body: (b.body || '').trim() }))
      .filter((b) => b.heading || b.body)
    const cleanVideos = videos.value.map((v) => v.trim()).filter((v) => youtubeId(v))

    const payload = {
      title: title.value,
      cover: coverData || null,
      textBlocks: cleanBlocks.length ? cleanBlocks : [{ heading: '', body: '' }],
      images: finalImages,
      videos: cleanVideos,
    }

    statusBusy.value = 'Opslaan…'
    if (isEdit.value) {
      await updateDoc(doc(db, 'projects', props.project.id), payload)
    } else {
      await addDoc(collection(db, 'projects'), { ...payload, createdAt: serverTimestamp() })
    }

    // 4. Verwijderde foto's uit GitHub opruimen.
    await deleteImages(removedUrls.value)

    emit('saved')
  } catch (e) {
    status.value = 'Fout bij opslaan: ' + (e?.message || e)
    statusType.value = 'err'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
}
.card-h {
  font-size: 1.15rem;
  margin-bottom: 0.2rem;
}

.cover-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.2rem;
  align-items: start;
}
.cover-thumb {
  width: 200px;
}
.cover-thumb.empty {
  display: grid;
  place-items: center;
  color: var(--text-faint);
  font-size: 0.85rem;
}
.cover-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: flex-start;
}

.block-edit {
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--bg);
}
.block-edit-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 0.7rem;
}
.block-num {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent);
}

.img-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.7rem;
  margin-bottom: 1rem;
}
.img-cell {
  position: relative;
}
.img-del {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.8rem;
  display: grid;
  place-items: center;
}
.img-del:hover {
  background: #c0392b;
}

.vid-row {
  flex-wrap: nowrap;
  margin-bottom: 0.6rem;
}
.vid-row .adm-input {
  flex: 1;
}
.vid-ok {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 3.5rem;
  text-align: center;
}
.vid-ok.ok {
  color: #2e7d32;
}
.vid-ok.err {
  color: #c0392b;
}

.save-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 0.9rem 1.1rem;
  margin-top: 1.2rem;
}

@media (max-width: 620px) {
  .cover-row {
    grid-template-columns: 1fr;
  }
  .cover-thumb {
    width: 100%;
  }
}
</style>
