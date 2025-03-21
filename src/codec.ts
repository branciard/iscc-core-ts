import { base32, base64url, base32hex } from 'rfc4648';
import bs58 from 'bs58';
import { binaryArrayToUint8Array, rtrim } from './utils';
import {
    CANONICAL_REGEX,
    MT,
    MC_PREFIX_BUFFER,
    MULTIBASE,
    PREFIXES,
    ST,
    ST_ISCC,
    SUBTYPE_MAP,
    ST_CC,
    UNITS,
    Version
} from './constants';
import { gen_iscc_code_v0 } from './iscc-code';

/**
 * Converts a Uint8Array to a hexadecimal string.
 * 
 * @param bytes - Array of bytes to convert
 * @returns Hexadecimal string representation
 */
export function toHexString(bytes: Uint8Array): string {
    let result = '';
    for (const byte of bytes) {
        if (byte > 15) {
            result += (byte & 0xff).toString(16);
        } else {
            result += '0' + (byte & 0xff).toString(16);
        }
    }
    return result;
}

/**
 * Encodes the length of an ISCC code based on its main type.
 * 
 * @param mtype - Main type of the ISCC code
 * @param length - Length value to encode
 * @returns Encoded length value
 * @throws Error if length is invalid for the given MainType
 */
export function encode_length(mtype: MT, length: number): number {
    const error =
        'Invalid length [' + length + '] for MainType [' + mtype + ']';
    if (
        mtype == MT.META ||
        mtype == MT.SEMANTIC ||
        mtype == MT.CONTENT ||
        mtype == MT.DATA ||
        mtype == MT.INSTANCE ||
        mtype == MT.FLAKE
    ) {
        if (length >= 32 && length % 32 == 0) {
            return Math.floor(length / 32) - 1;
        } else {
            throw Error(error);
        }
    } else if (mtype == MT.ISCC) {
        if (0 <= length && length <= 7) {
            return length;
        } else {
            throw Error(error);
        }
    } else if (mtype == MT.ID) {
        if (64 <= length && length <= 96) {
            return Math.floor((length - 64) / 8);
        } else {
            throw Error('MainType [' + mtype + '] is not a unit');
        }
    } else {
        throw Error(error);
    }
}

/**
 * Decodes raw length value from ISCC header to length of digest in bits.
 * 
 * @param mtype - Main type of the ISCC code
 * @param length - Raw length value from header
 * @returns Number of bits
 * @throws Error if length is invalid for the given MainType
 */
export function decode_length(mtype: MT, length: number): number {
    if (
        mtype === MT.META ||
        mtype === MT.SEMANTIC ||
        mtype === MT.CONTENT ||
        mtype === MT.DATA ||
        mtype === MT.INSTANCE ||
        mtype === MT.FLAKE
    ) {
        return (length + 1) * 32;
    } else if (mtype === MT.ISCC) {
        return decode_units(length).length * 64 + 128;
    } else if (mtype === MT.ID) {
        return length * 8 + 64;
    } else {
        throw new Error(`Invalid length ${length} for MainType ${mtype}`);
    }
}

/**
 * Encodes ISCC header components into a hex string.
 * 
 * @param mtype - Main type of the ISCC code
 * @param stype - Subtype of the ISCC code
 * @param version - Version number
 * @param length - Length value
 * @returns Hex string representation of header
 */
export function encode_header(
    mtype: MT,
    stype: ST | ST_CC | ST_ISCC ,
    version: Version,
    length: number
): string {
    return toHexString(
        encode_header_to_uint8Array(mtype, stype as ST_CC | ST_ISCC.SUM | ST_ISCC.NONE | ST.NONE, version, length)
    );
}

export function encode_header_to_uint8Array(
    mtype: MT,
    stype: ST_CC | ST_ISCC.SUM | ST_ISCC.NONE | ST.NONE,
    version: Version,
    length: number
): Uint8Array {
    let header = '';
    for (const n of [
        mtype.valueOf(),
        stype.valueOf(),
        version.valueOf(),
        length
    ]) {
        header += encode_varnibble(n);
    }
    return binaryArrayToUint8Array(header);
}

