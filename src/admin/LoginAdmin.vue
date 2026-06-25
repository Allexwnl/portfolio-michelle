<template>
  <div class="login-wrap">
    <RouterLink to="/" class="back">← Naar de website</RouterLink>

    <div class="login-card">
      <h1 class="login-title">Beheer</h1>
      <p class="login-sub">Log in om je portfolio te beheren.</p>

      <form @submit.prevent="submit">
        <label class="field">
          <span>E-mailadres</span>
          <input v-model.trim="email" type="email" autocomplete="username" required />
        </label>
        <label class="field">
          <span>Wachtwoord</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn btn-primary full" type="submit" :disabled="busy">
          {{ busy ? 'Bezig…' : 'Inloggen' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { auth } from '../firebase/firebase.js'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { ALLOWED_EMAILS } from '../config.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

const isAllowed = (user) => user && ALLOWED_EMAILS.includes(user.email)

const submit = async () => {
  error.value = ''
  busy.value = true
  try {
    await setPersistence(auth, browserLocalPersistence)
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value)
    if (!isAllowed(cred.user)) {
      await auth.signOut()
      error.value = 'Dit account heeft geen toegang tot het dashboard.'
      return
    }
    router.push('/dashboard')
  } catch (e) {
    error.value = friendly(e?.code)
  } finally {
    busy.value = false
  }
}

const friendly = (code) => {
  const map = {
    'auth/invalid-email': 'Ongeldig e-mailadres.',
    'auth/invalid-credential': 'E-mail of wachtwoord klopt niet.',
    'auth/wrong-password': 'E-mail of wachtwoord klopt niet.',
    'auth/user-not-found': 'E-mail of wachtwoord klopt niet.',
    'auth/too-many-requests': 'Te veel pogingen. Probeer het later opnieuw.',
  }
  return map[code] || 'Inloggen mislukt. Probeer het opnieuw.'
}

// Al ingelogd? Meteen door.
onMounted(() => {
  const stop = onAuthStateChanged(auth, (user) => {
    stop()
    if (isAllowed(user)) router.push('/dashboard')
  })
})
</script>

<style scoped>
.login-wrap {
  min-height: 100svh;
  display: grid;
  place-content: center;
  gap: 1.4rem;
  padding: 2rem var(--gutter);
}
.back {
  justify-self: center;
  color: var(--text-faint);
  font-weight: 500;
  transition: color var(--t-fast);
}
.back:hover {
  color: var(--accent);
}
.login-card {
  width: min(100%, 410px);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: clamp(1.6rem, 5vw, 2.5rem);
}
.login-title {
  font-size: 2rem;
}
.login-sub {
  color: var(--text-soft);
  margin: 0.3rem 0 1.6rem;
}
.field {
  display: block;
  margin-bottom: 1rem;
}
.field span {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: var(--text-soft);
}
.field input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font: inherit;
  background: var(--bg);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}
.field input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.full {
  width: 100%;
  margin-top: 0.5rem;
}
.error {
  color: #c0392b;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}
</style>
