/**
 * *A unique, time-sorted identifier composed of a 48-bit timestamp and 16 to 208 bit randomness.*
 *
 * The ISCC Flake-Code is a unique identifier for distributed ID generation. The 64-bit version
 * can be used as efficient surrogate key in database systems. It has guaranteed uniqueness if
 * generated from a single process and is time sortable in integer and base32hex representation.
 * The 128-bit version is a K-sortable, globally unique identifier for use in distributed systems
 * and is compatible with UUID.
 */
import * as crypto from 'crypto';
import { encode_component, toHexString } from './codec';
import { MT, ST, FLAKE_BITS, Version } from './constants';

/** Module-level counter state for ensuring uniqueness within same millisecond */
const _COUNTER = new Map<string, bigint>();

/**
 * Convert a BigInt to a big-endian byte array of specified length.
 *
 * @param value - BigInt value to convert
 * @param length - Number of bytes in the output array
 * @returns Uint8Array of the specified length
 * @internal
 */
function bigIntToBytes(value: bigint, length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    let v = value;
    for (let i = length - 1; i >= 0; i--) {
        bytes[i] = Number(v & 0xffn);
        v >>= 8n;
    }
    return bytes;
}

/**
 * Convert a big-endian byte array to a BigInt.
 *
 * @param bytes - Uint8Array to convert
 * @returns BigInt representation
 * @internal
 */
function bytesToBigInt(bytes: Uint8Array): bigint {
    let result = 0n;
    for (const byte of bytes) {
        result = (result << 8n) | BigInt(byte);
    }
    return result;
}

/**
 * Create an ISCC Flake-Code with the latest standard algorithm.
 *
 * @param bits - Target bit-length of generated Flake-Code (default: 64)
 * @returns ISCC object with Flake-Code
 */
export function gen_flake_code(bits: number = FLAKE_BITS): { iscc: string } {
    return gen_flake_code_v0(bits);
}

/**
 * Create an ISCC Flake-Code with algorithm v0.
 *
 * @param bits - Target bit-length of generated Flake-Code (default: 64)
 * @returns ISCC object with Flake-Code
 */
export function gen_flake_code_v0(bits: number = FLAKE_BITS): { iscc: string } {
    const digest = uid_flake_v0(undefined, bits);
    const flake_code = encode_component(
        MT.FLAKE,
        ST.NONE,
        Version.V0,
        bits,
        toHexString(digest)
    );
    const iscc = 'ISCC:' + flake_code;
    return { iscc };
}

/**
 * Generate time and randomness based Flake-Hash.
 *
 * @param ts - Unix timestamp in seconds (defaults to current time)
 * @param bits - Bit-length of resulting Flake-Code (multiple of 32, 64-256)
 * @returns Flake-Hash digest as Uint8Array
 */
export function uid_flake_v0(
    ts?: number | null,
    bits: number = FLAKE_BITS
): Uint8Array {
    if (bits < 64 || bits > 256) {
        throw new Error(`${bits} bits for flake outside 64 - 256 bits`);
    }
    if (bits % 32 !== 0) {
        throw new Error(`${bits} bits for flake is not divisible by 32`);
    }

    const nbytes_rnd = Math.floor(bits / 8) - 6;

    const milliseconds =
        ts == null ? Date.now() : Math.floor(ts * 1000);
    const timedata = bigIntToBytes(BigInt(milliseconds), 6);
    const timeKey = toHexString(timedata);

    let counter = _COUNTER.get(timeKey) ?? 0n;
    if (counter === 0n) {
        // Init counter with random value
        const randBytes = crypto.randomFillSync(new Uint8Array(nbytes_rnd));
        const startcount = bytesToBigInt(randBytes);
        _COUNTER.set(timeKey, startcount);
        counter = startcount;
    }
    const counterdata = bigIntToBytes(counter, nbytes_rnd);
    _COUNTER.set(timeKey, counter + 1n);
    // Clean up stale entries to prevent memory leak in long-running processes
    if (_COUNTER.size > 1) {
        for (const key of _COUNTER.keys()) {
            if (key !== timeKey) _COUNTER.delete(key);
        }
    }

    // Concatenate timedata and counterdata
    const flake_digest = new Uint8Array(timedata.length + counterdata.length);
    flake_digest.set(timedata);
    flake_digest.set(counterdata, timedata.length);

    return flake_digest;
}
