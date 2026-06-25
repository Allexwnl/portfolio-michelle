import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import { ALLOWED_EMAILS } from '../config.js'

import HomePage from '../views/HomePage.vue'
import ProjectShow from '../views/ProjectShow.vue'
import LoginAdmin from '../admin/LoginAdmin.vue'
import DashBoard from '../admin/DashBoard.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/project/:id', component: ProjectShow },
  { path: '/admin', component: LoginAdmin },
  { path: '/dashboard', component: DashBoard, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// Wacht eenmalig op de huidige Firebase-gebruiker.
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  const user = await getCurrentUser()
  if (!user || !ALLOWED_EMAILS.includes(user.email)) return '/admin'
  return true
})

export default router