/**
 * Decodes varnibble encoded header and returns it together with tail data.
 * 
 * Tail data is included to enable decoding of sequential ISCCs. The returned tail
 * data must be truncated to decode_length(r[0], r[3]) bits to recover the actual
 * hash-bytes.
 * 
 * @param data - Hex string of ISCC bytes
 * @returns Tuple of [MainType, SubType, Version, length, TailData]
 */
export function decode_header(
    data: string
): [MT, ST_CC | ST.NONE, Version, number, Uint8Array] {
    // Validate input
    if (!data || typeof data !== 'string') {
        throw new Error('Input must be a non-empty string');
    }
    if (!/^[0-9A-Fa-f]+$/.test(data)) {
        throw new Error('Input must be a valid hex string');
    }
    if (data.length % 2 !== 0) {
        throw new Error('Hex string must have even length');
    }
    const result: number[] = [];
    let binaryString = '';

    // Convert hex to binary string
    for (let i = 0; i < data.length; i += 2) {
        const byte = parseInt(data.slice(i, i + 2), 16);
        binaryString += byte.toString(2).padStart(8, '0');
    }

    // Decode 4 varnibbles
    let remainingBits = binaryString;
    for (let i = 0; i < 4; i++) {
        const [value, remaining] = decode_varnibble(remainingBits);
        result.push(value);
        remainingBits = remaining;
    }

    // Strip 4-bit padding if required
    if (
        remainingBits.length % 8 !== 0 &&
        remainingBits.slice(0, 4) === '0000'
    ) {
        remainingBits = remainingBits.slice(4);
    }

    // Convert remaining binary string to Uint8Array
    const bytes = new Uint8Array(Math.ceil(remainingBits.length / 8));
    for (let i = 0; i < remainingBits.length; i += 8) {
        const byte = remainingBits.slice(i, i + 8).padEnd(8, '0');
        bytes[i / 8] = parseInt(byte, 2);
    }

    return [
        result[0] as MT,
        result[1] as ST_CC | ST.NONE,
        result[2] as Version,
        result[3],
        bytes
    ];
}

/**
 * Encodes a number into a variable-length nibble representation.
 * 
 * @param n - Number to encode (0-4679)
 * @returns Binary string representation
 * @throws Error if input is not an integer or out of range
 * @internal
 */
export function encode_varnibble(n: number): string {
    if (!Number.isInteger(n)) {
        throw new Error('encode_varnibble - Input must be an integer');
    }
    if (0 <= n && n < 8) {
        return n.toString(2).padStart(4, '0');
        //  return new BitSet(n).toString().padStart(4,"0");
    } else if (8 <= n && n < 72) {
        //  return new BitSet("10").toString() + new BitSet(n-8).toString().padStart(6,"0");
        return '10' + (n - 8).toString(2).padStart(6, '0');
    } else if (72 <= n && n < 584) {
        return '110' + (n - 72).toString(2).padStart(9, '0');
        //  return new BitSet("110").toString() + new BitSet(n-72).toString().padStart(9,"0");
    } else if (584 <= n && n < 4680) {
        return '1110' + (n - 584).toString(2).padStart(12, '0');
        // return new BitSet("1110").toString() + new BitSet(n-584).toString().padStart(12,"0");
    } else {
        throw Error('encode_varnibble - Value must be between 0 and 4679');
    }
}

/**
 * Decodes a variable-length nibble from a binary string.
 * 
 * @param b - Binary string to decode
 * @returns Tuple of [decoded value, remaining bits]
 * @throws Error if input is invalid
 * @internal
 */
