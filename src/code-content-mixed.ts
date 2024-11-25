    
import { encode_component, decode_base32, decode_header, decode_length ,iscc_clean} from './codec';

import {
    MainTypes,
    MIXED_BITS,
    SubTypes,
    Version
} from './constants';
import { alg_simhash } from './simhash';

export function gen_mixed_code(
    codes: string[],
    bits?: number,
    version?: number
): 
{ iscc: string; parts: string[] } {
    if (!version) {
        version = 0;
    }
    if (version == 0) {
        return gen_mixed_code_v0(codes, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

export function gen_mixed_code_v0(
    codes: string[],
    bits: number = MIXED_BITS
): { iscc: string; parts: string[] } {
    const digests = codes.map(code => decode_base32(iscc_clean(code)));
    
    const digest = soft_hash_codes_v0(digests, bits);
    const mixed_code = encode_component(
        MainTypes.CONTENT,
        SubTypes.MIXED,
        Version.V0,
        bits ? bits : 64,
        digest
    );

    const iscc = 'ISCC:' + mixed_code;
    return { iscc, parts: codes };
}


/**
 * Create a similarity hash from multiple Content-Code digests.
 * 
 * The similarity hash is created from the bodies of the input codes with the first
 * byte of the code-header prepended.
 * 
 * All codes must be of main-type CONTENT and have a minimum length of `bits`.
 * 
 * @param cc_digests - Array of Content-Code digests
 * @param bits - Target bit-length of generated Content-Code-Mixed
 * @returns Similarity preserving byte hash as Uint8Array
 * @throws Error if input validation fails
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
    const code_tuples = cc_digests.map(code => decode_header(
        Buffer.from(code).toString('hex')
    ));

    // Verify all codes are of type CONTENT
    if (!code_tuples.every(ct => ct[0] === MainTypes.CONTENT)) {
        throw new Error(
            'Only codes with main-type CONTENT allowed as input for Content-Code-Mixed'
        );
    }

    // Calculate and verify unit lengths
    const unit_lengths = code_tuples.map(t => decode_length(t[0], t[3]));
    if (!unit_lengths.every(ul => ul >= bits)) {
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
    const hash_bytes_strings = hash_bytes.map(bytes => 
        Buffer.from(bytes).toString('hex')
    );

    return alg_simhash(hash_bytes_strings);
}


