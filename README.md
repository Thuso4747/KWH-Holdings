# KWH Holdings website

A responsive React website for KWH Holdings, with a home page, marketing, business and software service pages, and a three-step consultation request. The home header centres its navigation on desktop and offers an accessible menu on mobile; other standard pages also offer a desktop menu. On service pages, a transparent, logo-free navigation reveals on upward scroll or near the top edge, adapting its contrast to the content underneath; an accessible menu is also available for touch and keyboard users.

## Getting started

Use Node.js 22.12 or newer in the Node 22 LTS line, Node 24, or Node 26+.

```bash
npm ci
npm run dev
```

The development server listens on port 5173 by default. To run the tests or create a production build:

```bash
npm test
npm run build
npm run preview
```

The production files are written to `dist/`. The site is a single-page application: configure a static host to serve `index.html` for unknown routes so direct links such as `/services/business` work.

## Deployment

### Cloudflare Workers

Connect the GitHub repository to the `kwh-holdings` Worker and use these Workers Builds settings:

- Production branch: `main`
- Root directory: `/`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Preview command: `npx wrangler preview`

`wrangler.jsonc` serves the `dist/` assets, enables single-page routing, and includes the empty preview configuration required for branch previews. Do not add the Netlify-style `/* /index.html 200` rule to `public/_redirects`: Cloudflare Workers rejects that rule as a redirect loop.

### Netlify and other hosts

For a Netlify site connected to this repository, `netlify.toml` builds `dist/` and provides the single-page fallback. If manually uploading only `dist/`, or using a different static host, configure the equivalent fallback on that host.

## Consultation requests

The form validates the visitor's answers and prepares a message to `haroldlowa25@gmail.com` in their email application. **It does not submit data to a server:** the visitor must send the prepared email. The address and phone number are based on the supplied design and can be updated in `src/pages/ConsultationPage.jsx`. A backend or form service would be needed for direct submissions.

Service content lives in `src/data/services.js`; images are in `public/images/`. The project data and its images are retained in the repository but are not displayed on the site.