export function decode_varnibble(b: string): [number, string] {
    if (!/^[01]+$/.test(b)) {
        throw new Error(
            'Input must be a binary string (containing only 0s and 1s)'
        );
    }
    const bits = b.length;

    if (bits >= 4 && b[0] === '0') {
        return [parseInt(b.slice(0, 4), 2), b.slice(4)];
    }
    if (bits >= 8 && b[1] === '0') {
        return [parseInt(b.slice(2, 8), 2) + 8, b.slice(8)];
    }
    if (bits >= 12 && b[2] === '0') {
        return [parseInt(b.slice(3, 12), 2) + 72, b.slice(12)];
    }
    if (bits >= 16 && b[3] === '0') {
        return [parseInt(b.slice(4, 16), 2) + 584, b.slice(16)];
    }

    throw new Error('Invalid bitarray');
}

/**
 * Encodes an ISCC component from its parts.
 * 
 * @param mtype - Main type
 * @param stype - Subtype
 * @param version - Version number
 * @param bit_length - Length in bits
 * @param digest - Hash digest
 * @returns Encoded ISCC component
 */
export function encode_component(
    mtype: MT,
    stype: ST_CC | ST_ISCC.NONE | ST_ISCC.SUM | ST.NONE,
    version: Version,
    bit_length: number,
    digest: string
): string {
    if (
        mtype == MT.META ||
        mtype == MT.SEMANTIC ||
        mtype == MT.CONTENT ||
        mtype == MT.DATA ||
        mtype == MT.INSTANCE ||
        mtype == MT.ID ||
        mtype == MT.FLAKE
    ) {
        const encoded_length: number = encode_length(mtype, bit_length);
        const nbytes = Math.floor(bit_length / 8);
        const header = encode_header(mtype, stype, version, encoded_length);
        const body = digest.substring(0, nbytes * 2);
        const component_code = encode_base32(header + body);
        return component_code;
    } else if (mtype == MT.ISCC) {
        throw Error('{mtype} ISCC is not a unit');
    } else {
        throw Error('Illegal MainType');
    }
}

export function encode_base32(data: string) {
    /*
    Standard RFC4648 base32 encoding without padding.
  */
    return rtrim(base32.stringify(Buffer.from(data, 'hex')), '=');
}

export function decode_base32(code: string): Uint8Array {
    /*
    Standard RFC4648 base32 decoding without padding and with casefolding.
    */
    // Add padding since rfc4648 requires it
    const codeLength = code.length;
    const padLength = Math.ceil(codeLength / 8) * 8 - codeLength;
    const paddedCode = code + '='.repeat(padLength);

    // Decode with case-insensitive option
    return base32.parse(paddedCode.toUpperCase());
}

export function encode_base32hex(data: string): string {
    /*
    Standard RFC4648 base64url encoding without padding.
    */
    return rtrim(base32hex.stringify(Buffer.from(data, 'hex')), '=');
}

export function decode_base32hex(code: string): Uint8Array {
    /*
    Standard RFC4648 base32 decoding without padding and with casefolding.
    */
    // Add padding since rfc4648 requires it
    const codeLength = code.length;
    const padLength = Math.ceil(codeLength / 8) * 8 - codeLength;
    const paddedCode = code + '='.repeat(padLength);

    // Decode with case-insensitive option
    return base32hex.parse(paddedCode.toUpperCase());
}

export function encode_base58(data: Uint8Array): string {
    return bs58.encode(data);
}

export function decode_base58(code: string): Uint8Array {
    return bs58.decode(code);
}

export function encode_base64(data: string): string {
    /*
    Standard RFC4648 base64url encoding without padding.
    */
    return rtrim(base64url.stringify(Buffer.from(data, 'hex')), '=');
}

export function decode_base64(code: string): Uint8Array {
    /*
    Standard RFC4648 base64url decoding without padding.
    */
    // Add padding since rfc4648 requires it
    const padding = 4 - (code.length % 4);
    const paddedCode = code + '='.repeat(padding);

    return base64url.parse(paddedCode);
}

/**
 * Cleanup ISCC string by removing scheme, dashes, and whitespace.
 * 
 * @param iscc - Any valid ISCC string
 * @returns Cleaned ISCC string
 * @throws Error if scheme is invalid or ISCC string is malformed
 */
