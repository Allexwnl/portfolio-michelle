// Haalt het YouTube-video-ID uit allerlei URL-vormen (watch, youtu.be, embed, shorts)
// of accepteert een kaal ID. Geeft null terug als er niets bruikbaars in zit.
export function youtubeId(input) {
  if (!input) return null
  const s = String(input).trim()

  // Al een kaal ID? (11 tekens, geen slashes/punten)
  if (/^[\w-]{11}$/.test(s)) return s

  try {
    const url = new URL(s.includes('://') ? s : `https://${s}`)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (url.searchParams.get('v')) return url.searchParams.get('v')
      const m = url.pathname.match(/\/(embed|shorts|v)\/([\w-]{11})/)
      if (m) return m[2]
    }
  } catch {
    /* val terug op de regex hieronder */
  }

  const m = s.match(/[\w-]{11}/)
  return m ? m[0] : null
}

// Privacy-vriendelijke thumbnail-URL voor een video-ID.
export function youtubeThumb(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

// Embed-URL (nocookie) met autoplay zodra de gebruiker op play klikt.
export function youtubeEmbed(id, { autoplay = true } = {}) {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    ...(autoplay ? { autoplay: '1' } : {}),
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
