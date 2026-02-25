import { encode_component } from './codec';
import { MT, ST, DATA_BITS, Version } from './constants';
import { algCdcChunks } from './cdc';
import { algMinhash256 } from './minhash';
import { xxHash32 } from 'js-xxhash';

/**
 * Generates an ISCC Data-Code from a data stream.
 * 
 * The Data-Code is generated from a binary data stream using Content-Defined Chunking (CDC)
 * and MinHash for similarity hashing. This code can be used to identify similar binary data
 * streams regardless of their format.
 * 
 * @param stream - Input data buffer to generate the hash from
 * @param bits - Optional. The number of bits for the similarity hash. Must be multiple of 32 (default: 64)
 * @returns Object containing the ISCC code as a string
 * @throws {Error} If an unsupported version is provided
 * 
 * @example
 * ```typescript
 * const data = Buffer.from('Hello, World!');
 * const result = await gen_data_code(data, 64);
 * console.log(result.iscc); // Outputs: "ISCC:..."
 * ```
 */
export async function gen_data_code(
    stream: Buffer,
    bits: number = DATA_BITS
): Promise<{ iscc: string }> {
    return gen_data_code_v0(stream, bits);
}

/**
 * Generates a version 0 ISCC Data-Code from a data stream.
 * 
 * @param stream - Input data buffer
 * @param bits - Optional. The number of bits for the similarity hash (default: 64)
 * @returns Object containing the ISCC code as a string
 * @internal
 */
export async function gen_data_code_v0(
    stream: Buffer,
    bits: number = DATA_BITS
): Promise<{ iscc: string }> {
    const hasher = new DataHasherV0();
    await hasher.push(stream);

    const dataCode = hasher.code(bits);
    const iscc = 'ISCC:' + dataCode;
    return { iscc };
}

/**
 * Creates a similarity-preserving hash from a data stream.
 * 
 * @param stream - Input data buffer
 * @returns Promise resolving to a Buffer containing the similarity hash
 * @internal
 */
export async function soft_hash_data_v0(stream: Buffer): Promise<Buffer> {
    const hasher = new DataHasherV0();
    await hasher.push(stream);
    return hasher.digest();
}

/**
 * Handles the chunking and hashing of data streams for ISCC Data-Code generation.
 * 
 * The DataHasher uses Content-Defined Chunking (CDC) to split the input stream into
 * variable-sized chunks based on content boundaries. These chunks are then processed
 * using xxHash32 and MinHash to generate a similarity-preserving hash.
 */
export class DataHasherV0 {
    private chunkFeatures: number[] = [];
    private chunkSizes: number[] = [];
    private tail: Buffer | null = null;

    /**
     * Creates a new DataHasher instance.
     */
    constructor() {}

    /**
     * Processes a chunk of data from the input stream.
     * 
     * @param data - Buffer containing the data chunk to process
     * @returns Promise that resolves when the chunk has been processed
     */
    async push(data: Buffer): Promise<void> {
        let localData = data;
        if (this.tail) {
            localData = Buffer.concat([this.tail, data]);
        }

        const newChunkSizes: number[] = [];
        const newChunkFeatures: number[] = [];
        let lastChunk: Buffer | null = null;

        for await (const chunk of algCdcChunks(localData, false)) {
            newChunkSizes.push(chunk.length);
            newChunkFeatures.push(xxHash32(chunk) >>> 0);
            lastChunk = chunk;
        }

        // Only update instance variables after all async operations are complete
        if (newChunkSizes.length > 0) {
            this.chunkSizes.push(...newChunkSizes.slice(0, -1));
            this.chunkFeatures.push(...newChunkFeatures.slice(0, -1));
            this.tail = lastChunk;
        }
    }

    /**
     * Generates the final hash digest.
     * 
     * @returns Buffer containing the final hash
     */
    digest(): Buffer {
        this._finalize();
        return Buffer.from(algMinhash256(this.chunkFeatures.map(BigInt)));
    }

    /**
     * Generates the ISCC code from the processed data.
     * 
     * @param bits - Optional. The number of bits for the hash (default: 64)
     * @returns String containing the encoded ISCC component
     */
    code(bits: number = DATA_BITS): string {
        return encode_component(
            MT.DATA,
            ST.NONE,
            Version.V0,
            bits,
            this.digest().toString('hex')
        );
    }

    /**
     * Finalizes the processing of any remaining data.
     * 
     * @internal
     */
    private _finalize(): void {
        if (this.tail !== null) {
            this.chunkFeatures.push(xxHash32(this.tail) >>> 0);
            this.chunkSizes.push(this.tail.length);
            this.tail = null;
        }
    }
}

/**
 * Alias for the current version of DataHasher.
 */
export const DataHasher = DataHasherV0;
