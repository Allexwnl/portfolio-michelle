<template>
  <div>
    <div class="panel-head">
      <h2 class="adm-section-title">Indeling</h2>
      <p class="adm-hint">Bepaal de volgorde, zichtbaarheid en kleur van je homepagina.</p>
    </div>

    <!-- Accentkleur -->
    <div class="adm-card">
      <h3 class="card-h">Accentkleur</h3>
      <p class="adm-hint">De kleur van knoppen, accenten en details door de hele site.</p>
      <div class="color-row">
        <input type="color" v-model="accent" class="color-input" @input="previewAccent" />
        <input v-model.trim="accent" class="adm-input hex" @input="previewAccent" />
        <div class="swatches">
          <button
            v-for="c in presets"
            :key="c"
            class="swatch"
            :style="{ background: c }"
            :class="{ active: c.toLowerCase() === accent.toLowerCase() }"
            @click="pickPreset(c)"
            :aria-label="c"
          ></button>
        </div>
      </div>
    </div>

    <!-- Volgorde + zichtbaarheid -->
    <div class="adm-card">
      <h3 class="card-h">Secties</h3>
      <p class="adm-hint">Sleep met de pijltjes om de volgorde te wijzigen, of zet secties uit.</p>

      <div v-for="(key, i) in order" :key="key" class="sec-row">
        <div class="sec-left">
          <div class="sec-arrows">
            <button class="adm-btn icon" :disabled="i === 0" @click="move(i, -1)">↑</button>
            <button class="adm-btn icon" :disabled="i === order.length - 1" @click="move(i, 1)">↓</button>
          </div>
          <span class="sec-name">{{ labelOf(key) }}</span>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="visibility[key]" />
          <span class="track"><span class="knob"></span></span>
          <span class="switch-label">{{ visibility[key] ? 'Zichtbaar' : 'Verborgen' }}</span>
        </label>
      </div>
    </div>

    <div class="save-bar">
      <span class="adm-status" :class="statusType">{{ status }}</span>
      <button class="adm-btn primary" @click="save" :disabled="busy">
        {{ busy ? 'Opslaan…' : 'Opslaan' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  useSettings,
  SECTIONS,
  DEFAULT_SETTINGS,
  applyAccent,
} from '../../lib/useSettings.js'

const { state, loadSettings, saveSettings } = useSettings()

const presets = ['#c2766a', '#b5838d', '#7c6a9c', '#5b8266', '#4a6fa5', '#1c1a18']
const accent = ref(DEFAULT_SETTINGS.accent)
const order = ref([...DEFAULT_SETTINGS.sectionOrder])
const visibility = reactive({ ...DEFAULT_SETTINGS.sectionVisibility })

const busy = ref(false)
const status = ref('')
const statusType = ref('')

const labelOf = (key) => SECTIONS.find((s) => s.key === key)?.label || key

const move = (i, dir) => {
  const j = i + dir
  if (j < 0 || j >= order.value.length) return
  const arr = order.value
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

const previewAccent = () => applyAccent(accent.value)
const pickPreset = (c) => {
  accent.value = c
  applyAccent(c)
}

const save = async () => {
  busy.value = true
  status.value = ''
  try {
    await saveSettings({
      ...state.settings,
      accent: accent.value,
      sectionOrder: [...order.value],
      sectionVisibility: { ...visibility },
    })
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
  accent.value = state.settings.accent
  order.value = [...state.settings.sectionOrder]
  Object.assign(visibility, state.settings.sectionVisibility)
})
</script>

<style scoped>
.panel-head {
  margin-bottom: 1.4rem;
}
.card-h {
  font-size: 1.15rem;
  margin-bottom: 0.4rem;
}
.color-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
}
.color-input {
  width: 54px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: none;
  padding: 4px;
  cursor: pointer;
}
.hex {
  width: 130px;
  text-transform: uppercase;
}
.swatches {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.swatch {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 1px var(--line);
  transition: transform var(--t-fast);
}
.swatch:hover {
  transform: scale(1.12);
}
.swatch.active {
  box-shadow: 0 0 0 2px var(--text);
}

.sec-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem 1rem;
  flex-wrap: wrap;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--line);
}
.sec-row:last-child {
  border-bottom: 0;
}
.sec-left {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex: 1 1 auto;
  min-width: 0;
}
.sec-arrows {
  display: flex;
  gap: 0.3rem;
  flex: 0 0 auto;
}
.sec-name {
  font-weight: 600;
  min-width: 0;
  overflow-wrap: anywhere;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  flex: 0 0 auto;
}
.switch input {
  display: none;
}
.track {
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: var(--line);
  position: relative;
  transition: background var(--t-fast);
}
.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #fff;
  box-shadow: var(--shadow-sm);
  transition: transform var(--t-fast) var(--ease);
}
.switch input:checked + .track {
  background: var(--accent);
}
.switch input:checked + .track .knob {
  transform: translateX(18px);
}
.switch-label {
  font-size: 0.85rem;
  color: var(--text-soft);
  min-width: 5rem;
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
