import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';
import { createBLAKE3 } from 'hash-wasm';
import { encode_component } from './codec';
import { MT, ST, Version } from './constants';

/**
 * Handles the hashing of data streams for ISCC Instance-Code generation.
 * 
 * The InstanceHasher uses the BLAKE3 cryptographic hash function to create
 * unique identifiers for exact binary content. It also maintains file size
 * information and generates multihash-encoded hashes.
 * 
 * @internal
 */
export class InstanceHasherV0 {
    /**
     * Creates a new InstanceHasher instance.
     * @param hasher - BLAKE3 hasher implementation
     */
    private constructor(hasher: IHasher) {
        this.hasher = hasher;
        this.hasher.init();
    }

    /**
     * Factory method to create a new InstanceHasher.
     * @returns Promise resolving to a new InstanceHasher instance
     */
    static async create(): Promise<InstanceHasherV0> {
        const hasher = await createBLAKE3();
        return new InstanceHasherV0(hasher);
    }

    /**
     * Processes a chunk of data from the input stream.
     * 
     * @param data - Buffer containing the data chunk to process
     * @returns Promise that resolves when the chunk has been processed
     */
    async push(data: Buffer): Promise<void> {
        this.filesize += data.length;
        this.hasher.update(data);
    }

    /**
     * Generates the final hash digest.
     * 
     * @returns Promise resolving to the hex-encoded hash string
     */
    async digest(): Promise<string> {
        const digest = this.hasher.digest('binary');
        this.multihash = Buffer.from([
            ...InstanceHasherV0.mh_prefix,
            ...digest
        ]).toString('hex');
        return Buffer.from(digest).toString('hex');
    }

    /**
     * Generates the ISCC code from the processed data.
     * 
     * @param bits - Number of bits for the hash
     * @returns Promise resolving to the encoded ISCC component
     */
    async code(bits: number): Promise<string> {
        return encode_component(
            MT.INSTANCE,
            ST.NONE,
            Version.V0,
            bits,
            await this.digest()
        );
    }

    /** Total size of processed data in bytes */
    public filesize: number = 0;

    /** Multihash-encoded BLAKE3 hash (hex string) */
    public multihash: string | null = null;

    /** Multihash prefix for BLAKE3 */
    private static mh_prefix: Uint8Array = new Uint8Array([0x1e, 0x20]);

    private hasher: IHasher;
}

/**
 * Alias for the current version of InstanceHasher.
 */
export const InstanceHasher = InstanceHasherV0; 