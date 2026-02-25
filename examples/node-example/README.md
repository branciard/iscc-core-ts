# ISCC Core TS — Node.js Example

A command-line example demonstrating how to use the **iscc-core-ts** library in a Node.js application.

## Prerequisites

- **Node.js** v22 LTS
- The **iscc-core-ts** library must be built first (the example links to it via `file:../..`)

## Quick Start

From the repository root:

```sh
# 1. Install and build the library
npm install
npm run build

# 2. Install example dependencies and run
cd examples/node-example
npm install
npm start
```

## Features

The example demonstrates all ISCC code generation functions:

1. Meta Code - from title string
2. Text Code - from text string
3. Image Code - from ISCC-Logo-Text.png and test pixels
4. Audio Code - from sample-3s.mp3
5. Video Code - from sample-5s.mp4
6. Mixed Code - combining text codes
7. Data Code - from binary data
8. Instance Code - with size and hash
9. ISCC Code - composite code

## Required Test Files

The following files need to be placed in the examples/node-example/ directory:
- ISCC-Logo-Text.png: ISCC logo image for image code testing
- sample-3s.mp3: 3-second audio sample for audio code testing
- sample-5s.mp4: 5-second video sample for video code testing
