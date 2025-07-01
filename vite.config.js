import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // This is the most important step for GitHub Pages deployment.
  // It tells the app that it lives in a subfolder, not the root domain.
  // Make sure this matches your repository name exactly.
  base: '/MbareteFit/',
  plugins: [react()],
})