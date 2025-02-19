import { CDC_GEAR_UINT32, IO_READ_SIZE } from './constants';

/**
 * A generator that yields data-dependent chunks for the input data.
 * @param data Raw data for variable sized chunking
 * @param utf32 If true assume we are chunking text that is utf32 encoded
 * @param avgChunkSize Target chunk size in number of bytes
 * @returns An async generator that yields data chunks of variable sizes
 */
export async function* algCdcChunks(
    data: Buffer,
    utf32: boolean = false,
    avgChunkSize: number = 1024
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
 * Find breakpoint offset for a given buffer.
 * @param buffer The data to be chunked
 * @param mi Minimum chunk size
 * @param ma Maximum chunk size
 * @param cs Center size
 * @param maskS Small mask
 * @param maskL Large mask
 * @returns Offset of dynamic cutpoint in number of bytes
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
 * Calculate CDC parameters
 * @param avgSize Target average size of chunks in number of bytes.
 * @returns Object containing minSize, maxSize, centerSize, maskS, and maskL
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
