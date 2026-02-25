# ISCC Core TypeScript Examples

This directory contains example projects demonstrating how to use the `iscc-core-ts` library with different frameworks and runtimes.

| Example | Framework | Description |
|---------|-----------|-------------|
| [react-example](./react-example) | React 19 + Vite | Full interactive demo with 13 sections, sidebar navigation |
| [svelte-example](./svelte-example) | Svelte 5 + Vite | Same interactive demo ported to Svelte |
| [vite-example](./vite-example) | Vanilla TS + Vite | No framework — plain TypeScript with Vite bundling |
| [node-example](./node-example) | Node.js | Command-line example with file I/O |

## Prerequisites

All examples link to the library via `file:../..`, so you must **build the library first**:

```sh
# From the repository root
npm install
npm run build
```

Then `cd` into any example directory and run:

```sh
npm install
npm run dev    # browser examples
npm start      # node-example
```

## What Each Example Demonstrates

- Install and import `iscc-core-ts`
- Generate all types of ISCC codes (Meta, Text, Image, Audio, Video, Mixed, Data, Instance)
- Create composite ISCC-CODEs, Flake-Codes, and ISCC-IDs
- Inspect and compare ISCC codes with codec utilities
- Handle errors gracefully
- Display results (browser UI or console output)

## Browser Polyfills

The browser examples (React, Svelte, Vite) use [vite-plugin-node-polyfills](https://github.com/nicolo-ribaudo/vite-plugin-node-polyfills) to provide `buffer`, `crypto`, and `stream` shims that `iscc-core-ts` requires in the browser.

## Configuration via Environment Variables

All ISCC core options are configurable at runtime using `ISCC_CORE_` prefixed environment variables. This follows the same pattern as the Python reference implementation.

```sh
# Node.js — override via env vars
ISCC_CORE_META_BITS=128 npm start
ISCC_CORE_MAX_META_BYTES=5000000 node my-app.js

# Browser — set at build time via Vite define/env
VITE_ISCC_CORE_META_BITS=128 npm run dev
```

```typescript
import { core_opts, conformant_options } from 'iscc-core-ts';

// Read current configuration
console.log(core_opts.meta_bits);          // 64 (default)
console.log(core_opts.max_meta_bytes);     // 10000000 (default)
console.log(core_opts.data_avg_chunk_size); // 1024 (default)
console.log(conformant_options);            // true if all defaults
```

See the [Node.js example](./node-example) for a complete demonstration.