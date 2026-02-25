import { 
  gen_meta_code,
  gen_text_code,
  gen_image_code,
  gen_audio_code,
  gen_video_code,
  gen_data_code,
  gen_mixed_code,
  gen_instance_code,
  gen_iscc_code,
  core_opts,
  conformant_options,
  FrameSig
} from 'iscc-core-ts';
import * as fs from 'fs/promises';

async function generateAllCodes() {
  // Keep track of codes by type for proper combination
  const metaCodes: string[] = [];
  const contentCodes: string[] = [];
  const dataCodes: string[] = [];
  const instanceCodes: string[] = [];

  try {
    // Show current configuration (can be overridden via ISCC_CORE_* env vars)
    console.log('=== ISCC Core Configuration ===');
    console.log('  meta_bits:', core_opts.meta_bits);
    console.log('  max_meta_bytes:', core_opts.max_meta_bytes);
    console.log('  data_avg_chunk_size:', core_opts.data_avg_chunk_size);
    console.log('  conformant:', conformant_options);
    console.log('');
    console.log('Tip: Override via environment variables, e.g.:');
    console.log('  ISCC_CORE_META_BITS=128 npm start');
    console.log('  ISCC_CORE_MAX_META_BYTES=5000000 npm start');
    console.log('');
    console.log('Testing all ISCC code generation functions:\n');

    // 1. Meta Code
    try {
      const metaTitle = "Die Unendliche Geschichte";
      const metaResult = await gen_meta_code(metaTitle);
      console.log('1. Meta Code:', metaResult.iscc);
      console.log('Meta Hash:', metaResult.metahash);
      metaCodes.push(metaResult.iscc);
    } catch (error) {
      console.error('Error generating Meta Code:', error instanceof Error ? error.message : error);
    }

    // 2. Text Code
    try {
      const text = "Hello World";
      const textResult = gen_text_code(text);
      console.log('\n2. Text Code:', textResult.iscc);
      console.log('Text Characters:', textResult.characters);
      // Don't add to contentCodes - we'll use Image as our content type
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
      contentCodes.push(imageResult.iscc); // This will be our content code
      
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

    // 4. Audio Code
    try {
      console.log('\n4. Audio Code test:');
      
      // Read the audio file
      const audioPath = './sample-3s.mp3';
      console.log('Reading audio file:', audioPath);
      const audioData = await fs.readFile(audioPath);
      
      // Convert Buffer to number array
      const audioArray = Array.from(new Uint8Array(audioData));
      
      // Generate audio code with 64 bits (default)
      const audioResult = await gen_audio_code(audioArray);
      console.log('Audio Code:', audioResult.iscc);
      // Don't add to contentCodes - we're using Image type
    } catch (error) {
      console.error('Error generating Audio Code:', error instanceof Error ? error.message : error);
      console.error('Stack:', error instanceof Error ? error.stack : '');
    }

    // 5. Video Code
    try {
      console.log('\n5. Video Code test:');
      
      // Create proper MPEG-7 frame signatures based on test cases
      const videoFrames: FrameSig[] = [
        new Array(380).fill(0), // First frame all zeros
        new Array(380).fill(1), // Second frame all ones
        new Array(380).fill(2)  // Third frame all twos
      ];
      
      const videoResult = await gen_video_code(videoFrames);
      console.log('Video Code:', videoResult.iscc);
      // Don't add to contentCodes - we're using Image type
    } catch (error) {
      console.error('Error generating Video Code:', error instanceof Error ? error.message : error);
    }

    // 6. Mixed Code
    try {
      console.log('\n6. Mixed Code test:');
      
      // Generate two text codes of same type and length per test cases
      const text1 = gen_text_code("Hello World", 64);
      const text2 = gen_text_code("Another Text", 64);
      
      const mixedResult = await gen_mixed_code([text1.iscc, text2.iscc]);
      console.log('Mixed Code:', mixedResult.iscc);
      console.log('Parts:', mixedResult.parts);
      // Don't add to contentCodes - we're using Image type
    } catch (error) {
      console.error('Error generating Mixed Code:', error instanceof Error ? error.message : error);
    }

    // 7. Data Code
    try {
      const dataResult = await gen_data_code(Buffer.from('hello world'));
      console.log('\n7. Data Code:', dataResult.iscc);
      dataCodes.push(dataResult.iscc);
    } catch (error) {
      console.error('Error generating Data Code:', error instanceof Error ? error.message : error);
    }

    // 8. Instance Code
    try {
      const instanceResult = await gen_instance_code(Buffer.from('hello world'), 128);
      console.log('\n8. Instance Code:', instanceResult.iscc);
      console.log('File Size:', instanceResult.filesize);
      console.log('Data Hash:', instanceResult.datahash);
      instanceCodes.push(instanceResult.iscc);
    } catch (error) {
      console.error('Error generating Instance Code:', error instanceof Error ? error.message : error);
    }

    // 9. ISCC Code
    try {
      // Combine codes according to ST_ISCC rules
      const compatibleCodes = [
        ...metaCodes,      // Meta codes
        ...contentCodes,   // One content type only (Image in this case)
        ...dataCodes,      // Data codes
        ...instanceCodes   // Instance codes
      ];

      if (compatibleCodes.length >= 2) {
        const isccResult = await gen_iscc_code(compatibleCodes);
        console.log('\n9. ISCC Code:', isccResult.iscc);
      } else {
        console.log('\n9. ISCC Code: Not enough compatible codes to generate ISCC');
      }
    } catch (error) {
      console.error('Error generating ISCC Code:', error instanceof Error ? error.message : error);
    }

  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run example
generateAllCodes().catch(console.error);