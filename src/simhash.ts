import { hexBytesToBinary } from './utils';

export function alg_simhash(hash_digests: string[]) {
    const n_bytes: number = Buffer.from(hash_digests[0], 'hex').length;
    const n_bits = n_bytes * 8;
    const vector = new Uint8Array(n_bits);
    for (const digest of hash_digests) {
        const digestBuffer = Buffer.from(digest, 'hex');
        let digestBinary = '';
        for (const b of digestBuffer) {
            digestBinary += hexBytesToBinary(b.toString(16).toString());
        }
        for (const i of [...Array(n_bits).keys()]) {
            vector[i] += parseInt(digestBinary.substring(i, i + 1));
        }
    }
    const minfeatures = hash_digests.length / 2;
    let shash: bigint = BigInt(0);
    for (const i of [...Array(n_bits).keys()]) {
        if (vector[i] >= minfeatures) {
            const shift = BigInt(1) << BigInt(n_bits - 1 - i);
            shash |= shift;
        }
    }
    // fix bug https://github.com/nodejs/node/issues/21242 https://github.com/merkletreejs/merkletreejs/pull/91
    const result = BigInt(shash).toString(16);
    return result.length % 2 ? '0' + result : result;
}
