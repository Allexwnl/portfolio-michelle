// Eigen client-side beeldverwerking: verkleint foto's in de browser naar .webp.
// Geen externe dienst, geen credits. Maakt een 'full' (max 2000px) en een lichte
// 'thumb' (max 800px) versie. Beide als base64 om naar de upload-functie te sturen.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function resizeToBlob(img, max, quality) {
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function processImage(file, { maxFull = 2000, maxThumb = 800, quality = 0.82 } = {}) {
  const img = await loadImage(file)
  const [full, thumb] = await Promise.all([
    resizeToBlob(img, maxFull, quality),
    resizeToBlob(img, maxThumb, quality),
  ])
  URL.revokeObjectURL(img.src)
  return {
    fullB64: await blobToBase64(full),
    thumbB64: await blobToBase64(thumb),
  }
}

// Verwerkt + uploadt één bestand via de Netlify-functie -> { full, thumb } CDN-URL's.
export async function uploadImage(file) {
  const { fullB64, thumbB64 } = await processImage(file)
  const baseName = `${Date.now()}_${Math.random().toString(36).slice(2)}`
  const res = await fetch('/.netlify/functions/githubUpload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseName, fullB64, thumbB64 }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() // { full, thumb }
}

// Verwijdert foto's uit GitHub op basis van hun CDN-URL's.
export async function deleteImages(urls) {
  const clean = (urls || []).filter(Boolean)
  if (!clean.length) return
  await fetch('/.netlify/functions/githubDelete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: clean }),
  })
}
