// Buffer is polyfilled at runtime by vite-plugin-node-polyfills
declare const Buffer: {
  from(data: string, encoding?: string): Uint8Array & { toString(encoding: string): string }
  from(data: Uint8Array): Uint8Array & { toString(encoding: string): string }
}
