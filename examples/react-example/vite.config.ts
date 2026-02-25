import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Polyfill Node.js modules that iscc-core-ts uses (buffer, crypto, stream)
      include: ['buffer', 'crypto', 'stream'],
      globals: {
        Buffer: true,
      },
    }),
  ],
  resolve: {
    // Keep symlinks as-is so Vite treats iscc-core-ts as inside node_modules
    preserveSymlinks: true,
  },
  // Pre-bundle the linked library so polyfill transforms resolve correctly
  optimizeDeps: {
    include: ['iscc-core-ts', 'buffer', 'crypto-browserify', 'stream-browserify'],
  },
})
