<template>
  <div>
    <div class="panel-head">
      <h2 class="adm-section-title">Homepagina</h2>
      <p class="adm-hint">Pas je naam, introtekst en profielfoto aan.</p>
    </div>

    <div class="adm-card">
      <h3 class="card-h">Profielfoto</h3>
      <div class="photo-row">
        <img v-if="photoPreview" :src="photoPreview" class="photo-prev" alt="" />
        <div v-else class="photo-prev empty">Geen foto</div>
        <div class="photo-actions">
          <label class="adm-file">
            <span>{{ hasPhoto ? 'Vervang foto' : 'Kies foto' }}</span>
            <input type="file" accept="image/*" @change="onPhoto" />
          </label>
          <button v-if="hasPhoto" class="adm-btn danger" @click="removePhoto">Verwijder</button>
        </div>
      </div>
    </div>

    <div class="adm-card">
      <h3 class="card-h">Teksten</h3>
      <label class="adm-field">
        <span>Klein label boven je naam</span>
        <input v-model.trim="form.eyebrow" class="adm-input" placeholder="Bijv. Portfolio" />
      </label>
      <label class="adm-field">
        <span>Naam</span>
        <input v-model.trim="form.name" class="adm-input" placeholder="Je naam" />
      </label>
      <label class="adm-field">
        <span>Introtekst</span>
        <textarea v-model="form.intro" class="adm-textarea" placeholder="Een korte intro over jezelf…"></textarea>
      </label>
    </div>

    <div class="save-bar">
      <span class="adm-status" :class="statusType">{{ status }}</span>
      <button class="adm-btn primary" @click="save" :disabled="busy">
        {{ busy ? busyText : 'Opslaan' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSettings } from '../../lib/useSettings.js'
import { uploadImage, deleteImages } from '../../lib/imageProcessing.js'

const { state, loadSettings, saveSettings } = useSettings()

const form = reactive({ eyebrow: '', name: '', intro: '' })
const photo = ref({ full: '', thumb: '' })
const photoFile = ref(null)
const localPreview = ref('')
const removedUrls = ref([])

const busy = ref(false)
const busyText = ref('Bezig…')
const status = ref('')
const statusType = ref('')

const hasPhoto = computed(() => !!(localPreview.value || photo.value.full || photo.value.thumb))
const photoPreview = computed(() => localPreview.value || photo.value.full || photo.value.thumb || '')

const onPhoto = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (photo.value.full || photo.value.thumb) removedUrls.value.push(photo.value.full, photo.value.thumb)
  photoFile.value = file
  localPreview.value = URL.createObjectURL(file)
  e.target.value = ''
}
const removePhoto = () => {
  if (photo.value.full || photo.value.thumb) removedUrls.value.push(photo.value.full, photo.value.thumb)
  photo.value = { full: '', thumb: '' }
  photoFile.value = null
  localPreview.value = ''
}

const save = async () => {
  busy.value = true
  status.value = ''
  statusType.value = ''
  try {
    let profilePhoto = { ...photo.value }
    if (photoFile.value) {
      busyText.value = 'Foto uploaden…'
      profilePhoto = await uploadImage(photoFile.value)
    }
    busyText.value = 'Opslaan…'
    await saveSettings({
      ...state.settings,
      eyebrow: form.eyebrow,
      name: form.name,
      intro: form.intro,
      profilePhoto,
    })
    photo.value = profilePhoto
    photoFile.value = null
    localPreview.value = ''
    await deleteImages(removedUrls.value)
    removedUrls.value = []
    status.value = 'Opgeslagen ✓'
    statusType.value = 'ok'
    setTimeout(() => (status.value = ''), 2500)
  } catch (e) {
    status.value = 'Fout: ' + (e?.message || e)
    statusType.value = 'err'
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  await loadSettings(true)
  form.eyebrow = state.settings.eyebrow
  form.name = state.settings.name
  form.intro = state.settings.intro
  photo.value = { ...state.settings.profilePhoto }
})
</script>

<style scoped>
.panel-head {
  margin-bottom: 1.4rem;
}
.card-h {
  font-size: 1.15rem;
  margin-bottom: 0.8rem;
}
.photo-row {
  display: flex;
  gap: 1.4rem;
  align-items: center;
  flex-wrap: wrap;
}
.photo-prev {
  width: 130px;
  height: 160px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface-2);
}
.photo-prev.empty {
  display: grid;
  place-items: center;
  color: var(--text-faint);
  font-size: 0.85rem;
}
.photo-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: flex-start;
}
.save-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 0.9rem 1.1rem;
  margin-top: 1.2rem;
}
</style>
