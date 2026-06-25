# Portfolio Michelle

Een modern, mobielvriendelijk portfolio met een eigen admin-dashboard.

- **Frontend:** Vue 3 + Vite
- **Data & login:** Firebase (Firestore + Auth)
- **Foto's:** in-browser verkleind → GitHub-repo → jsDelivr-CDN (gratis)
- **Video's:** YouTube-embed
- **Hosting:** Netlify

## Snel starten

```bash
npm install
npm run dev
```

Volledige instructies (Firebase, GitHub-token, Netlify, login) staan in **[SETUP.md](./SETUP.md)**.

## Wat kan Michelle in het dashboard (`/admin`)

- Projecten aanmaken, bewerken en verwijderen (cover, tekstblokken, foto's, YouTube-video's).
- Tijdlijn beheren (stages / werk / opleiding).
- Werkervaring beheren (LinkedIn-stijl).
- Hero-tekst en profielfoto aanpassen.
- Indeling van de homepagina aanpassen: accentkleur, volgorde en zichtbaarheid van secties.

## Structuur

```
netlify/functions/   GitHub upload/delete (serverless)
src/
  components/        Herbruikbare UI + homepagina-secties
  views/             HomePage, ProjectShow
  admin/             Login, Dashboard + panels (CRUD)
  lib/               Beeldverwerking, YouTube, scroll-reveal, instellingen
  css/               base.css (design-systeem) + admin.css
  config.js          Allowlist met admin-e-mails
```
