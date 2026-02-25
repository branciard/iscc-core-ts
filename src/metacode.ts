import {
    text_clean,
    text_collapse,
    text_encodeUTF8,
    text_remove_newlines,
    text_trim
} from './content-normalization';

import { blake3 } from 'hash-wasm';

import { encode_component } from './codec';
import {
    b64DecodeUnicode,
    chunkString,
    interleave,
    isJson,
    sliding_window
} from './utils';
import { alg_simhash } from './simhash';
import {
    METACODE_BITS,
    META_NGRAM_SIZE_BYTES,
    META_NGRAM_SIZE_TEXT,
    META_TRIM_NAME,
    META_TRIM_DESCRIPTION,
    MAX_META_BYTES,
    MT,
    Version,
    ST
} from './constants';

/**
 * Generates a Meta-Code from content metadata.
 * 
 * Implements the ISCC Meta-Code generation algorithm as specified in:
 * https://github.com/iscc/iscc-specs/blob/version-1.0/docs/specification.md#generate-meta-code
 * 
 * @param name - Title or name of the content
 * @param description - Optional description of the content
 * @param meta - Optional metadata in JSON format or as Data-URL
 * @param bits - Optional number of bits for the hash (default: METACODE_BITS)
 * @param version - Optional ISCC version number (default: 0)
 * @returns Promise resolving to {iscc, metahash, name, description?, meta?, version}
 * @throws {Error} If version is unsupported or input validation fails
 * 
 * @example
 * ```typescript
 * const result = await gen_meta_code(
 *   "The Title",
 *   "A description",
 *   JSON.stringify({ key: "value" })
 * );
 * console.log(result.iscc);     // ISCC code
 * console.log(result.metahash); // Blake3 hash
 * ```
 */
