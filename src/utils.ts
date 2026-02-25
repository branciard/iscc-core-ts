import * as crypto from 'crypto';
import {
    iscc_clean,
    iscc_normalize,
    decode_base32,
    decode_header,
    iscc_decompose,
    iscc_decode,
} from './codec';
import { MT, Version } from './constants';

export function sliding_window(seq: string, width: number) {
    if (width < 2) {
        throw new RangeError('Sliding window width must be 2 or bigger.');
    }

    // Convert to array of Unicode code points to handle surrogate pairs correctly issue #1
    const codePoints = Array.from(seq);
    const length = codePoints.length;

    const idx = [...Array(Math.max(length - width + 1, 1)).keys()];
    return idx.map((i) => codePoints.slice(i, i + width).join(''));
}

export const hexBytesToBinary = (hex: string): string => {
    return parseInt(hex, 16).toString(2).padStart(8, '0');
};

export const chunkString = (
    str: string,
    length: number
): RegExpMatchArray | null => {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
};

export function interleave(
    arr: RegExpMatchArray | null,
    arr2: RegExpMatchArray | null
) {
    const newArr = [];
    if (arr && arr2) {
        for (let i = 0; i < arr.length; i++) {
            newArr.push(arr[i], arr2[i]);
        }
    }
    return newArr;
}

export function isJson(item: string | object) {
    let value = typeof item !== 'string' ? JSON.stringify(item) : item;
    try {
        value = JSON.parse(value);
    } catch {
        return false;
    }

    return typeof value === 'object' && value !== null;
}

/**
 * Encode UTF-8 string to base64
 */
export function b64EncodeUnicode(str: string): string {
    return Buffer.from(str, 'utf8').toString('base64url');
}

/**
 * Decode base64 to UTF-8 string
 */
export function b64DecodeUnicode(str: string): string {
    return Buffer.from(str, 'base64url').toString('utf8');
}

export function binaryArrayToUint8Array(binArray: string): Uint8Array {
    //# Append zero-padding if required (right side, least-significant bits).
    let toPad: number = 8;
    for (let i = 0; i < binArray.length; i++) {
        toPad--;
        if (toPad == 0) {
            toPad = 8;
        }
    }
    if (toPad < 8) {
        binArray = binArray.padEnd(binArray.length + toPad, '0');
    }

    const byte = new Array<string>();
    let idxInByte = 0;
    const uint8Array = new Uint8Array(Math.floor(binArray.length / 8));
    let idxUint8Array = 0;
    for (let i = 0; i < binArray.length; i++) {
        byte.push(binArray[i]);
        idxInByte++;
        if (idxInByte == 8) {
            idxInByte = 0;
            uint8Array[idxUint8Array] = parseInt(byte.join(''), 2);
            idxUint8Array++;
            byte.splice(0, 8);
        }
    }
    return uint8Array;
}

export function rtrim(x: string, characters: string) {
    let end = x.length - 1;
    while (characters.indexOf(x[end]) >= 0) {
        end -= 1;
    }
    return x.substring(0, end + 1);
}

/**
 * Safely converts a value to an even-length hex string
 * Ensures the output is a valid hex string with even length
 * fix bug https://github.com/nodejs/node/issues/21242 https://github.com/merkletreejs/merkletreejs/pull/91
 * @param value - Value to convert (bigint or hex string)
 * @returns Safe hex string representation
 */
export function safeHex(value: bigint | string): string {
    const hex = typeof value === 'bigint' ? value.toString(16) : value;
    return hex.length % 2 ? '0' + hex : hex;
}


/**
 * Count the number of set bits (popcount) in a byte.
 * @internal
 */
function popcount8(b: number): number {
    b = b - ((b >> 1) & 0x55);
    b = (b & 0x33) + ((b >> 2) & 0x33);
    return (b + (b >> 4)) & 0x0f;
}

/**
 * Calculate hamming distance for binary hash digests of equal length.
 *
 * @param a - binary hash digest as Uint8Array
 * @param b - binary hash digest as Uint8Array
 * @returns Hamming distance in number of bits
 */
export function iscc_distance_bytes(a: Uint8Array, b: Uint8Array): number {
    if (a.length !== b.length) {
        throw new Error(`Hash digests of unequal length: ${a.length} vs ${b.length}`);
    }
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
        dist += popcount8(a[i] ^ b[i]);
    }
    return dist;
}

/**
 * Unpack two ISCC codes and return their body hash digests if their headers match.
 *
 * Headers match if their MainType, SubType, and Version are identical.
 *
 * @param a - ISCC a
 * @param b - ISCC b
 * @returns Tuple with hash digests of a and b
 * @throws Error if ISCC headers don't match or for unsupported types
 */
