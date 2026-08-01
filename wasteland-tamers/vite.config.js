import { defineConfig } from 'vite';

// Playtest deploys to GitHub Pages at /softsmith-devhub/ (a project-repo
// Pages site, not a custom domain), so the build needs that base path.
// Local dev keeps root-relative paths.
export default defineConfig({
  base: process.env.GH_PAGES ? '/softsmith-devhub/' : '/',
  server: {
    port: 5183,
  },
});
