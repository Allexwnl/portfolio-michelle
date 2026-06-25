// Uploadt een verwerkte foto (full + thumb) naar een GitHub-repo en geeft
// jsDelivr-CDN-URL's terug (met commit-SHA, zodat ze meteen en permanent werken).
// Vereiste Netlify env-variabelen: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH (optioneel).

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!token || !owner || !repo) return { statusCode: 500, body: 'GitHub env-variabelen ontbreken' }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Ongeldige JSON' }
  }

  const { baseName, fullB64, thumbB64 } = body
  if (!baseName || !fullB64 || !thumbB64) return { statusCode: 400, body: 'Velden ontbreken' }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'michelle-portfolio',
  }

  const put = async (path, contentB64) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ message: `upload ${path}`, content: contentB64, branch }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || 'GitHub upload mislukt')
    return json.commit.sha
  }

  try {
    const fullPath = `images/${baseName}.webp`
    const thumbPath = `images/${baseName}_thumb.webp`
    const fullSha = await put(fullPath, fullB64)
    const thumbSha = await put(thumbPath, thumbB64)
    const cdn = (sha, path) => `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${sha}/${path}`
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full: cdn(fullSha, fullPath), thumb: cdn(thumbSha, thumbPath) }),
    }
  } catch (e) {
    return { statusCode: 500, body: String(e.message || e) }
  }
}
