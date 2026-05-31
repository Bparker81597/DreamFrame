# DreamFrame

DreamFrame is a React + TypeScript + Vite site prepared for local development,
local network hosting, production previews, and GitHub Pages deployment.

## Local Servers

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173/DreamFrame/`.

To expose the dev server on your local network:

```bash
npm run dev:host
```

To preview the production build locally:

```bash
npm run build
npm run preview
```

## GitHub Pages

This repo includes `.github/workflows/deploy.yml`. Every push to `main` builds
the Vite app and deploys `dist` to GitHub Pages.

The Vite base path is set to `/DreamFrame/` for the repository URL:

```text
https://Bparker81597.github.io/DreamFrame/
```
