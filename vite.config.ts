import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the build works on GitHub Pages
// regardless of the repository name (project sites are served from /<repo>/).
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
})