export function iscc_clean(iscc: string): string {
    const split = iscc
        .trim()
        .split(':')
        .map((part) => part.trim());

    if (split.length === 1) {
        let code = split[0];
        // remove dashes if not multiformat
        if (!(code[0] in MULTIBASE)) {
            code = code.replace(/-/g, '');
        }
        return code;
    } else if (split.length === 2) {
        const [scheme, code] = split;
        if (scheme.toLowerCase() !== 'iscc') {
            throw new Error(`Invalid scheme: ${scheme}`);
        }
        return code.replace(/-/g, '');
    } else {
        throw new Error(`Malformed ISCC string: ${iscc}`);
    }
}

/**
 * Normalize an ISCC to its canonical form.
 *
 * The canonical form of an ISCC is its shortest base32 encoded representation
 * prefixed with the string `ISCC:`.
 *
 * Possible valid inputs:
 *     MEACB7X7777574L6
 *     ISCC:MEACB7X7777574L6
 *     fcc010001657fe7cafe9791bb
 *     iscc:maagztfqttvizpjr
 *     Iscc:Maagztfqttvizpjr
 *
 * A concatenated sequence of codes will be composed into a single ISCC of MainType
 * `MT.ISCC` if possible.
 *
 * Example:
 *     iscc_normalize("GAAW2PRCRS5LNVZV-IAAUVACQKXE3V44W")
 *     returns 'ISCC:KUAG2PRCRS5LNVZVJKAFAVOJXLZZM'
 *
 * @param iscc_code Any valid ISCC string
 * @returns Normalized ISCC string
 */
export function iscc_normalize(iscc_code: string): string {
    // Handle multiformat encoding first
    iscc_code = normalize_multiformat(iscc_code);

    // Validate prefix
    const prefix = iscc_code.toUpperCase().slice(0, 2);
    if (!PREFIXES.includes(prefix as any)) {
        throw new Error(`ISCC starts with invalid prefix ${prefix}`);
    }

    const decomposed = iscc_decompose(iscc_code);
    const recomposed =
        decomposed.length >= 2
            ? gen_iscc_code_v0(decomposed).iscc
            : decomposed[0];

    return recomposed.startsWith('ISCC:') ? recomposed : `ISCC:${recomposed}`;
}

/**
 * Validate that a given string is a *strictly well-formed* ISCC.
 *
 * A *strictly well-formed* ISCC is:
 * - an ISCC-CODE or ISCC-UNIT
 * - encoded with base32 upper without padding
 * - has a valid combination of header values
 * - is represented in its canonical form
 *
 * @param iscc - ISCC string
 * @param strict - Throw an error if validation fails (default true)
 * @returns True if string is valid else false (throws Error in strict mode)
 */
export function iscc_validate(iscc: string, strict = true): boolean {
    // Basic regex validation
    const match = CANONICAL_REGEX.test(iscc);
    if (!match) {
        if (strict) {
            throw new Error(
                'ISCC string does not match ^ISCC:[A-Z2-7]{10,68}$'
            );
        }
        return false;
    }

    const cleaned = iscc_clean(iscc);

    // Prefix test
    const prefix: string = cleaned.slice(0, 2);
    if (!PREFIXES.includes(prefix as any)) {
        if (strict) {
            throw new Error(`Header starts with invalid sequence ${prefix}`);
        }
        return false;
    }

    // Base32 encoding test
    try {
        decode_base32(iscc.split(':')[1]);
    } catch (e) {
        if (strict) {
            throw new Error(e instanceof Error ? e.message : String(e));
        }
        return false;
    }

    const [m, , v, l, t] = decode_header(
        Buffer.from(decode_base32(cleaned)).toString('hex')
    );
    // Version test
    if (v !== 0) {
        if (strict) {
            throw new Error(`Unknown version ${v} in version header`);
        }
        return false;
    }

    // Length test
    const expected_nbytes = Math.floor(decode_length(m, l) / 8);
    const actual_nbytes = t.length;
    if (expected_nbytes !== actual_nbytes) {
        if (strict) {
            throw new Error(
                `Header expects ${expected_nbytes} but got ${actual_nbytes} bytes`
            );
        }
        return false;
    }

    return true;
}

