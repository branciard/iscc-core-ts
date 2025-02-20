/**
 * Functions for generating ISCC Content-Codes from text input.
 * @module code-content-text
 */

import { TEXT_NGRAM_SIZE } from './constants';
import { text_collapse } from './content-normalization';
import { safeHex, sliding_window } from './utils';
import { algMinhash256 } from './minhash';
import { xxHash32 } from 'js-xxhash';
import { encode_component } from './codec';
import { MT, ST_CC, TEXT_BITS, Version } from './constants';

/**
 * Generates an ISCC Content-Code from text input.
 * 
 * @param text - The input text to generate the code from
 * @param bits - Number of bits for the hash (default: TEXT_BITS)
 * @param version - Version of the ISCC algorithm (default: 0)
 * @returns Object containing the ISCC code and character count
 * @throws Error if version is not 0
 * 
 * @example
 * ```typescript
 * const result = gen_text_code("Hello World");
 * console.log(result.iscc); // "ISCC:CTDZR6DQRS5LNVZV"
 * console.log(result.characters); // 11
 * ```
 */
export function gen_text_code(
    text: string,
    bits?: number,
    version?: number
): {
    iscc: string;
    characters: number;
} {
    if (!version) {
        version = 0;
    }
    if (version == 0) {
        return gen_text_code_v0(text, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

/**
 * Generates an ISCC Content-Code from text input using algorithm v0.
 * 
 * @param text - The input text to generate the code from
 * @param bits - Number of bits for the hash (default: TEXT_BITS)
 * @returns Object containing the ISCC code and character count
 * 
 * @example
 * ```typescript
 * const result = gen_text_code_v0("Hello World");
 * console.log(result.iscc); // "ISCC:CTDZR6DQRS5LNVZV"
 * console.log(result.characters); // 11
 * ```
 */
export function gen_text_code_v0(
    text: string,
    bits?: number
): {
    iscc: string;
    characters: number;
} {
    text = text_collapse(text);
    const characters = text ? text.length : 0;
    const digest = Buffer.from(soft_hash_text_v0(text)).toString('hex');
    const text_code = encode_component(
        MT.CONTENT,
        ST_CC.TEXT,
        Version.V0,
        bits ? bits : TEXT_BITS,
        safeHex(digest)
    );

    const iscc = 'ISCC:' + text_code;
    return {
        iscc: iscc,
        characters: characters
    };
}

/**
 * Creates a 256-bit similarity preserving hash for text input with algorithm v0.
 * 
 * The algorithm:
 * 1. Slides over text with a TEXT_NGRAM_SIZE wide window
 * 2. Creates xxh32 hashes for each window
 * 3. Creates a minhash_256 from the generated hashes
 * 
 * Note: Before passing text to this function it must be:
 * - stripped of markup
 * - normalized
 * - stripped of whitespace
 * - lowercased
 * 
 * @param text - The preprocessed text to hash
 * @returns A 256-bit similarity preserving hash as Uint8Array
 * 
 * @example
 * ```typescript
 * const hash = soft_hash_text_v0("hello world");
 * console.log(Buffer.from(hash).toString('hex'));
 * ```
 */
export function soft_hash_text_v0(text: string): Uint8Array {
    const ngrams = sliding_window(text, TEXT_NGRAM_SIZE);
    const features = ngrams.map((s) => BigInt(xxHash32(s) >>> 0));
    const hash_digest = algMinhash256(features);
    return hash_digest;
}
