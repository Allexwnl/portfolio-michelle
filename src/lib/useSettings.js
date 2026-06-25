// Eén gedeelde bron voor de site-instellingen (hero-tekst, profielfoto, accentkleur,
// volgorde + zichtbaarheid van de homepagina-secties). Wordt gelezen door de
// homepagina en bewerkt in het dashboard.

import { reactive, readonly } from 'vue'
import { db } from '../firebase/firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const SECTIONS = [
  { key: 'timeline', label: 'Tijdlijn' },
  { key: 'experience', label: 'Werkervaring' },
  { key: 'projects', label: 'Projecten' },
]

export const DEFAULT_SETTINGS = {
  eyebrow: 'Portfolio',
  name: 'Michelle Jonk',
  intro:
    'Welkom op mijn portfolio. Hier vind je mijn projecten, ervaring en de dingen waar ik trots op ben.',
  profilePhoto: { full: '', thumb: '' },
  accent: '#c2766a',
  sectionOrder: ['timeline', 'experience', 'projects'],
  sectionVisibility: { timeline: true, experience: true, projects: true },
}

const SETTINGS_DOC = doc(db, 'siteSettings', 'home')

const state = reactive({
  settings: { ...DEFAULT_SETTINGS },
  loaded: false,
})

// Vult ontbrekende velden aan met defaults (zo blijft alles werken na uitbreidingen).
function merge(data) {
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    profilePhoto: { ...DEFAULT_SETTINGS.profilePhoto, ...(data?.profilePhoto || {}) },
    sectionVisibility: {
      ...DEFAULT_SETTINGS.sectionVisibility,
      ...(data?.sectionVisibility || {}),
    },
    sectionOrder:
      Array.isArray(data?.sectionOrder) && data.sectionOrder.length
        ? data.sectionOrder
        : DEFAULT_SETTINGS.sectionOrder,
  }
}

export function applyAccent(color) {
  if (typeof document !== 'undefined' && color) {
    document.documentElement.style.setProperty('--accent', color)
  }
}

export async function loadSettings(force = false) {
  if (state.loaded && !force) return state.settings
  try {
    const snap = await getDoc(SETTINGS_DOC)
    state.settings = snap.exists() ? merge(snap.data()) : { ...DEFAULT_SETTINGS }
  } catch {
    state.settings = { ...DEFAULT_SETTINGS }
  }
  state.loaded = true
  applyAccent(state.settings.accent)
  return state.settings
}

export async function saveSettings(next) {
  const clean = merge(next)
  await setDoc(SETTINGS_DOC, clean, { merge: true })
  state.settings = clean
  state.loaded = true
  applyAccent(clean.accent)
  return clean
}

export function useSettings() {
  return { state: readonly(state), loadSettings, saveSettings }
}
