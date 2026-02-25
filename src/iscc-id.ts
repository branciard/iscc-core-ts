/**
 * A globally unique, owned, and short identifier for digital assets.
 *
 * The **ISCC-ID** is a 64-bit identifier constructed from a timestamp and a HUB-ID:
 * - First 52 bits: UTC time in microseconds since UNIX epoch (1970-01-01T00:00:00Z)
 * - Last 12 bits: ID of the timestamping HUB (0-4095)
 *
 * The module also contains legacy support for the older v0 ISCC-ID format that was based on
 * blockchain wallet addresses and similarity-hashes of ISCC-CODE units.
 */

import { createHash } from 'crypto';
import {
    encode_component,
    decode_header,
    decode_base32,
    iscc_clean,
    iscc_decompose,
    iscc_decode,
} from './codec';
import { MT, ST, Version } from './constants';
import { alg_simhash } from './simhash';

/**
 * Encode a non-negative integer as a unsigned varint (Protocol Buffers format).
 * @internal
 */
function uvarint_encode(n: number): Uint8Array {
    if (n < 0) throw new Error('uvarint_encode: value must be non-negative');
    const bytes: number[] = [];
    while (n >= 0x80) {
        bytes.push((n & 0x7f) | 0x80);
        n >>>= 7;
    }
    bytes.push(n & 0x7f);
    return new Uint8Array(bytes);
}

/**
 * Decode an unsigned varint from a Uint8Array.
 * Returns { integer, bytesRead }.
 * @internal
 */
function uvarint_decode(data: Uint8Array): { integer: number; bytesRead: number } {
    let x = 0;
    let s = 0;
    for (let i = 0; i < data.length; i++) {
        const b = data[i];
        if (b < 0x80) {
            return { integer: x | (b << s), bytesRead: i + 1 };
        }
        x |= (b & 0x7f) << s;
        s += 7;
        if (s >= 35) {
            throw new Error('uvarint_decode: varint too long');
        }
    }
    throw new Error('uvarint_decode: truncated varint');
}

/**
 * Generate ISCC-ID from microsecond `timestamp` with the latest standard algorithm.
 *
 * @param timestamp - Microseconds since 1970-01-01T00:00:00Z (must be < 2^52)
 * @param hub_id - HUB-ID that issued the ISCC-ID (0-4095)
 * @param realm_id - Realm ID for the ISCC-ID (0 for testnet, 1 for mainnet)
 * @returns Object with the ISCC-ID under the key 'iscc'
 */
export function gen_iscc_id(
    timestamp?: number | null,
    hub_id = 0,
    realm_id = 0
): { iscc: string } {
    return gen_iscc_id_v1(timestamp, hub_id, realm_id);
}

/**
 * Generate an ISCC-ID from a timestamp and a HUB-ID with algorithm v1.
 *
 * The ISCC-IDv1 is a 64-bit identifier:
 * - First 52 bits: UTC time in microseconds since UNIX epoch
 * - Last 12 bits: ID of the timestamping HUB (0-4095)
 *
 * @param timestamp - Microseconds since 1970-01-01T00:00:00Z (must be < 2^52)
 * @param hub_id - HUB-ID that issued the ISCC-ID (0-4095)
 * @param realm_id - Realm ID (0 for testnet, 1 for mainnet)
 * @returns Object with the ISCC-ID under the key 'iscc'
 */
