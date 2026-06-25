// Verwijdert eerder geüploade foto's uit de GitHub-repo op basis van hun CDN-URL's.
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

  const urls = Array.isArray(body.urls) ? body.urls : []
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'michelle-portfolio',
  }

  // Haalt het pad in de repo uit een jsDelivr-URL (alles na "@{sha}/").
  const pathFromUrl = (url) => {
    const m = typeof url === 'string' && url.match(/@[^/]+\/(.+)$/)
    return m ? m[1] : null
  }

  const deleteOne = async (url) => {
    const path = pathFromUrl(url)
    if (!path) return
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers }
    )
    if (!getRes.ok) return // bestand bestaat al niet meer
    const info = await getRes.json()
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ message: `delete ${path}`, sha: info.sha, branch }),
    })
  }

  try {
    for (const url of urls) await deleteOne(url)
    return { statusCode: 200, body: 'ok' }
  } catch (e) {
    return { statusCode: 500, body: String(e.message || e) }
  }
}
