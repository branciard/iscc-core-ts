import { safeHex } from './utils';

/**
 * Convert a hex string to a Uint8Array without Buffer dependency.
 * @internal
 */
function hexToBytes(hex: string): Uint8Array {
    const len = hex.length >>> 1;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

/**
 * Calculate a similarity-preserving hash from a list of hex-encoded hash digests.
 *
 * @param hash_digests - Array of hex-encoded hash digests (must be non-empty, equal length)
 * @returns Hex-encoded SimHash digest
 */
export function alg_simhash(hash_digests: string[]): string {
    if (hash_digests.length === 0) {
        throw new Error('alg_simhash requires at least one hash digest');
    }

    const n_bytes = hash_digests[0].length >>> 1;
    const n_bits = n_bytes * 8;
    const vector = new Int32Array(n_bits);

    for (const digest of hash_digests) {
        const bytes = hexToBytes(digest);
        for (let i = 0; i < n_bits; i++) {
            if ((bytes[i >>> 3] & (1 << (7 - (i & 7)))) !== 0) {
                vector[i]++;
            }
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
