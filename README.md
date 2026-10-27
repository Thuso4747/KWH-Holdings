# KWH Holdings website

A responsive React website for KWH Holdings, with a home page, marketing, business and software service pages, featured-work filters, and a three-step consultation request.

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

The production files are written to `dist/`. Deploy the contents of that directory at the root of a static host and configure it to serve `index.html` for unknown routes, so direct links such as `/services/business` work. The included `public/_redirects` provides this fallback on Netlify and compatible hosts.

## Consultation requests

The form validates the visitor's answers and prepares a message to `haroldlowa25@gmail.com` in their email application. **It does not submit data to a server:** the visitor must send the prepared email. The address and phone number are based on the supplied design and can be updated in `src/pages/ConsultationPage.jsx` and `src/components/Footer.jsx`. A backend or form service would be needed for direct submissions.

Service content and featured-work entries live in `src/data/`; images are in `public/images/`.