export function gen_iscc_id_v1(
    timestamp?: number | null,
    hub_id = 0,
    realm_id = 0
): { iscc: string } {
    if (timestamp === undefined || timestamp === null) {
        // Current time in microseconds
        timestamp = Date.now() * 1000;
    }

    if (timestamp >= 2 ** 52) {
        throw new Error('Timestamp overflow');
    }

    if (hub_id >= 2 ** 12) {
        throw new Error('HUB-ID overflow');
    }

    if (realm_id !== 0 && realm_id !== 1) {
        throw new Error('Realm-ID must be 0 (test) or 1 (operational)');
    }

    // Shift timestamp left by 12 bits and combine with HUB ID
    const body = (BigInt(timestamp) << 12n) | BigInt(hub_id);

    // Pack the 64-bit body into 8 bytes big-endian
    const digest = new Uint8Array(8);
    let v = body;
    for (let i = 7; i >= 0; i--) {
        digest[i] = Number(v & 0xffn);
        v >>= 8n;
    }

    const hexDigest = Buffer.from(digest).toString('hex');
    const iscc_id = encode_component(
        MT.ID,
        realm_id,
        Version.V1,
        64,
        hexDigest
    );
    const iscc = 'ISCC:' + iscc_id;
    return { iscc };
}

/**
 * Generate an ISCC-ID from an ISCC-CODE with uniqueness counter 'uc' with algorithm v0.
 *
 * @param iscc_code - The ISCC-CODE from which to mint the ISCC-ID
 * @param chain_id - Chain-ID of blockchain
 * @param wallet - The wallet address that signs the ISCC declaration
 * @param uc - Uniqueness counter of ISCC-ID
 * @returns Object with the ISCC-ID under the key 'iscc'
 */
export function gen_iscc_id_v0(
    iscc_code: string,
    chain_id: number,
    wallet: string,
    uc = 0
): { iscc: string } {
    const iscc_id_digest = soft_hash_iscc_id_v0(iscc_code, wallet, uc);
    const iscc_id_len = iscc_id_digest.length * 8;
    const hexDigest = Buffer.from(iscc_id_digest).toString('hex');
    const iscc_id = encode_component(
        MT.ID,
        chain_id,
        Version.V0,
        iscc_id_len,
        hexDigest
    );
    const iscc = 'ISCC:' + iscc_id;
    return { iscc };
}

/**
 * Calculate ISCC-ID hash digest from ISCC-CODE with algorithm v0.
 *
 * @param iscc_code - ISCC-CODE
 * @param wallet - The wallet address that signs the ISCC declaration
 * @param uc - Uniqueness counter for ISCC-ID
 * @returns Digest for ISCC-ID without header but including uniqueness counter
 */
export function soft_hash_iscc_id_v0(
    iscc_code: string,
    wallet: string,
    uc = 0
): Uint8Array {
    const components = iscc_decompose(iscc_code);
    const decoded = components.map((c) => decode_base32(c));
    const unpacked = decoded.map((d) =>
        decode_header(Buffer.from(d).toString('hex'))
    );

    const digests: string[] = [];

    if (unpacked.length === 1 && unpacked[0][0] === MT.INSTANCE) {
        // Special case if iscc_code is a singular Instance-Code
        const dec = decoded[0];
        const unp = unpacked[0];
        const combined = new Uint8Array(8);
        combined[0] = dec[0];
        combined.set(unp[4].slice(0, 7), 1);
        digests.push(Buffer.from(combined).toString('hex'));
    } else {
        for (let i = 0; i < decoded.length; i++) {
            const dec = decoded[i];
            const unp = unpacked[i];
            const mt = unp[0];
            if (mt === MT.INSTANCE) continue;
            if (mt === MT.ID) {
                throw new Error('Cannot create ISCC-ID from ISCC-ID');
            }
            // first byte of header + first 7 bytes of body
            const combined = new Uint8Array(8);
            combined[0] = dec[0];
            combined.set(unp[4].slice(0, 7), 1);
            digests.push(Buffer.from(combined).toString('hex'));
        }
    }

    const iscc_id_digest_hex = alg_simhash(digests);
    const iscc_id_digest = Buffer.from(iscc_id_digest_hex, 'hex');

    // XOR with sha2-256 of wallet
    const wallet_hash_digest = createHash('sha256')
        .update(wallet, 'ascii')
        .digest()
        .slice(0, 8);
    const iscc_id_xor_digest = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
        iscc_id_xor_digest[i] = iscc_id_digest[i] ^ wallet_hash_digest[i];
    }

    if (uc) {
        const ucBytes = uvarint_encode(uc);
        const result = new Uint8Array(8 + ucBytes.length);
        result.set(iscc_id_xor_digest);
        result.set(ucBytes, 8);
        return result;
    }
    return new Uint8Array(iscc_id_xor_digest);
}

