import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If deploying to GitHub Pages under a repo path (e.g. RushadW.github.io/portfolio),
// set base: '/portfolio/'. For a custom domain or user page, leave as '/'.
export default defineConfig({
  plugins: [react()],
  base: '/',
});
