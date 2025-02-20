import { InstanceHasherV0 } from './code-instance-hasher';

/**
 * Generates an ISCC Instance-Code from a data stream.
 * 
 * The Instance-Code is generated using the BLAKE3 cryptographic hash function
 * to create a unique identifier for the exact binary content of a file.
 * 
 * @param stream - Input data buffer to generate the hash from
 * @param bits - Optional. The number of bits for the hash (default: 64)
 * @returns Object containing the ISCC code, datahash (multihash), and filesize
 * 
 * @example
 * ```typescript
 * const data = Buffer.from('Hello, World!');
 * const result = await gen_instance_code(data, 64);
 * console.log(result.iscc);     // Outputs: "ISCC:..."
 * console.log(result.datahash); // Outputs: BLAKE3 multihash
 * console.log(result.filesize); // Outputs: 13
 * ```
 */
export async function gen_instance_code(
    stream: Buffer,
    bits: number = 64
): Promise<{
    iscc: string;
    datahash: string | null;
    filesize: number;
}> {
    return gen_instance_code_v0(stream, bits);
}

/**
 * Generates a version 0 ISCC Instance-Code from a data stream.
 * 
 * @param stream - Input data buffer
 * @param bits - Optional. The number of bits for the hash (default: 64)
 * @returns Object containing the ISCC code, datahash, and filesize
 * @internal
 */
export async function gen_instance_code_v0(
    stream: Buffer,
    bits: number = 64
): Promise<{
    iscc: string;
    datahash: string | null;
    filesize: number;
}> {
    const hasher = await InstanceHasherV0.create();
    await hasher.push(stream);

    const instance_code = await hasher.code(bits);
    const iscc = 'ISCC:' + instance_code;

    return {
        iscc,
        datahash: hasher.multihash,
        filesize: hasher.filesize
    };
}

/**
 * Creates a cryptographic hash from a data stream using BLAKE3.
 * 
 * @param stream - Input data buffer
 * @returns Promise resolving to the hex-encoded hash string
 * @internal
 */
export async function hash_instance_v0(stream: Buffer): Promise<string> {
    const hasher = await InstanceHasherV0.create();
    await hasher.push(stream);
    return await hasher.digest();
}
