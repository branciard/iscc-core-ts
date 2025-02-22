import {
    decode_header,
    decode_base32,
    iscc_clean,
    encode_units,
    encode_base32,
    encode_header_to_uint8Array
} from './codec';
import { MT, ST_ISCC, Version, IsccTuple } from './constants';

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
export function gen_iscc_code_v0(codes: string[]): { iscc: string } {
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

    // Determine SubType (generic mediatype)
    const sub_types = decoded
        .filter((t) => t[0] === MT.SEMANTIC || t[0] === MT.CONTENT)
        .map((t) => t[1]);

    if (new Set(sub_types).size > 1) {
        throw new Error(
            'Semantic-Code and Content-Code must be of same SubType'
        );
    }

    const st =
        sub_types.length > 0
            ? sub_types[sub_types.length - 1]
            : codes.length === 2
              ? ST_ISCC.SUM
              : ST_ISCC.NONE;

    // Encode unit combination
    const encoded_length = encode_units(main_types.slice(0, -2));

    // Collect and truncate unit digests to 64-bit
    const digest = concatenateDigests(decoded);
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
 * truncating each to 8 bytes to create the composite digest.
 * 
 * @param decoded - Array of decoded ISCC tuples
 * @returns Buffer containing concatenated digests
 * @internal
 */
function concatenateDigests(decoded: IsccTuple[]): Buffer {
    // Pre-allocate buffer for all 8-byte chunks
    const digestLength = decoded.length * 8;
    const result = Buffer.alloc(digestLength);

    // Copy each 8-byte chunk to the result buffer
    decoded.forEach((tuple, index) => {
        const digestBytes = tuple[4]; // Get the Uint8Array from the tuple
        const truncated = digestBytes.subarray(0, 8); // Take first 8 bytes
        result.set(truncated, index * 8); // Copy to result at correct offset
    });

    return result;
}
