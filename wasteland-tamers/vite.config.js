import { defineConfig } from 'vite';

// Playtest deploys to GitHub Pages under /softsmith-devhub/wasteland-tamers/
// -- NOT the repo-root Pages URL, which is reserved for the actual
// SoftSmith DevHub product (the Android app this monorepo is named for).
// Local dev keeps root-relative paths.
export default defineConfig({
  base: process.env.GH_PAGES ? '/softsmith-devhub/wasteland-tamers/' : '/',
  server: {
    port: 5183,
  },
});
