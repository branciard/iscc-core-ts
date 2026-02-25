/**
 * Configuration options for the iscc-core-ts library.
 *
 * Options can be configured using environment variables prefixed with `ISCC_CORE_`.
 * For example, to override `meta_bits`, set `ISCC_CORE_META_BITS=128`.
 *
 * In browser environments where `process.env` is unavailable, default values are used.
 *
 * @example
 * ```typescript
 * import { core_opts } from 'iscc-core-ts';
 *
 * // Access a configuration option
 * const bits = core_opts.meta_bits; // 64 (default) or value from ISCC_CORE_META_BITS
 * ```
 *
 * @example
 * ```bash
 * # Override defaults via environment variables
 * ISCC_CORE_META_BITS=128 ISCC_CORE_MAX_META_BYTES=5000000 node my-app.js
 * ```
 *
 * @module options
 */

/**
 * Read an environment variable with `ISCC_CORE_` prefix.
 * Returns `undefined` in browser environments where `process.env` is unavailable.
 *
 * @param name - Option name in UPPER_CASE (without the ISCC_CORE_ prefix)
 * @returns The environment variable value, or `undefined` if not set
 * @internal
 */
function getEnv(name: string): string | undefined {
    try {
        return typeof process !== 'undefined' && process.env
            ? process.env[`ISCC_CORE_${name.toUpperCase()}`]
            : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Read an integer environment variable with fallback to a default value.
 *
 * @param name - Option name in UPPER_CASE (without the ISCC_CORE_ prefix)
 * @param defaultValue - Default value if the environment variable is not set or invalid
 * @returns The parsed integer value, or the default
 * @internal
 */
function envInt(name: string, defaultValue: number): number {
    const val = getEnv(name);
    if (val !== undefined && val !== '') {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) return parsed;
    }
    return defaultValue;
}

/**
 * Configuration interface for ISCC core options.
 *
 * All options have sensible defaults matching the Python reference implementation (iscc-core v1.2.2).
 * Options can be overridden via `ISCC_CORE_<OPTION_NAME>` environment variables.
 */
export interface CoreOptions {
    /** Default bit-length of generated Meta-Code (default: 64) */
    meta_bits: number;

    /** Trim `name` to this number of bytes (default: 128) */
    meta_trim_name: number;

    /** Trim `description` to this number of bytes (default: 4096) */
    meta_trim_description: number;

    /** Maximum allowed byte size for the `meta` parameter (default: 10,000,000) */
    max_meta_bytes: number;

    /** Sliding window width in characters for metadata text hashing (default: 3) */
    meta_ngram_size_text: number;

    /** Sliding window width in bytes for metadata binary hashing (default: 4) */
    meta_ngram_size_bytes: number;

    /** Default bit-length of generated Content-Code Text (default: 64) */
    text_bits: number;

    /** Number of characters per feature hash for text similarity (default: 13) */
    text_ngram_size: number;

    /** Default bit-length of generated Content-Code Image (default: 64) */
    image_bits: number;

    /** Default bit-length of generated Content-Code Audio (default: 64) */
    audio_bits: number;

    /** Default bit-length of generated Content-Code Video (default: 64) */
    video_bits: number;

    /** Default bit-length of generated Content-Code Mixed (default: 64) */
    mixed_bits: number;

    /** Default bit-length of generated Data-Code (default: 64) */
    data_bits: number;

    /** Default bit-length of generated Instance-Code (default: 64) */
    instance_bits: number;

    /** Default bit-length of generated Flake-Code (default: 64) */
    flake_bits: number;

    /** Target average chunk size for content-defined chunking in bytes (default: 1024) */
    data_avg_chunk_size: number;

    /** File read buffer size in bytes for hashing operations (default: 2,097,152) */
    io_read_size: number;
}

/**
 * Default values for all configuration options.
 * These match the Python iscc-core v1.2.2 reference implementation.
 */
const DEFAULT_OPTIONS: Readonly<CoreOptions> = {
    meta_bits: 64,
    meta_trim_name: 128,
    meta_trim_description: 4096,
    max_meta_bytes: 10_000_000,
    meta_ngram_size_text: 3,
    meta_ngram_size_bytes: 4,
    text_bits: 64,
    text_ngram_size: 13,
    image_bits: 64,
    audio_bits: 64,
    video_bits: 64,
    mixed_bits: 64,
    data_bits: 64,
    instance_bits: 64,
    flake_bits: 64,
    data_avg_chunk_size: 1024,
    io_read_size: 2_097_152,
};

/**
 * Set of option keys that are conformance-critical.
 * Changing these produces ISCC codes that are NOT interoperable with codes
 * generated using default settings. A warning is logged when non-default
 * values are detected.
 *
 * @internal
 */
const CONFORMANCE_CRITICAL = new Set<keyof CoreOptions>([
    'meta_trim_name',
    'meta_trim_description',
    'meta_ngram_size_text',
    'meta_ngram_size_bytes',
    'text_ngram_size',
    'data_avg_chunk_size',
]);

/**
 * Load options from environment variables, falling back to defaults.
 *
 * @returns A fully populated CoreOptions object
 * @internal
 */
function loadOptions(): CoreOptions {
    const opts: CoreOptions = { ...DEFAULT_OPTIONS };
    for (const key of Object.keys(DEFAULT_OPTIONS) as (keyof CoreOptions)[]) {
        opts[key] = envInt(key, DEFAULT_OPTIONS[key]);
    }
    return opts;
}

/**
 * Check whether any conformance-critical options have been changed from defaults.
 * Logs a warning for each non-default conformance-critical option.
 *
 * @param opts - The options to check
 * @returns `true` if all conformance-critical options are at their default values
 */
export function conformance_check_options(opts: CoreOptions): boolean {
    let result = true;
    for (const key of CONFORMANCE_CRITICAL) {
        if (opts[key] !== DEFAULT_OPTIONS[key]) {
            console.warn(
                `[iscc-core-ts] Non-interoperable custom option ${key}=${opts[key]} (default: ${DEFAULT_OPTIONS[key]})`
            );
            result = false;
        }
    }
    return result;
}

/**
 * Global configuration options singleton.
 *
 * Values are loaded once at module initialization from environment variables
 * prefixed with `ISCC_CORE_`. In browser environments, defaults are used.
 *
 * @example
 * ```typescript
 * import { core_opts } from 'iscc-core-ts';
 *
 * console.log(core_opts.meta_bits);          // 64
 * console.log(core_opts.max_meta_bytes);     // 10000000
 * console.log(core_opts.data_avg_chunk_size); // 1024
 * ```
 *
 * @example
 * ```bash
 * # Override via environment variables
 * ISCC_CORE_META_BITS=128 node my-app.js
 * ISCC_CORE_MAX_META_BYTES=5000000 node my-app.js
 * ISCC_CORE_DATA_AVG_CHUNK_SIZE=2048 node my-app.js
 * ```
 */
export const core_opts: CoreOptions = loadOptions();

/** Whether the current configuration uses only default conformance-critical values */
export const conformant_options: boolean = conformance_check_options(core_opts);
