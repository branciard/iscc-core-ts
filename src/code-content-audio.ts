import { encode_component } from './codec';
import { MT, ST_CC, AUDIO_BITS, Version } from './constants';
import { safeHex } from './utils';

/**
 * Generates an ISCC Audio Code from a Chromaprint fingerprint.
 * 
 * The Content-Code Audio is generated from a Chromaprint fingerprint provided as a vector of 32-bit
 * signed integers. The fingerprint can be extracted using the `fpcalc` tool from Chromaprint/AcoustID
 * with the following command:
 * ```bash
 * fpcalc -raw -json -signed -length 0 myaudiofile.mp3
 * ```
 * 
 * @param chromaprint - Array of 32-bit signed integers representing the audio fingerprint
 * @param bits - Optional. The number of bits for the similarity hash. Must be a multiple of 32
 * @param version - Optional. ISCC version number (currently only 0 is supported)
 * @returns Object containing the ISCC code as a string
 * @throws {Error} If an unsupported version is provided
 * 
 * @example
 * ```typescript
 * const chromaprint = [-944046799, 1095944255, ...]; // Chromaprint vector
 * const result = gen_audio_code(chromaprint, 64, 0);
 * console.log(result.iscc); // Outputs: "ISCC:..."
 * ```
 */
export function gen_audio_code(
    chromaprint: number[],
    bits?: number,
    version?: number
): {
    iscc: string;
} {
    if (version === undefined || version === null) {
        version = 0;
    }
    if (version === 0) {
        return gen_audio_code_v0(chromaprint, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

/**
 * Generates a version 0 ISCC Audio Code from a Chromaprint fingerprint.
 * 
 * @param chromaprint - Array of 32-bit signed integers representing the audio fingerprint
 * @param bits - Optional. The number of bits for the similarity hash (default: AUDIO_BITS)
 * @returns Object containing the ISCC code as a string
 * @internal
 */
export function gen_audio_code_v0(
    chromaprint: number[],
    bits?: number
): {
    iscc: string;
} {
    const digest = Buffer.from(
        soft_hash_audio_v0(chromaprint, bits ? bits : AUDIO_BITS)
    ).toString('hex');
    const audio_code = encode_component(
        MT.CONTENT,
        ST_CC.AUDIO,
        Version.V0,
        bits ? bits : AUDIO_BITS,
        safeHex(digest)
    );

    const iscc = 'ISCC:' + audio_code;
    return {
        iscc: iscc
    };
}

/**
 * Creates a similarity-preserving hash from a Chromaprint vector.
 * 
 * The function generates a similarity hash by:
 * 1. Converting the chromaprint vector into 4-byte digests
 * 2. Calculating the initial 32-bit simhash
 * 3. Adding additional 32-bit chunks based on different feature groupings:
 *    - Four quarters of the original features
 *    - Three thirds of value-sorted features
 * 
 * @param cv - Chromaprint vector as an iterable of numbers
 * @param bits - Number of bits for the resulting similarity hash (must be multiple of 32)
 * @returns Uint8Array containing the similarity-preserving hash
 * 
 * @example
 * ```typescript
 * const chromaprint = [-944046799, 1095944255, ...];
 * const hash = soft_hash_audio_v0(chromaprint, 64);
 * ```
 */
export function soft_hash_audio_v0(
    cv: Iterable<number>,
    bits: number = 64
): Uint8Array {
    /**
     * Create audio similarity hash from a chromaprint vector.
     *
     * @param cv - Chromaprint vector
     * @param bits - Bit-length resulting similarity hash (multiple of 32)
     * @return Audio-Hash digest
     */

    // Convert chromaprint vector into list of 4 byte digests
    const digests = Array.from(cv).map((intFeature) =>
        new Uint8Array(new Int32Array([intFeature]).buffer).reverse()
    );

    // Return identity hash if we have 0 digests
    if (digests.length === 0) {
        return new Uint8Array(32);
    }

    // Calculate simhash of digests as first 32-bit chunk of the hash
    const parts: Uint8Array[] = [algSimhash(digests)];

    let bitLength = 32;

    // Calculate separate 32-bit simhashes for each quarter of features (original order)
    for (const bucket of divide(4, digests)) {
        const features = Array.from(bucket);
        if (features.length > 0) {
            parts.push(algSimhash(features));
        } else {
            parts.push(new Uint8Array(4));
        }
        bitLength += 32;
        if (bitLength === bits) {
            return concatenateUint8Arrays(parts);
        }
    }

    // Calculate separate simhashes for each third of features (ordered by int value)
    const cvs = Array.from(cv).sort((a, b) => a - b);
    const sortedDigests = cvs.map((intFeature) =>
        new Uint8Array(new Int32Array([intFeature]).buffer).reverse()
    );
    for (const bucket of divide(3, sortedDigests)) {
        const features = Array.from(bucket);
        if (features.length > 0) {
            parts.push(algSimhash(features));
        } else {
            parts.push(new Uint8Array(4));
        }
        bitLength += 32;
        if (bitLength === bits) {
            return concatenateUint8Arrays(parts);
        }
    }

    return concatenateUint8Arrays(parts);
}

/**
 * Creates a similarity-preserving hash from a sequence of equal-sized hash digests.
 * 
 * @param hashDigests - Array of Uint8Array representing equally sized byte-hashes
 * @returns Uint8Array containing the similarity hash
 * @internal
 */
function algSimhash(hashDigests: Uint8Array[]): Uint8Array {
    /**
     * Creates a similarity preserving hash from a sequence of equal sized hash digests.
     *
     * @param hashDigests - A sequence of equally sized byte-hashes.
     * @returns Similarity byte-hash
     */

    const nBytes = hashDigests[0].length;
    const nBits = nBytes * 8;
    const vector = new Array(nBits).fill(0);
    for (const digest of hashDigests) {
        for (let i = 0; i < nBits; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            vector[i] +=
                (digest[byteIndex] & (1 << (7 - bitIndex))) !== 0 ? 1 : 0;
        }
    }

    const minFeatures = hashDigests.length / 2;
    let shash = BigInt(0);

    for (let i = 0; i < nBits; i++) {
        if (vector[i] >= minFeatures) {
            shash |= BigInt(1) << BigInt(nBits - 1 - i);
        }
    }

    return bigIntToUint8Array(shash, nBytes);
}

/**
 * Divides an iterable into n chunks of approximately equal size.
 * 
 * @param n - Number of chunks to create
 * @param iterable - The iterable to divide
 * @returns Generator yielding n arrays containing the chunks
 * @internal
 */
function* divide<T>(n: number, iterable: Iterable<T>): Generator<T[]> {
    const arr = Array.from(iterable);
    const chunkSize = Math.ceil(arr.length / n);
    for (let i = 0; i < n; i++) {
        yield arr.slice(i * chunkSize, (i + 1) * chunkSize);
    }
}

/**
 * Concatenates multiple Uint8Arrays into a single Uint8Array.
 * 
 * @param arrays - Array of Uint8Arrays to concatenate
 * @returns Single Uint8Array containing all input arrays
 * @internal
 */
function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

/**
 * Converts a BigInt to a Uint8Array of specified byte length.
 * 
 * @param bigInt - BigInt value to convert
 * @param byteLength - Number of bytes in the resulting array
 * @returns Uint8Array representation of the BigInt
 * @internal
 */
function bigIntToUint8Array(bigInt: bigint, byteLength: number): Uint8Array {
    const result = new Uint8Array(byteLength);
    let tempBigInt = BigInt(bigInt); // Create a copy to avoid modifying the original
    for (let i = 0; i < byteLength; i++) {
        result[byteLength - 1 - i] = Number(tempBigInt & 255n);
        tempBigInt = tempBigInt >> 8n;
    }
    return result;
}
