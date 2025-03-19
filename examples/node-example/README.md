# ISCC Core TypeScript - Node.js Example

This example demonstrates how to use the iscc-core-ts library in a Node.js application.

## Setup Steps

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
npm start
```

## Testing Different Features

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

## Common Issues

- Make sure test files are in the correct location (same directory as package.json)
- Handle all async operations with try/catch
- Ensure TypeScript is properly configured 