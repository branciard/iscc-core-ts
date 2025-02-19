import { hexBytesToBinary, safeHex } from './utils';

export function alg_simhash(hash_digests: string[]) {
    const n_bytes: number = Buffer.from(hash_digests[0], 'hex').length;
    const n_bits = n_bytes * 8;
    const vector = new Uint8Array(n_bits);

    for (const digest of hash_digests) {
        const bytes = Buffer.from(digest, 'hex');
        for (let i = 0; i < n_bits; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            vector[i] +=
                (bytes[byteIndex] & (1 << (7 - bitIndex))) !== 0 ? 1 : 0;
        }
    }

    const minfeatures = hash_digests.length / 2;
    let shash: bigint = BigInt(0);

    for (let i = 0; i < n_bits; i++) {
        if (vector[i] >= minfeatures) {
            shash |= BigInt(1) << BigInt(n_bits - 1 - i);
        }
    }

    return safeHex(shash);
}