export function iscc_pair_unpack(a: string, b: string): [Uint8Array, Uint8Array] {
    const cleanA = iscc_clean(iscc_normalize(a));
    const cleanB = iscc_clean(iscc_normalize(b));

    const decodedA = decode_header(Buffer.from(decode_base32(cleanA)).toString('hex'));
    const decodedB = decode_header(Buffer.from(decode_base32(cleanB)).toString('hex'));

    // Check for ISCC-IDv1 which doesn't support similarity comparison
    if (decodedA[0] === MT.ID && decodedA[2] === Version.V1) {
        throw new Error('Similarity comparison not supported for ISCC-IDv1');
    }
    if (decodedB[0] === MT.ID && decodedB[2] === Version.V1) {
        throw new Error('Similarity comparison not supported for ISCC-IDv1');
    }

    // Check headers match (maintype, subtype, version)
    if (
        decodedA[0] !== decodedB[0] ||
        decodedA[1] !== decodedB[1] ||
        decodedA[2] !== decodedB[2]
    ) {
        throw new Error(
            `ISCC headers don't match: [${decodedA[0]},${decodedA[1]},${decodedA[2]}], [${decodedB[0]},${decodedB[1]},${decodedB[2]}]`
        );
    }

    return [decodedA[4], decodedB[4]];
}

/**
 * Calculate similarity of ISCC codes as a percentage value (0-100).
 *
 * MainType, SubType, Version and Length of the codes must be the same.
 *
 * @param a - ISCC a
 * @param b - ISCC b
 * @returns Similarity of ISCC a and b in percent (based on hamming distance)
 */
export function iscc_similarity(a: string, b: string): number {
    const [da, db] = iscc_pair_unpack(a, b);
    const hdist = iscc_distance_bytes(da, db);
    const nbits = da.length * 8;
    return Math.floor(((nbits - hdist) / nbits) * 100);
}

/**
 * Calculate hamming distance of ISCC codes.
 *
 * MainType, SubType, Version and Length of the codes must be the same.
 *
 * @param a - ISCC a
 * @param b - ISCC b
 * @returns Hamming distance in number of bits
 */
export function iscc_distance(a: string, b: string): number {
    const [da, db] = iscc_pair_unpack(a, b);
    return iscc_distance_bytes(da, db);
}

/**
 * Calculate separate hamming distances of compatible components of two ISCCs.
 * For ISCC-IDv1, returns a simple match comparison result.
 *
 * @param a - ISCC a
 * @param b - ISCC b
 * @returns A dict with component distances or match result for ISCC-IDv1
 */
export function iscc_compare(a: string, b: string): Record<string, number | boolean> {
    const ac = iscc_decompose(a).map((unit) => {
        const decoded = decode_header(Buffer.from(decode_base32(iscc_clean(unit))).toString('hex'));
        return {
            maintype: decoded[0] as MT,
            subtype: decoded[1],
            version: decoded[2],
            hash_bytes: decoded[4],
        };
    });
    const bc = iscc_decompose(b).map((unit) => {
        const decoded = decode_header(Buffer.from(decode_base32(iscc_clean(unit))).toString('hex'));
        return {
            maintype: decoded[0] as MT,
            subtype: decoded[1],
            version: decoded[2],
            hash_bytes: decoded[4],
        };
    });

    // Special handling for ISCC-IDv1
    for (const code of [...ac, ...bc]) {
        if (code.maintype === MT.ID && code.version === Version.V1) {
            return { id_match: code.hash_bytes === code.hash_bytes };
        }
    }

    const result: Record<string, number | boolean> = {};
    for (const ca of ac) {
        for (const cb of bc) {
            if (
                ca.maintype === cb.maintype &&
                ca.subtype === cb.subtype &&
                ca.version === cb.version
            ) {
                if (ca.maintype !== MT.INSTANCE) {
                    result[MT[ca.maintype].toLowerCase() + '_dist'] =
                        iscc_distance_bytes(ca.hash_bytes, cb.hash_bytes);
                } else {
                    result['instance_match'] =
                        Buffer.from(ca.hash_bytes).equals(Buffer.from(cb.hash_bytes));
                }
            }
        }
    }
    return result;
}

/**
 * Calculate Normalized Prefix Hamming Similarity (NPHS) between two byte strings.
 *
 * NPHS is defined as 1.0 minus the Normalized Prefix Hamming Distance (NPHD).
 * It represents the fraction of matching bits within the common prefix.
 *
 * @param a - First byte string
 * @param b - Second byte string
 * @returns Dictionary with NPHS score and common prefix length
 */
export function iscc_nph_similarity(
    a: Uint8Array,
    b: Uint8Array
): { similarity: number; common_prefix_bits: number } {
    const common_bytes = Math.min(a.length, b.length);
    const common_bits = common_bytes * 8;
    if (common_bits === 0) {
        return {
            similarity: a.length === 0 && b.length === 0 ? 1.0 : 0.0,
            common_prefix_bits: 0,
        };
    }
    let hd = 0;
    for (let i = 0; i < common_bytes; i++) {
        hd += popcount8(a[i] ^ b[i]);
    }
    return {
        similarity: 1.0 - hd / common_bits,
        common_prefix_bits: common_bits,
    };
}

