import { 
  gen_meta_code,
  gen_text_code,
  gen_image_code,
  gen_audio_code,
  gen_video_code,
  gen_mixed_code,
  gen_data_code,
  gen_instance_code,
  gen_iscc_code
} from 'iscc-core-ts';
import * as fs from 'fs/promises';
import * as path from 'path';

async function generateAllCodes() {
  const codes: string[] = [];

  try {
    console.log('Testing all ISCC code generation functions:\n');

    // 1. Meta Code
    try {
      const metaTitle = "Die Unendliche Geschichte";
      const metaResult = await gen_meta_code(metaTitle);
      console.log('1. Meta Code:', metaResult.iscc);
      console.log('Meta Hash:', metaResult.metahash);
      codes.push(metaResult.iscc);
    } catch (error) {
      console.error('Error generating Meta Code:', error instanceof Error ? error.message : error);
    }

    // 2. Text Code
    try {
      const text = "Hello World";
      const textResult = gen_text_code(text);
      console.log('\n2. Text Code:', textResult.iscc);
      console.log('Text Characters:', textResult.characters);
      codes.push(textResult.iscc);
    } catch (error) {
      console.error('Error generating Text Code:', error instanceof Error ? error.message : error);
    }

    // 3. Image Code
    try {
      console.log('\n3. Image Code tests:');
      
      // Test 1: Standard test with known pixels
      console.log('\nTest 1: Standard pixel test');
      const pixels = new Array(1024).fill(0); // Black pixels
      const imageResult = await gen_image_code(pixels, 64);
      console.log('Test Image Code:', imageResult.iscc);
      console.log('Code starts with ISCC:EE:', imageResult.iscc.startsWith('ISCC:EE'));
      codes.push(imageResult.iscc);

      // Remove Text Code from codes array since we can't mix EA and EE types
      codes.splice(1, 1); // Remove the Text Code we added earlier
      
      // Test 2: ISCC Logo image
      console.log('\nTest 2: ISCC Logo image test');
      try {
        // Read the image file
        const imagePath = './ISCC-Logo-Text.png';
        console.log('Trying to read image from:', imagePath);
        const imageData = await fs.readFile(imagePath);
        console.log('Successfully loaded image, size:', imageData.length);
        
        // Convert PNG to grayscale pixel array following image.py normalize function:
        // 1. Convert to grayscale using standard coefficients
        // 2. Resize to 32x32
        // 3. Get flattened sequence of 1024 pixels
        const logoPixels = new Array(1024);
        const width = Math.ceil(Math.sqrt(imageData.length / 4)); // Estimate original width
        const height = width;
        const scale = 32 / Math.max(width, height);

        // Process each pixel
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            // Map to original image coordinates
            const srcX = Math.floor(x / scale);
            const srcY = Math.floor(y / scale);
            const srcIdx = (srcY * width + srcX) * 4;

            // Get RGB values
            const r = imageData[srcIdx];
            const g = imageData[srcIdx + 1];
            const b = imageData[srcIdx + 2];

            // Convert to grayscale using same coefficients as PIL
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            
            // Store in flattened array
            logoPixels[y * 32 + x] = gray;
          }
        }
        
        // Generate image code
        const logoResult = await gen_image_code(logoPixels, 64);
        console.log('ISCC Logo Code:', logoResult.iscc);
        console.log('Code starts with ISCC:EE:', logoResult.iscc.startsWith('ISCC:EE'));
        
        // Try 128-bit version too
        const logo128Result = await gen_image_code(logoPixels, 128);
        console.log('ISCC Logo Code (128 bits):', logo128Result.iscc);
        
      } catch (logoError) {
        console.error('Error processing logo:', logoError instanceof Error ? logoError.message : logoError);
      }
      
    } catch (error) {
      console.error('Error generating Image Code:', error instanceof Error ? error.message : error);
      console.error('Stack:', error instanceof Error ? error.stack : '');
    }

    // 4. Data Code
    try {
      const dataResult = await gen_data_code(Buffer.from('hello world'));
      console.log('\n4. Data Code:', dataResult.iscc);
      codes.push(dataResult.iscc);
    } catch (error) {
      console.error('Error generating Data Code:', error instanceof Error ? error.message : error);
    }

    // 5. Instance Code
    try {
      const instanceResult = await gen_instance_code(Buffer.from('hello world'), 128);
      console.log('\n5. Instance Code:', instanceResult.iscc);
      console.log('File Size:', instanceResult.filesize);
      console.log('Data Hash:', instanceResult.datahash);
      codes.push(instanceResult.iscc);
    } catch (error) {
      console.error('Error generating Instance Code:', error instanceof Error ? error.message : error);
    }

    // 6. ISCC Code
    if (codes.length > 0) {
      try {
        const isccResult = await gen_iscc_code(codes);
        console.log('\n6. ISCC Code:', isccResult.iscc);
      } catch (error) {
        console.error('Error generating ISCC Code:', error instanceof Error ? error.message : error);
      }
    } else {
      console.log('\n6. ISCC Code: Skipped - No codes were successfully generated');
    }

  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run example
generateAllCodes().catch(console.error);