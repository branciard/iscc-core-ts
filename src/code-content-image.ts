import { encode_component } from './codec';
import { MT, ST_CC, IMAGE_BITS, Version } from './constants';
import { safeHex } from './utils';

/**
 * Generates an ISCC Image Code from normalized grayscale pixel values.
 * 
 * The Content-Code Image is generated from a sequence of normalized grayscale pixel values.
 * The pixel values should be preprocessed and normalized before being passed to this function.
 * 
 * @param pixels - Array of normalized grayscale pixel values (should be 1024 values)
 * @param bits - Optional. The number of bits for the similarity hash. Must be multiple of 32 (default: IMAGE_BITS)
 * @param version - Optional. ISCC version number (currently only 0 is supported)
 * @returns Object containing the ISCC code as a string
 * @throws {Error} If an unsupported version is provided
 * 
 * @example
 * ```typescript
 * const pixels = [0.5, 0.6, 0.4, ...]; // 1024 normalized pixel values
 * const result = gen_image_code(pixels, 64, 0);
 * console.log(result.iscc); // Outputs: "ISCC:..."
 * ```
 */
export function gen_image_code(
    pixels: number[],
    bits?: number,
    version?: number
): {
    iscc: string;
} {
    if (!version) {
        version = 0;
    }
    if (version == 0) {
        return gen_image_code_v0(pixels, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

/**
 * Generates a version 0 ISCC Image Code from normalized grayscale pixel values.
 * 
 * @param pixels - Array of normalized grayscale pixel values
 * @param bits - Optional. The number of bits for the similarity hash (default: IMAGE_BITS)
 * @returns Object containing the ISCC code as a string
 * @internal
 */
export function gen_image_code_v0(
    pixels: number[],
    bits?: number
): {
    iscc: string;
} {
    const digest = Buffer.from(
        soft_hash_image_v0(pixels, bits ? bits : IMAGE_BITS)
    ).toString('hex');
    const image_code = encode_component(
        MT.CONTENT,
        ST_CC.IMAGE,
        Version.V0,
        bits ? bits : IMAGE_BITS,
        safeHex(digest)
    );

    const iscc = 'ISCC:' + image_code;
    return {
        iscc: iscc
    };
}

/**
 * Creates a similarity-preserving hash from normalized grayscale pixel values.
 * 
 * The function generates a perceptual image hash using the following steps:
 * 1. Applies DCT (Discrete Cosine Transform) to rows of pixel values
 * 2. Applies DCT to columns of the transformed values
 * 3. Extracts 8x8 slices from the DCT matrix
 * 4. Generates bits by comparing values to the median in each slice
 * 
 * @param pixels - Array of 1024 normalized grayscale pixel values
 * @param bits - Number of bits for the resulting similarity hash (max 256)
 * @returns Uint8Array containing the similarity-preserving hash
 * @throws {Error} If bits exceeds 256 or if hash generation fails
 * 
 * @example
 * ```typescript
 * const pixels = [0.5, 0.6, 0.4, ...]; // 1024 normalized values
 * const hash = soft_hash_image_v0(pixels, 64);
 * ```
 */
export function soft_hash_image_v0(pixels: number[], bits: number): Uint8Array {
    if (bits > 256) {
        throw new Error(
            `${bits} bits exceeds max length 256 for soft_hash_image`
        );
    }

    // DCT per row
    const dctRowLists: number[][] = [];
    for (let i = 0; i < pixels.length; i += 32) {
        dctRowLists.push(algDct(pixels.slice(i, i + 32)));
    }

    // DCT per col
    const dctRowListsT = dctRowLists[0].map((_, colIndex) =>
        dctRowLists.map((row) => row[colIndex])
    );
    const dctColListsT = dctRowListsT.map(algDct);

    const dctMatrix = dctColListsT[0].map((_, rowIndex) =>
        dctColListsT.map((col) => col[rowIndex])
    );

    function flatten(m: number[][], x: number, y: number): number[] {
        return m.slice(y, y + 8).flatMap((row) => row.slice(x, x + 8));
    }

    let bitstring = '';
    const slices = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1]
    ];

    for (const [x, y] of slices) {
        // Extract 8 x 8 slice
        const flatList = flatten(dctMatrix, x, y);

        // Calculate median
        const med = median(flatList);

        // Append 64-bit digest by comparing to median
        for (const value of flatList) {
            bitstring += value > med ? '1' : '0';
        }

        const bl = bitstring.length;
        if (bl >= bits) {
            const hashDigest = new Uint8Array(Math.floor(bl / 8));
            for (let i = 0; i < bl; i += 8) {
                hashDigest[i / 8] = parseInt(bitstring.substr(i, 8), 2);
            }
            return hashDigest;
        }
    }

    throw new Error('Failed to generate hash digest');
}

/**
 * Calculates the median value from an array of numbers.
 * 
 * @param numbers - Array of numbers to find the median from
 * @returns The median value
 * @internal
 */
function median(numbers: number[]): number {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

/**
 * Performs a Discrete Cosine Transform (DCT) on a vector of numbers.
 * 
 * Implementation based on the fast DCT algorithm from:
 * https://www.nayuki.io/page/fast-discrete-cosine-transform-algorithms
 * 
 * @param v - Input vector for DCT calculation
 * @returns Array containing the DCT transformed values
 * @throws {Error} If input length is invalid (must be power of 2)
 * @internal
 */
export function algDct(v: number[]): number[] {
    /**
     * Discrete cosine transform.
     *
     * See: [nayuki.io](https://www.nayuki.io/page/fast-discrete-cosine-transform-algorithms).
     *
     * @param v - Input vector for DCT calculation.
     * @return DCT Transformed vector.
     */

    const n = v.length;
    if (n === 1) {
        return [...v];
    } else if (n === 0 || n % 2 !== 0) {
        throw new Error('Invalid input length');
    } else {
        const half = Math.floor(n / 2);
        const alpha = Array.from(
            { length: half },
            (_, i) => v[i] + v[n - 1 - i]
        );
        const beta = Array.from(
            { length: half },
            (_, i) =>
                (v[i] - v[n - 1 - i]) /
                (Math.cos(((i + 0.5) * Math.PI) / n) * 2.0)
        );

        const alphaTransformed = algDct(alpha);
        const betaTransformed = algDct(beta);

        const result: number[] = [];
        for (let i = 0; i < half - 1; i++) {
            result.push(alphaTransformed[i]);
            result.push(betaTransformed[i] + betaTransformed[i + 1]);
        }
        result.push(alphaTransformed[half - 1]);
        result.push(betaTransformed[half - 1]);

        return result;
    }
}
