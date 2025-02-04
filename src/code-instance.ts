import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';
import { encode_component } from './codec';
import { MainTypes, ST, SubTypes, Version } from './constants';
import { createBLAKE3 } from 'hash-wasm';

export async function gen_instance_code(stream: Buffer, bits: number = 64): Promise<any> {
    return gen_instance_code_v0(stream, bits);
}

export async function gen_instance_code_v0(stream: Buffer, bits: number = 64): Promise<any> {
    const hasher = await InstanceHasherV0.create();
    await hasher.push(stream);

    const instance_code = await hasher.code(bits);
    const iscc = "ISCC:" + instance_code;
    
    return {
        iscc,
        datahash: hasher.multihash,
        filesize: hasher.filesize,
    };
}

export async function hash_instance_v0(stream: Buffer): Promise<string> {
    const hasher = await InstanceHasherV0.create();
    await hasher.push(stream);
    return await hasher.digest();
}

class InstanceHasherV0 {
    private hasher: IHasher;
    public filesize: number = 0;
    private static mh_prefix: Uint8Array = new Uint8Array([0x1e, 0x20]);
    public multihash:string | null = null;

    private constructor(hasher: IHasher) {
        this.hasher = hasher;
        this.hasher.init();
    }

    static async create(): Promise<InstanceHasherV0> {
        const hasher = await createBLAKE3();
        return new InstanceHasherV0(hasher);
    }

    async push(data: Buffer): Promise<void> {
        this.filesize += data.length;
        this.hasher.update(data);
    }

    async digest(): Promise<string> {
        const digest = this.hasher.digest("binary")
        this.multihash = Buffer.from([...InstanceHasherV0.mh_prefix, ...digest]).toString('hex');
        return Buffer.from(digest).toString('hex');
    }


    async code(bits: number): Promise<string> {
        return encode_component(
            MainTypes.INSTANCE,
            ST.NONE,
            Version.V0,
            bits,
            await this.digest()
            );
    }
}

export const InstanceHasher = InstanceHasherV0;
