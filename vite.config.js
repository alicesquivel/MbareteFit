import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // This base path is now set to your specific repository name
  base: '/MbareteFit/',
  plugins: [react()],
})
