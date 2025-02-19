import { encode_component } from './codec';
import { MT, ST, Version } from './constants';
import { algCdcChunks } from './cdc';
import { algMinhash256 } from './minhash';
import { xxHash32 } from 'js-xxhash';

export async function gen_data_code(
    stream: Buffer,
    bits: number = 64
): Promise<{ iscc: string }> {
    return gen_data_code_v0(stream, bits);
}

export async function gen_data_code_v0(
    stream: Buffer,
    bits: number = 64
): Promise<{ iscc: string }> {
    const hasher = new DataHasherV0();
    await hasher.push(stream);

    const dataCode = hasher.code(bits);
    const iscc = 'ISCC:' + dataCode;
    return { iscc };
}

export async function soft_hash_data_v0(stream: Buffer): Promise<Buffer> {
    const hasher = new DataHasherV0();
    await hasher.push(stream);
    return hasher.digest();
}

export class DataHasherV0 {
    private chunkFeatures: number[] = [];
    private chunkSizes: number[] = [];
    private tail: Buffer | null = null;

    constructor() {}

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

    digest(): Buffer {
        this._finalize();
        return Buffer.from(algMinhash256(this.chunkFeatures.map(BigInt)));
    }

    code(bits: number = 64): string {
        return encode_component(
            MT.DATA,
            ST.NONE,
            Version.V0,
            bits,
            this.digest().toString('hex')
        );
    }

    private _finalize(): void {
        if (this.tail !== null) {
            this.chunkFeatures.push(xxHash32(this.tail) >>> 0);
            this.chunkSizes.push(this.tail.length);
            this.tail = null;
        }
    }
}

export const DataHasher = DataHasherV0;