/**
 * Validate that a given string is a well-formed ISCC in any supported encoding format.
 *
 * @param iscc - ISCC string in any supported encoding
 * @param strict - Throw an error if validation fails (default true)
 * @returns True if string is valid else false (throws Error in strict mode)
 */
export function iscc_validate_mf(iscc: string, strict = true): boolean {
    try {
        const normalized = normalize_multiformat(iscc);
        return iscc_validate(`ISCC:${normalized}`, strict);
    } catch (e) {
        if (strict) {
            throw e;
        }
        return false;
    }
}

/**
 * Decomposes an ISCC code into its component parts.
 * 
 * @param iscc_code - ISCC code to decompose
 * @returns Array of component strings
 */
export function iscc_decompose(iscc_code: string): string[] {
    // Handle multiformat encoding first
    iscc_code = normalize_multiformat(iscc_code);

    const components: string[] = [];
    let raw_code = decode_base32(iscc_code);

    while (raw_code.length > 0) {
        const [mt, st, vs, ln, body] = decode_header(
            Buffer.from(raw_code).toString('hex')
        );

        // standard ISCC-UNIT with tail continuation
        if (mt !== MT.ISCC) {
            const ln_bits = decode_length(mt, ln);
            const bytesCount = Math.floor(ln_bits / 8);
            const code = encode_component(
                mt,
                st,
                vs,
                ln_bits,
                Buffer.from(body.slice(0, bytesCount)).toString('hex')
            );
            components.push(code);
            raw_code = body.slice(bytesCount);
            continue;
        }

        // ISCC-CODE
        const main_types = decode_units(ln);

        // rebuild dynamic units (META, SEMANTIC, CONTENT)
        for (let idx = 0; idx < main_types.length; idx++) {
            const mtype = main_types[idx];
            const stype = mtype === MT.META ? ST.NONE : st;
            const code = encode_component(
                mtype,
                stype,
                vs,
                64,
                Buffer.from(body.slice(idx * 8)).toString('hex')
            );
            components.push(code);
        }

        // rebuild static units (DATA, INSTANCE)
        const data_code = encode_component(
            MT.DATA,
            ST.NONE,
            vs,
            64,
            Buffer.from(body.slice(-16, -8)).toString('hex')
        );
        const instance_code = encode_component(
            MT.INSTANCE,
            ST.NONE,
            vs,
            64,
            Buffer.from(body.slice(-8)).toString('hex')
        );
        components.push(data_code, instance_code);
        break;
    }

    return components;
}

/**
 * Decodes an ISCC string into its components
 * @param iscc - ISCC string to decode
 * @returns Tuple containing [MainType, SubType, Version, length, TailData]
 * @throws Error if ISCC string is invalid
 */
export function iscc_decode(
    iscc: string
): [MT, ST_CC | ST.NONE, Version, number, Uint8Array] {
    const cleaned = iscc_clean(iscc_normalize(iscc));
    const data = decode_base32(cleaned);
    return decode_header(Buffer.from(data).toString('hex'));
}

/**
 * Convert ISCC to a human-readable representation
 *
 * @param iscc - ISCC string
 * @returns Human-readable representation of ISCC
 */
export function iscc_explain(iscc: string): string {
    const tid = iscc_type_id(iscc);
    const [mt, , , , data] = iscc_decode(iscc);

    if (mt === MT.ID) {
        const counterBytes = data.slice(8);
        if (counterBytes.length > 0) {
            const counter = decode_uvarint(counterBytes);
            const hexHash = Buffer.from(data.slice(0, 8)).toString('hex');
            return `${tid}-${hexHash}-${counter}`;
        }
    }

    const hexHash = Buffer.from(data).toString('hex');
    return `${tid}-${hexHash}`;
}

/**
 * Extract and convert ISCC HEADER to a readable Type-ID string.
 *
 * Type-ids can be used as names in databases to index ISCC-UNITs separately.
 *
 * @param iscc - ISCC string
 * @returns Unique Type-ID string
 */