/**
 * Calculate Normalized Prefix Hamming Distance (NPHD) between two byte strings.
 *
 * NPHD is defined as the Hamming distance of their common prefix, normalized by
 * the length of that common prefix in bits.
 *
 * @param a - First byte string
 * @param b - Second byte string
 * @returns Dictionary with NPHD score and common prefix length
 */
export function iscc_nph_distance(
    a: Uint8Array,
    b: Uint8Array
): { distance: number; common_prefix_bits: number } {
    const common_bytes = Math.min(a.length, b.length);
    const common_bits = common_bytes * 8;
    if (common_bits === 0) {
        return {
            distance: a.length === 0 && b.length === 0 ? 0.0 : 1.0,
            common_prefix_bits: 0,
        };
    }
    let hd = 0;
    for (let i = 0; i < common_bytes; i++) {
        hd += popcount8(a[i] ^ b[i]);
    }
    return {
        distance: hd / common_bits,
        common_prefix_bits: common_bits,
    };
}

/**
 * Canonical, deterministic serialization of ISCC metadata.
 *
 * Serializes metadata using JCS (RFC 8785) canonicalization.
 * Keys are sorted lexicographically, numbers use shortest representation,
 * and strings use minimal escape sequences.
 *
 * @param obj - Object to serialize
 * @returns Canonical JSON as Uint8Array
 */
export function json_canonical(obj: unknown): Uint8Array {
    const ser = JSON.stringify(obj, (_key, value) => value, undefined);
    // JCS: sort keys, no whitespace, specific number format
    const canonical = JSON.stringify(
        JSON.parse(ser),
        Object.keys(JSON.parse(ser)).sort(),
    );
    // Simple round-trip check
    const des = JSON.parse(canonical);
    if (JSON.stringify(des) !== JSON.stringify(obj)) {
        throw new Error(`Not canonicalizable: round-trip mismatch`);
    }
    return new TextEncoder().encode(canonical);
}

/**
 * Create an IPFS CIDv1 hash for ISCC metadata in base16 (hexadecimal) representation.
 *
 * Uses sha2-256 with raw leaves, matching IPFS default chunking.
 *
 * @param data - Data to be hashed (max 262144 bytes)
 * @returns A valid IPFS CIDv1 in base16 hex
 */
export function cidv1_hex(data: Uint8Array): string {
    const ipfs_max_size = 262144;
    if (data.length > ipfs_max_size) {
        throw new Error(
            `Data exceeds current max size ${ipfs_max_size} for ipfs_hash: ${data.length}`
        );
    }

    const digest = crypto.createHash('sha256').update(data).digest();
    const multibase_prefix = 'f';
    // CIDv1 + raw + sha2-256 + 32-byte length
    const cid_header = Buffer.from([0x01, 0x55, 0x12, 0x20]);
    const cid_v1_digest = Buffer.concat([cid_header, digest]);
    return multibase_prefix + cid_v1_digest.toString('hex');
}

/**
 * Convert default IPFS CIDv1 to an uint256 Token-ID.
 *
 * @param cidv1 - An IPFS CIDv1 string base-16 (hex) encoded
 * @returns An uint256 derived from the CIDv1 as BigInt
 */
export function cidv1_to_token_id(cidv1: string): bigint {
    if (!cidv1.startsWith('f')) {
        throw new Error(`Only base16 encoded CIDv1 supported. Got ${cidv1}`);
    }
    const nobase = cidv1.slice(1);
    const decoded = Buffer.from(nobase, 'hex');
    if (
        decoded[0] !== 0x01 ||
        decoded[1] !== 0x55 ||
        decoded[2] !== 0x12 ||
        decoded[3] !== 0x20
    ) {
        throw new Error(
            `Only sha2-256 with raw leaves supported. Got ${decoded.toString('hex')}`
        );
    }
    const digest = decoded.subarray(4);
    if (digest.length !== 32) {
        throw new Error(`Illegal digest size ${digest.length} for sha2-256`);
    }
    let result = 0n;
    for (const byte of digest) {
        result = (result << 8n) | BigInt(byte);
    }
    return result;
}

/**
 * Convert Token-ID to default IPFS CIDv1 (reverse of cidv1_to_token_id).
 *
 * @param token_id - An uint256 Token-ID derived from a CIDv1
 * @returns An IPFS CIDv1 string with base16 encoding
 */
export function cidv1_from_token_id(token_id: bigint): string {
    const digestBytes = new Uint8Array(32);
    let val = token_id;
    for (let i = 31; i >= 0; i--) {
        digestBytes[i] = Number(val & 0xffn);
        val = val >> 8n;
    }
    const header = Buffer.from([0x01, 0x55, 0x12, 0x20]);
    const fullDigest = Buffer.concat([header, Buffer.from(digestBytes)]);
    return 'f' + fullDigest.toString('hex');
}