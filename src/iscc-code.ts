import {
    decode_header,
    decode_base32,
    decode_length,
    iscc_clean,
    encode_units,
    encode_base32,
    encode_header_to_uint8Array
} from './codec';
import { MT, ST, ST_ISCC, Version, IsccTuple } from './constants';

/**
 * Combine multiple ISCC-UNITs to a composite ISCC-CODE with a common header.
 * 
 * Creates a composite ISCC code by combining multiple individual ISCC units
 * using the latest standard algorithm. The composite code maintains relationships
 * between different aspects of the same content.
 * 
 * @param codes - Array of valid singular ISCC codes
 * @returns Object containing the composite ISCC code
 * @throws {Error} If input validation fails:
 *   - Fewer than 2 codes provided
 *   - Codes shorter than 64 bits
 *   - Missing required DATA and INSTANCE units
 *   - Mismatched SubTypes between Semantic and Content codes
 * 
 * @example
 * ```typescript
 * const codes = [
 *   "ISCC:KACYPNRYMQKG", // Content Code
 *   "ISCC:EAAQ5PRYMQKG", // Data Code
 *   "ISCC:MAAQAPRYMQKG"  // Instance Code
 * ];
 * const result = gen_iscc_code(codes);
 * console.log(result.iscc); // Outputs composite ISCC code
 * ```
 */
export function gen_iscc_code(codes: string[]): { iscc: string } {
    return gen_iscc_code_v0(codes);
}

/**
 * Combine multiple ISCC-UNITs to a composite ISCC-CODE using algorithm v0.
 * 
 * Implementation of version 0 of the ISCC code generation algorithm.
 * 
 * The process:
 * 1. Cleans and validates input codes
 * 2. Decodes and sorts units by MainType
 * 3. Determines appropriate SubType
 * 4. Concatenates unit digests
 * 5. Generates composite header
 * 
 * @param codes - Array of valid singular ISCC codes
 * @returns Object containing the composite ISCC code
 * @throws {Error} If input validation fails
 * @internal
 */
export function gen_iscc_code_v0(codes: string[], wide = false): { iscc: string } {
    codes = codes.map((code) => iscc_clean(code));

    // Check basic constraints
    if (codes.length < 2) {
        throw new Error(
            'Minimum two ISCC units required to generate valid ISCC-CODE'
        );
    }
    for (const code of codes) {
        if (code.length < 16) {
            throw new Error(
                `Cannot build ISCC-CODE from units shorter than 64-bits: ${code}`
            );
        }
    }
    // Decode units and sort by MainType
    const decoded = codes
        .map((code) =>
            decode_header(Buffer.from(decode_base32(code)).toString('hex'))
        )
        .sort((a, b) => a[0] - b[0]);

    const main_types = decoded.map((d) => d[0]);
    if (
        main_types[main_types.length - 2] !== MT.DATA ||
        main_types[main_types.length - 1] !== MT.INSTANCE
    ) {
        throw new Error(
            'ISCC-CODE requires at least MT.DATA and MT.INSTANCE units.'
        );
    }

    // Check if this is a special case of 128-bit Data+Instance composite
    const is_wide_composite = (
        wide
        && codes.length === 2
        && main_types[0] === MT.DATA && main_types[1] === MT.INSTANCE
        && decoded.every(t => decode_length(t[0], t[3]) >= 128)
    );

    // Determine SubType (generic mediatype)
    let st: number;
    if (is_wide_composite) {
        st = ST_ISCC.WIDE;
    } else {
        const sub_types = decoded
            .filter((t) => t[0] === MT.SEMANTIC || t[0] === MT.CONTENT)
            .map((t) => t[1]);

        if (new Set(sub_types).size > 1) {
            throw new Error(
                'Semantic-Code and Content-Code must be of same SubType'
            );
        }

        st = sub_types.length > 0
            ? sub_types[sub_types.length - 1]
            : codes.length === 2
              ? ST_ISCC.SUM
              : ST_ISCC.NONE;
    }

    // Encode unit combination
    const encoded_length = encode_units(main_types.slice(0, -2));

    // Collect unit digests
    let digest: Buffer;
    if (is_wide_composite) {
        // For wide case, use full 128-bit digests
        digest = concatenateDigests(decoded, 16);
    } else {
        // For standard case, truncate unit digests to 64-bit
        digest = concatenateDigests(decoded, 8);
    }
    const header = encode_header_to_uint8Array(
        MT.ISCC,
        st,
        Version.V0,
        encoded_length
    );
    const code = encode_base32(Buffer.concat([header, digest]).toString('hex'));
    const iscc = 'ISCC:' + code;
    return { iscc };
}

/**
 * Concatenates digest portions of decoded ISCC tuples.
 * 
 * Takes an array of decoded ISCC tuples and concatenates their digest portions,
 * truncating each to the specified number of bytes.
 * 
 * @param decoded - Array of decoded ISCC tuples
 * @param bytesPerDigest - Number of bytes to take from each digest (default: 8)
 * @returns Buffer containing concatenated digests
 * @internal
 */
function concatenateDigests(decoded: IsccTuple[], bytesPerDigest = 8): Buffer {
    // Pre-allocate buffer for all 8-byte chunks
    const digestLength = decoded.length * bytesPerDigest;
    const result = Buffer.alloc(digestLength);

    // Copy each 8-byte chunk to the result buffer
    decoded.forEach((tuple, index) => {
        const digestBytes = tuple[4]; // Get the Uint8Array from the tuple
        const truncated = digestBytes.subarray(0, bytesPerDigest);
        result.set(truncated, index * bytesPerDigest);
    });

    return result;
}
