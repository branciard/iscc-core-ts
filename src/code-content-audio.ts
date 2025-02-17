
import { encode_component } from './codec';
import {
    MT,
    ST_CC,
    Version
} from './constants';
import { safeHex } from './utils';

/**
 * 
*The Content-Code Audio is generated from a Chromaprint fingerprint provided as a vector of 32-bit
signed integers. The [iscc-sdk](https://github.com/iscc/iscc-sdk) uses
[fpcalc](https://acoustid.org/chromaprint) to extract Chromaprint vectors with the following
command line parameters:

`$ fpcalc -raw -json -signed -length 0 myaudiofile.mp3`
 */


export function gen_audio_code(
    chromaprint: number[],
    bits?: number,
    version?: number
): {
    iscc: string
}{
    if (!version) {
        version = 0;
    }
    if (version == 0) {
        return gen_audio_code_v0(chromaprint, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

/**
*
* @param name
* @param description
* @returns
*/

export function gen_audio_code_v0(
    chromaprint: number[],
    bits?: number
): {
    iscc: string
} {


    const digest = Buffer.from(soft_hash_audio_v0(chromaprint,bits ? bits : 64)).toString('hex');
    const audio_code = encode_component(
        MT.CONTENT,
        ST_CC.AUDIO,
        Version.V0,
        bits ? bits : 64,
        safeHex(digest)
    );

    const iscc = 'ISCC:' + audio_code;
    return {
        iscc: iscc
    };
}


export function soft_hash_audio_v0(cv: Iterable<number>, bits: number = 64): Uint8Array {
    /**
     * Create audio similarity hash from a chromaprint vector.
     *
     * @param cv - Chromaprint vector
     * @param bits - Bit-length resulting similarity hash (multiple of 32)
     * @return Audio-Hash digest
     */

    // Convert chromaprint vector into list of 4 byte digests
    const digests = Array.from(cv).map(intFeature => 
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
    const sortedDigests = cvs.map(intFeature => 
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
            vector[i] += (digest[byteIndex] & (1 << (7 - bitIndex))) !== 0 ? 1 : 0;
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

function* divide<T>(n: number, iterable: Iterable<T>): Generator<T[]> {
    const arr = Array.from(iterable);
    const chunkSize = Math.ceil(arr.length / n);
    for (let i = 0; i < n; i++) {
        yield arr.slice(i * chunkSize, (i + 1) * chunkSize);
    }
}

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

function bigIntToUint8Array(bigInt: bigint, byteLength: number): Uint8Array {
    const result = new Uint8Array(byteLength);
    let tempBigInt = BigInt(bigInt); // Create a copy to avoid modifying the original
    for (let i = 0; i < byteLength; i++) {
        result[byteLength - 1 - i] = Number(tempBigInt & 255n);
        tempBigInt = tempBigInt >> 8n;
    }
    return result;
}