export async function gen_meta_code(
    name: string,
    description?: string,
    meta?: string,
    bits?: number,
    version?: number
): Promise<{
    iscc: string;
    metahash: string;
    name: string;
    description?: string;
    meta?: string;
    version: number;
}> {
    if (version === undefined || version === null) {
        version = 0;
    }
    if (version === 0) {
        return await gen_meta_code_v0(name, description, meta, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

/**
 * Generates a version 0 Meta-Code from content metadata.
 * 
 * @param name - Title or name of the content
 * @param description - Optional description of the content
 * @param meta - Optional metadata in JSON format or as Data-URL
 * @param bits - Optional number of bits for the hash
 * @returns Promise resolving to metadata result object
 * @throws {Error} If name is empty after normalization or metadata format is invalid
 * @internal
 */
export async function gen_meta_code_v0(
    name: string,
    description?: string,
    meta?: string,
    bits?: number
): Promise<{
    iscc: string;
    metahash: string;
    name: string;
    description?: string;
    meta?: string;
    version: number;
}> {
    // CLN-005: Pre-truncate name before expensive text_clean to prevent resource exhaustion
    let nameResult: string = text_trim(name, META_TRIM_NAME * 10);
    nameResult = text_clean(nameResult);
    nameResult = text_remove_newlines(nameResult);
    nameResult = text_trim(nameResult, META_TRIM_NAME);

    if (nameResult.length === 0) {
        throw new Error(
            'Meta-Code requires non-empty name element (after normalization)'
        );
    }

    // CLN-006: Pre-truncate description and apply byte limit matching Python's meta_trim_description
    let descriptionResult: string = description ? text_trim(description, META_TRIM_DESCRIPTION * 10) : '';
    descriptionResult = text_clean(descriptionResult);
    descriptionResult = text_trim(descriptionResult, META_TRIM_DESCRIPTION);

    let meta_code_digest = undefined;
    let metahash = undefined;
    let metadata_value = undefined;
    if (meta) {
        // CLN-007: Validate meta input size to prevent resource exhaustion
        if (meta.length > MAX_META_BYTES) {
            throw new Error(`Meta input size ${meta.length} exceeds maximum of ${MAX_META_BYTES} bytes`);
        }
        if (meta.includes('data:')) {
            // Data-URL expected
            const durl = meta;
            const payload = b64DecodeUnicode(durl.split(',')[1]);
            meta_code_digest = await soft_hash_meta_v0(
                nameResult,
                payload,
                isJson(payload)
            );
            metahash = await multi_hash_blake3(payload);
            metadata_value = durl;
        } else if (isJson(meta)) {
            const payload = JSON.stringify(JSON.parse(meta)); //canonicalize
            meta_code_digest = await soft_hash_meta_v0(
                nameResult,
                payload,
                true
            );

            metahash = await multi_hash_blake3(payload);
            const media_type = meta.includes('@context')
                ? 'application/ld+json'
                : 'application/json';
            metadata_value =
                'data:' +
                media_type +
                ';base64,' +
                Buffer.from(payload).toString('base64');
        } else {
            throw new Error('metadata must be Data-URL string or JSON');
        }
    } else {
        const payload = text_trim(
            nameResult.concat('\u{0020}').concat(descriptionResult)
        );
        meta_code_digest = await soft_hash_meta_v0(
            nameResult,
            descriptionResult
        );
        metahash = await multi_hash_blake3(payload);
    }

    const meta_code = encode_component(
        MT.META,
        ST.NONE,
        Version.V0,
        bits ? bits : METACODE_BITS,
        meta_code_digest
    );

    const iscc = 'ISCC:' + meta_code;
    return {
        iscc: iscc,
        metahash: metahash,
        name: nameResult,
        description: descriptionResult,
        meta: metadata_value,
        version: 0
    };
}

/**
 * Generates a multihash-encoded BLAKE3 hash of input data.
 * 
 * @param data - Input string to hash
 * @returns Promise resolving to multihash-encoded string
 * @internal
 */
export async function multi_hash_blake3(data: string): Promise<string> {
    const blake3Hash: string = await blake3(data);
    return '1e' + '20' + blake3Hash;
}

/**
 * Generates a similarity hash from metadata using version 0 algorithm.
 * 
 * The process:
 * 1. Collapses and normalizes the name
 * 2. Generates n-grams from the name
 * 3. Computes BLAKE3 hashes of n-grams
 * 4. Combines hashes using SimHash
 * 5. If extra data provided, processes it similarly and interleaves results
 * 
 * @param name - Primary text to hash
 * @param extra - Optional additional text or JSON data
 * @param descJsonFormat - If true, treats extra as JSON data
 * @returns Promise resolving to hash digest string
 * @internal
 */
export async function soft_hash_meta_v0(
    name: string,
    extra?: string,
    descJsonFormat: boolean = false
): Promise<string> {
    name = text_collapse(name);
    const name_n_grams = sliding_window(name, META_NGRAM_SIZE_TEXT);

    const name_hash_digests = await Promise.all(
        name_n_grams.map(async (s) => {
            return await blake3(text_encodeUTF8(s));
        })
    );

    let simhash_digest = alg_simhash(name_hash_digests);

    if (extra === undefined || (extra !== undefined && extra.length === 0)) {
        return simhash_digest;
    } else {
        let extra_hash_digests = undefined;
        if (descJsonFormat) {
            //# Raw bytes are handled per byte
            const extra_n_grams = sliding_window(extra, META_NGRAM_SIZE_BYTES);

            extra_hash_digests = await Promise.all(
                extra_n_grams.map(async (s) => {
                    return await blake3(text_encodeUTF8(s));
                })
            );
        } else {
            extra = text_collapse(extra);
            const extra_n_grams = sliding_window(extra, META_NGRAM_SIZE_TEXT);
            extra_hash_digests = await Promise.all(
                extra_n_grams.map(async (s) => {
                    return await blake3(text_encodeUTF8(s));
                })
            );
        }
        if (extra_hash_digests !== undefined) {
            const extra_simhash_digest = alg_simhash(extra_hash_digests);
            // Interleave first half of name and extra simhashes in 32-bit chunks
            const chunks_simhash_digest = chunkString(
                simhash_digest.substring(0, 32),
                8
            );
            const chunks_extra_simhash_digest = chunkString(
                extra_simhash_digest.substring(0, 32),
                8
            );
            const interleaved = interleave(
                chunks_simhash_digest,
                chunks_extra_simhash_digest
            );
            simhash_digest = interleaved.join('');
        }
    }
    return simhash_digest;
}
