# Setup — Portfolio Michelle

De site draait op **Vue 3 + Vite**, gehost op **Netlify**, met:

- **Firestore** voor alle content (projecten, tijdlijn, werkervaring, instellingen) — gratis, pauzeert nooit.
- **Firebase Auth** voor de admin-login (handmatig aangemaakte accounts).
- **Eigen beeldverwerking** (in de browser) + **GitHub-repo via jsDelivr-CDN** voor de foto's — gratis, geen Firebase Storage / Blaze-plan nodig.
- **Video's** via YouTube (gewoon de link plakken in het dashboard).

> De twee admin-accounts staan op drie plekken en moeten overal gelijk zijn:
> `src/config.js`, `firestore.rules`, en als gebruiker in Firebase Authentication.
> Standaard: `alexanderzoet@gmail.com` en `michellejonk17@gmail.com`.

---

## 1. Firebase project

1. Ga naar https://console.firebase.google.com → **Project toevoegen**.
2. **Build → Firestore Database → Database maken** (productiemodus, regio: `europe-west`).
3. **Build → Authentication → Aan de slag → Sign-in method → E-mail/wachtwoord** aanzetten.
4. Maak onder **Authentication → Users** twee gebruikers aan (e-mail + zelfgekozen wachtwoord):
   - `alexanderzoet@gmail.com`
   - `michellejonk17@gmail.com`

   > Dit is de "handmatige" login: er is géén registratiepagina. Wachtwoord vergeten of
   > wijzigen doe je gewoon hier in de Firebase-console.
5. **Projectinstellingen (tandwiel) → Je apps → Web-app toevoegen (</>)** → kopieer de config-waarden.
6. Maak een bestand `.env` aan (kopie van `.env.example`) en vul de `VITE_FIREBASE_*` waarden in.
7. Ga naar **Firestore → Regels**, plak de inhoud van `firestore.rules` en klik **Publiceren**.

> Gebruik **NIET** Firebase Storage (dat vereist het betaalde Blaze-plan). Foto's gaan naar GitHub — zie stap 2.

---

## 2. GitHub-fotoopslag

1. De foto-repo is al aangemaakt: **`portfolio-michelle-foto-s`** (moet **publiek** zijn, want
   jsDelivr serveert er de foto's vandaan). De map `images/` wordt automatisch aangemaakt bij de
   eerste upload — je hoeft niets handmatig te doen.
2. Maak een **fine-grained personal access token**:
   GitHub → Settings → Developer settings → **Fine-grained tokens** →
   - Repository access: **alleen `portfolio-michelle-foto-s`**
   - Permissions → **Contents: Read and write**
3. Deze waarden gebruik je in stap 4 (Netlify) als environment-variabelen:
   - `GITHUB_TOKEN` = het token (geheim — staat niet in de code)
   - `GITHUB_OWNER` = `Allexwnl`
   - `GITHUB_REPO` = `portfolio-michelle-foto-s`
   - `GITHUB_BRANCH` = `main`

---

## 3. Lokaal draaien

```bash
npm install
npm run dev
```

- De site draait dan op http://localhost:5173.
- **Let op:** de foto-upload werkt lokaal alleen met de Netlify-functies. Daarvoor:
  ```bash
  npm i -g netlify-cli
  netlify dev
  ```
  en zet de `GITHUB_*` variabelen in je lokale `.env`. (Zonder dit kun je alles testen
  behalve het daadwerkelijk uploaden van foto's.)

---

## 4. Online zetten (Netlify)

1. De code staat in de repo **`Allexwnl/portfolio-michelle`** (https://github.com/Allexwnl/portfolio-michelle).
2. Netlify → **Add new site → Import an existing project** → kies die repo.
   Build-instellingen worden automatisch uit `netlify.toml` gelezen
   (build: `npm run build`, publish: `dist`, functions: `netlify/functions`).
3. **Site settings → Environment variables** → voeg toe:
   - alle `VITE_FIREBASE_*` waarden (zelfde als je `.env`)
   - `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`
4. Deploy. Klaar! Inloggen kan via `/admin`.

---

## 5. Beheer (voor Michelle)

- Ga naar **`/admin`** en log in.
- **Projecten** — projecten aanmaken/bewerken/verwijderen: titel, hoofdafbeelding (voor de
  homepagina), tekstblokken (1 = gecentreerd, meerdere = automatisch links/rechts afgewisseld),
  extra foto's en YouTube-video's.
- **Tijdlijn** — stages, werk en opleidingen, in volgorde te zetten.
- **Werkervaring** — LinkedIn-stijl lijst.
- **Homepagina** — naam, introtekst en profielfoto aanpassen.
- **Indeling** — accentkleur kiezen, secties aan/uit zetten en de volgorde wijzigen.

---

## Datamodel (Firestore)

```
projects (collectie)
  { title, cover:{full,thumb},
    textBlocks:[{heading, body}],
    images:[{full,thumb}], videos:[youtubeUrl],
    createdAt }

timeline (collectie)
  { label, period, type(stage|werk|opleiding|anders), note, order }

experience (collectie)
  { role, company, location, start, end, current, description, order }

siteSettings/home (document)
  { eyebrow, name, intro, profilePhoto:{full,thumb},
    accent, sectionOrder:[...], sectionVisibility:{...} }
```
