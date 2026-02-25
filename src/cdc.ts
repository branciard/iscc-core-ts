import { CDC_GEAR_UINT32, DATA_AVG_CHUNK_SIZE, IO_READ_SIZE } from './constants';

/**
 * A generator that yields data-dependent chunks for the input data.
 * 
 * Implements Content-Defined Chunking (CDC) algorithm to split data into
 * variable-sized chunks based on content boundaries. This approach provides
 * better deduplication than fixed-size chunking as it maintains chunk
 * boundaries even when data is shifted.
 * 
 * @param data - Raw data buffer to be chunked
 * @param utf32 - If true, ensures chunk boundaries align with UTF-32 encoding (4-byte alignment)
 * @param avgChunkSize - Target average chunk size in bytes (default: 1024)
 * @returns AsyncGenerator yielding Buffer chunks of variable sizes
 * 
 * @example
 * ```typescript
 * const data = Buffer.from('some data');
 * for await (const chunk of algCdcChunks(data)) {
 *   console.log(chunk.length); // Size of each chunk
 * }
 * ```
 */
export async function* algCdcChunks(
    data: Buffer,
    utf32: boolean = false,
    avgChunkSize: number = DATA_AVG_CHUNK_SIZE
): AsyncGenerator<Buffer> {
    // Handle empty input
    if (!data.length) {
        yield Buffer.alloc(0);
        return;
    }

    // Calculate CDC parameters
    const { minSize, maxSize, centerSize, maskS, maskL } =
        algCdcParams(avgChunkSize);

    // Create a safe view of the data using Node.js Buffer
    let currentPosition = 0;
    const readSize = IO_READ_SIZE;
    while (currentPosition < data.length) {
        // Calculate how much data we can safely read
        const remainingBytes = data.length - currentPosition;
        const bytesToRead = Math.min(remainingBytes, maxSize + readSize);

        // Create a view into the buffer
        const currentBuffer = data.subarray(
            currentPosition,
            currentPosition + bytesToRead
        );
        // Find the cut point
        let cutPoint = algCdcOffset(
            currentBuffer,
            minSize,
            maxSize,
            centerSize,
            maskS,
            maskL
        );

        // Make sure cut points are at 4-byte aligned for utf32 encoded text
        if (utf32) {
            cutPoint -= cutPoint % 4;
        }

        // Yield the chunk
        yield currentBuffer.subarray(0, cutPoint);

        // Move position forward
        currentPosition += cutPoint;
    }
}

/**
 * Find breakpoint offset for a given buffer using the CDC algorithm.
 * 
 * Uses a rolling hash function and two different masks to find suitable
 * chunk boundaries. The algorithm operates in two phases:
 * 1. First phase uses a stricter mask (maskS) to find boundaries in the preferred range
 * 2. Second phase uses a more lenient mask (maskL) to ensure chunks don't exceed maximum size
 * 
 * @param buffer - The data buffer to be chunked
 * @param mi - Minimum chunk size
 * @param ma - Maximum chunk size
 * @param cs - Center size (target chunk size)
 * @param maskS - Small mask for first phase (stricter)
 * @param maskL - Large mask for second phase (more lenient)
 * @returns Offset of dynamic cutpoint in number of bytes
 * @internal
 */
export function algCdcOffset(
    buffer: Buffer,
    mi: number,
    ma: number,
    cs: number,
    maskS: number,
    maskL: number
): number {
    let pattern = 0;
    let i = mi;
    const size = buffer.length;
    let barrier = Math.min(cs, size);

    // First phase - using maskS
    while (i < barrier) {
        pattern = ((pattern >>> 1) + (CDC_GEAR_UINT32[buffer[i]] || 0)) >>> 0;
        if (!(pattern & maskS)) {
            return i + 1;
        }
        i++;
    }

    // Second phase - using maskL
    barrier = Math.min(ma, size);
    while (i < barrier) {
        pattern = ((pattern >>> 1) + (CDC_GEAR_UINT32[buffer[i]] || 0)) >>> 0;
        if (!(pattern & maskL)) {
            return i + 1;
        }
        i++;
    }
    return i;
}

/**
 * Calculate CDC parameters based on target average chunk size.
 * 
 * Computes optimal parameters for the CDC algorithm:
 * - minSize: Minimum chunk size (1/4 of average)
 * - maxSize: Maximum chunk size (8x average)
 * - centerSize: Target size for optimal chunking
 * - maskS: Strict mask for primary chunking phase
 * - maskL: Lenient mask for secondary chunking phase
 * 
 * @param avgSize - Target average size of chunks in bytes
 * @returns Object containing calculated CDC parameters
 * @internal
 */
export function algCdcParams(avgSize: number): {
    minSize: number;
    maxSize: number;
    centerSize: number;
    maskS: number;
    maskL: number;
} {
    const ceilDiv = (x: number, y: number): number =>
        Math.floor((x + y - 1) / y);
    const mask = (b: number): number => Math.pow(2, b) - 1;

    const minSize = Math.floor(avgSize / 4);
    const maxSize = avgSize * 8;
    const offset = minSize + ceilDiv(minSize, 2);
    const centerSize = avgSize - offset;
    const bits = Math.round(Math.log2(avgSize));
    const maskS = mask(bits + 1);
    const maskL = mask(bits - 1);

    return {
        minSize,
        maxSize,
        centerSize,
        maskS,
        maskL
    };
}