/**
 * Increment uniqueness counter of an ISCC-ID.
 *
 * Note: Only ISCC-IDv0 supports uniqueness counters. ISCC-IDv1 uses timestamps
 * and will raise an error if passed to this function.
 *
 * @param iscc_id - Base32-encoded ISCC-ID
 * @returns Base32-encoded ISCC-ID with counter incremented by one
 */
export function iscc_id_incr(iscc_id: string): string {
    const clean = iscc_clean(iscc_id);
    const code_digest = decode_base32(clean);
    const [mt, , vs] = decode_header(
        Buffer.from(code_digest).toString('hex')
    );

    if (mt !== MT.ID) {
        throw new Error(`MainType ${mt} is not ISCC-ID`);
    }

    if (vs === Version.V1) {
        throw new Error(
            'ISCC-IDv1 does not support uniqueness counters (uses timestamps instead)'
        );
    } else if (vs === Version.V0) {
        return iscc_id_incr_v0(iscc_id);
    } else {
        throw new Error(`Unsupported ISCC-ID version ${vs}`);
    }
}

/**
 * Increment uniqueness counter of an ISCC-ID with algorithm v0.
 *
 * @param iscc_id - Base32-encoded ISCC-ID
 * @returns Base32-encoded ISCC-ID with counter incremented by one (without "ISCC:" prefix)
 */
export function iscc_id_incr_v0(iscc_id: string): string {
    const clean = iscc_clean(iscc_id);
    const code_digest = decode_base32(clean);
    const [mt, st, vs, , data] = decode_header(
        Buffer.from(code_digest).toString('hex')
    );

    if (mt !== MT.ID) {
        throw new Error(`MainType ${mt} is not ISCC-ID`);
    }
    if (vs !== Version.V0) {
        throw new Error(`Version ${vs} is not v0`);
    }

    let newData: Uint8Array;
    if (data.length === 8) {
        // No counter yet, add counter = 1
        const ucBytes = uvarint_encode(1);
        newData = new Uint8Array(8 + ucBytes.length);
        newData.set(data);
        newData.set(ucBytes, 8);
    } else {
        // Decode existing counter and increment
        const counterData = data.slice(8);
        const { integer: counter } = uvarint_decode(counterData);
        const newUcBytes = uvarint_encode(counter + 1);
        newData = new Uint8Array(8 + newUcBytes.length);
        newData.set(data.slice(0, 8));
        newData.set(newUcBytes, 8);
    }

    const iscc_id_len = newData.length * 8;
    const hexDigest = Buffer.from(newData).toString('hex');
    return encode_component(
        mt,
        st,
        vs as Version,
        iscc_id_len,
        hexDigest
    );
}

/**
 * Extract similarity preserving hex-encoded hash digest from ISCC-ID.
 *
 * Un-XOR the ISCC-ID hash digest with the wallet address hash to obtain
 * the similarity preserving bytestring.
 *
 * @param iscc_id - ISCC-ID string
 * @param wallet - Wallet address used during minting
 * @returns Hex-encoded similarity hash digest
 */
export function alg_simhash_from_iscc_id(
    iscc_id: string,
    wallet: string
): string {
    const wallet_hash_digest = createHash('sha256')
        .update(wallet, 'ascii')
        .digest()
        .slice(0, 8);

    const cleaned = iscc_clean(iscc_id);
    const iscc_tuple = iscc_decode(cleaned);
    const iscc_id_xor_digest = iscc_tuple[4].slice(0, 8);

    const iscc_id_digest = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
        iscc_id_digest[i] = iscc_id_xor_digest[i] ^ wallet_hash_digest[i];
    }
    return iscc_id_digest.toString('hex');
}
