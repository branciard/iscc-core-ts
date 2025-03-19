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
3. Image Code - from test.png
4. Audio Code - from test.mp3
5. Video Code - from test.mp4
6. Mixed Code - combining content codes
7. Data Code - from binary data
8. Instance Code - with size and hash
9. ISCC Code - composite code

Sample media files are provided in the `sample/` directory:
- test.png: 1x1 pixel black image
- test.mp3: 1 second silent audio
- test.mp4: 1 frame black video

## Common Issues

- Make sure all dependencies are installed
- Handle all async operations with try/catch
- Ensure TypeScript is properly configured 