export function iscc_type_id(iscc: string): string {
    const [mt, st, ver, len] = iscc_decode(iscc);
    const mtype = MT[mt];
    const stype = SUBTYPE_MAP[mt][st];

    let length: string | number;
    if (mt === MT.ISCC) {
        const mtypes = decode_units(len);
        length = mtypes.map((t) => MT[t][0]).join('') + 'DI';
    } else {
        length = decode_length(mt, len);
    }

    const version = Version[ver];

    return `${mtype}-${stype}-${version}-${length}`;
}

/**
 * Encodes a combination of ISCC units to an integer between 0-7.
 * Used as length value for the final encoding of MT.ISCC.
 * 
 * @param units - Array of MainTypes combination (can be empty)
 * @returns Integer value to be used as length-value for header encoding
 */
export function encode_units(units: MT[]): number {
    // Sort units to ensure consistent ordering
    const sortedUnits = [...units].sort((a, b) => a - b);
    return UNITS.findIndex(
        (u) =>
            u.length === sortedUnits.length &&
            u.every((val, idx) => val === sortedUnits[idx])
    );
}

/**
 * Decodes an ISCC header length value into an ordered array of MainTypes.
 * 
 * @param unit_id - The unit ID to decode
 * @returns Array of MainTypes in sorted order
 * @throws Error if unit_id is invalid
 */
export function decode_units(unit_id: number): MT[] {
    if (unit_id < 0 || unit_id >= UNITS.length) {
        throw new Error(`Invalid unit_id: ${unit_id}`);
    }
    return [...UNITS[unit_id]].sort((a, b) => a - b);
}

/**
 * Decode an unsigned variable-length integer from a Uint8Array.
 * Based on Protocol Buffers varint encoding.
 *
 * @param bytes - Uint8Array containing the varint
 * @returns The decoded integer value
 * @throws Error if the varint is malformed or too large
 */
function decode_uvarint(bytes: Uint8Array): number {
    let x = 0;
    let s = 0;

    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (i === 9 && b > 1) {
            throw new Error('uint64 overflow');
        }

        if (b < 0x80) {
            // If this is the last byte (MSB is 0)
            if (i > 9 || (i === 9 && b > 1)) {
                throw new Error('uint64 overflow');
            }
            return x | (b << s);
        }

        // More bytes to come (MSB is 1)
        x |= (b & 0x7f) << s;
        s += 7;

        if (s >= 64) {
            throw new Error('uint64 overflow');
        }
    }

    throw new Error('truncated varint');
}

/**
 * Normalize a multiformat encoded ISCC to standard base32 encoding.
 * Returns the input unchanged (but cleaned) if it's not multiformat encoded.
 * 
 * @param iscc_code - ISCC code to normalize
 * @returns Normalized ISCC code in base32 encoding
 * @throws Error if multiformat codec is malformed
 */
export function normalize_multiformat(iscc_code: string): string {
    const decoders: Record<string, (input: string) => Uint8Array> = {
        [MULTIBASE.base16]: (input: string) => Buffer.from(input, 'hex'),
        [MULTIBASE.base32]: decode_base32,
        [MULTIBASE.base32hex]: decode_base32hex,
        [MULTIBASE.base58btc]: decode_base58,
        [MULTIBASE.base64url]: decode_base64
    };

    // Clean the ISCC code first
    iscc_code = iscc_clean(iscc_code);

    // Check for multibase prefix
    const multibase_prefix = iscc_code[0];
    if (Object.keys(decoders).includes(multibase_prefix)) {
        const decoder = decoders[multibase_prefix];
        const decoded = decoder(iscc_code.slice(1));
        if (!Buffer.from(decoded.slice(0, 2)).equals(MC_PREFIX_BUFFER)) {
            throw new Error(
                `Malformed multiformat codec: ${Buffer.from(decoded.slice(0, 2)).toString('hex')}`
            );
        }
        return encode_base32(Buffer.from(decoded.slice(2)).toString('hex'));
    }
    return iscc_code;
}
