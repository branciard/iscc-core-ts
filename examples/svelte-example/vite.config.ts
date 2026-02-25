import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    svelte(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream'],
      globals: {
        Buffer: true,
      },
    }),
  ],
  resolve: {
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ['iscc-core-ts', 'buffer', 'crypto-browserify', 'stream-browserify'],
  },
})
