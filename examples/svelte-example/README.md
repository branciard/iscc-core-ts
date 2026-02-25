# ISCC Core TS — Svelte Example

A browser-based interactive demo for **iscc-core-ts** built with [Svelte 5](https://svelte.dev/) + [Vite](https://vite.dev/) + TypeScript.

## Features

13 interactive sections covering the full library API:

| Section | Library function |
|---------|-----------------|
| Meta-Code | `gen_meta_code` |
| Text-Code | `gen_text_code` |
| Image-Code | `gen_image_code` |
| Audio-Code | `gen_audio_code` |
| Video-Code | `gen_video_code` |
| Mixed-Code | `gen_mixed_code` |
| Data-Code | `gen_data_code` |
| Instance-Code | `gen_instance_code` |
| ISCC-CODE | `gen_iscc_code` |
| Flake-Code | `gen_flake_code` |
| ISCC-ID | `gen_iscc_id` |
| Codec Utils | `iscc_explain`, `iscc_validate`, `iscc_similarity`, `iscc_distance`, `iscc_decompose`, `encode_base32`, `decode_base32` |
| Code Inspector | `Code` class — parse and inspect any ISCC code |

## Prerequisites

- **Node.js** v22 LTS
- The **iscc-core-ts** library must be built first (the example links to it via `file:../..`)

## Quick Start

From the repository root:

```sh
# 1. Install and build the library
npm install
npm run build

# 2. Install example dependencies
cd examples/svelte-example
npm install

# 3. Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

## Stack

- [Svelte 5](https://svelte.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [vite-plugin-node-polyfills](https://github.com/nicolo-ribaudo/vite-plugin-node-polyfills) — browser polyfills for `buffer`, `crypto`, `stream`

## How It Works

The example imports `iscc-core-ts` as a local dependency (`"iscc-core-ts": "file:../.."`) . Vite's `vite-plugin-node-polyfills` provides browser shims for the Node.js built-ins that the library relies on (`Buffer`, `crypto`, `stream`).

Each section component lives in `src/components/sections/` and calls the corresponding library function with user-provided inputs, displaying the results in real time. The app uses Svelte 5 runes (`$state`, `$derived`, `$props`) for reactive state management.
