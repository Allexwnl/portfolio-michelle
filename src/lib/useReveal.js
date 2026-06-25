// Lichtgewicht scroll-reveal: voegt de class `is-visible` toe zodra een element
// in beeld komt. Gebruik met de v-reveal directive (zie main.js) of de composable.
// Respecteert 'prefers-reduced-motion': dan meteen zichtbaar, geen animatie.

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let observer = null

function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  return observer
}

// Vue-directive: <div v-reveal> of <div v-reveal="150"> (vertraging in ms).
export const reveal = {
  mounted(el, binding) {
    el.classList.add('reveal')
    const delay = Number(binding.value) || 0
    if (delay) el.style.transitionDelay = `${delay}ms`

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }
    getObserver()?.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
