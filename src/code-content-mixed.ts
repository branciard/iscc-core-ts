import {
    encode_component,
    decode_base32,
    decode_header,
    decode_length,
    iscc_clean
} from './codec';

import { MT, ST_CC, MIXED_BITS, Version } from './constants';
import { alg_simhash } from './simhash';

/**
 * Generates an ISCC Mixed Code from multiple ISCC Content Codes.
 * 
 * The Mixed Code is a composite similarity hash generated from multiple Content Codes.
 * It can be used to identify content that shares elements from multiple sources.
 * 
 * @param codes - Array of ISCC Content Code strings to combine
 * @param bits - Optional. The number of bits for the similarity hash. Must be multiple of 32 (default: MIXED_BITS)
 * @param version - Optional. ISCC version number (currently only 0 is supported)
 * @returns Object containing the ISCC Mixed Code and the original input codes
 * @throws {Error} If an unsupported version is provided
 * 
 * @example
 * ```typescript
 * const codes = [
 *   "ISCC:KACYPXWxxxxx", // Content Code 1
 *   "ISCC:KACYPXWyyyyy"  // Content Code 2
 * ];
 * const result = gen_mixed_code(codes, 64, 0);
 * console.log(result.iscc);  // Outputs: "ISCC:..."
 * console.log(result.parts); // Original input codes
 * ```
 */
export function gen_mixed_code(
    codes: string[],
    bits?: number,
    version?: number
): { iscc: string; parts: string[] } {
    if (!version) {
        version = 0;
    }
    if (version == 0) {
        return gen_mixed_code_v0(codes, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

/**
 * Generates a version 0 ISCC Mixed Code from multiple Content Codes.
 * 
 * @param codes - Array of ISCC Content Code strings to combine
 * @param bits - Optional. The number of bits for the similarity hash (default: MIXED_BITS)
 * @returns Object containing the ISCC Mixed Code and the original input codes
 * @internal
 */
export function gen_mixed_code_v0(
    codes: string[],
    bits: number = MIXED_BITS
): { iscc: string; parts: string[] } {
    const digests = codes.map((code) => decode_base32(iscc_clean(code)));

    const digest = soft_hash_codes_v0(digests, bits);
    const mixed_code = encode_component(
        MT.CONTENT,
        ST_CC.MIXED,
        Version.V0,
        bits ? bits : 64,
        digest
    );

    const iscc = 'ISCC:' + mixed_code;
    return { iscc, parts: codes };
}

/**
 * Creates a similarity hash from multiple Content-Code digests.
 * 
 * The similarity hash is created by:
 * 1. Validating input codes (minimum 2 codes, all CONTENT type)
 * 2. Retaining the first byte of each code's header
 * 3. Combining with truncated body bytes
 * 4. Generating a similarity-preserving hash
 * 
 * @param cc_digests - Array of Content-Code digests as Uint8Arrays
 * @param bits - Target bit-length of generated Content-Code-Mixed (default: MIXED_BITS)
 * @returns Similarity-preserving hash as a hex string
 * @throws {Error} If input validation fails:
 *   - Fewer than 2 codes provided
 *   - Non-CONTENT type codes included
 *   - Codes shorter than required bit length
 * 
 * @example
 * ```typescript
 * const digests = [
 *   new Uint8Array([...]), // Content Code digest 1
 *   new Uint8Array([...])  // Content Code digest 2
 * ];
 * const hash = soft_hash_codes_v0(digests, 64);
 * ```
 */
export function soft_hash_codes_v0(
    cc_digests: Uint8Array[],
    bits: number = MIXED_BITS
): string {
    // Check minimum number of codes
    if (!(cc_digests.length > 1)) {
        throw new Error('Minimum of 2 codes needed for Content-Code-Mixed.');
    }

    const nbytes = Math.floor(bits / 8);

    // Decode headers for all digests
    const code_tuples = cc_digests.map((code) =>
        decode_header(Buffer.from(code).toString('hex'))
    );

    // Verify all codes are of type CONTENT
    if (!code_tuples.every((ct) => ct[0] === MT.CONTENT)) {
        throw new Error(
            'Only codes with main-type CONTENT allowed as input for Content-Code-Mixed'
        );
    }

    // Calculate and verify unit lengths
    const unit_lengths = code_tuples.map((t) => decode_length(t[0], t[3]));
    if (!unit_lengths.every((ul) => ul >= bits)) {
        throw new Error(`Code too short for ${bits}-bit length`);
    }

    // Create hash bytes array
    const hash_bytes: Uint8Array[] = [];

    // Retain the first byte of the header and strip body to mixed_bits length
    for (let i = 0; i < cc_digests.length; i++) {
        const full = cc_digests[i];
        const code_tuple = code_tuples[i];

        // Combine first byte of header with truncated body
        const headerByte = full.slice(0, 1);
        const bodyBytes = code_tuple[4].slice(0, nbytes - 1);
        const combined = new Uint8Array(nbytes);
        combined.set(headerByte);
        combined.set(bodyBytes, 1);

        hash_bytes.push(combined);
    }
    // Convert Uint8Array array to hex string array
    const hash_bytes_strings = hash_bytes.map((bytes) =>
        Buffer.from(bytes).toString('hex')
    );

    return alg_simhash(hash_bytes_strings);
}
