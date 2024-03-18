import { base32 } from 'rfc4648';
import { binaryArrayToUint8Array, rtrim } from './utils';
import { MainTypes, SubTypes, Version } from './constants';

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

export function encode_length(mtype: MainTypes, length: number): number {
    const error =
        'Invalid length [' + length + '] for MainType [' + mtype + ']';
    if (
        mtype == MainTypes.META ||
        mtype == MainTypes.SEMANTIC ||
        mtype == MainTypes.CONTENT ||
        mtype == MainTypes.DATA ||
        mtype == MainTypes.INSTANCE ||
        mtype == MainTypes.FLAKE
    ) {
        if (length >= 32 && length % 32 == 0) {
            return Math.floor(length / 32) - 1;
        } else {
            throw Error(error);
        }
    } else if (mtype == MainTypes.ISCC) {
        if (0 <= length && length <= 7) {
            return length;
        } else {
            throw Error(error);
        }
    } else if (mtype == MainTypes.ID) {
        if (64 <= length && length <= 96) {
            return Math.floor((length - 64) / 8);
        } else {
            throw Error('MainType [' + mtype + '] is not a unit');
        }
    } else {
        throw Error(error);
    }
}

export function encode_header(
    mtype: MainTypes,
    stype: SubTypes,
    version: Version,
    length: number
): string {
    let header = '';
    for (const n of [
        mtype.valueOf(),
        stype.valueOf(),
        version.valueOf(),
        length
    ]) {
        header += encode_varnibble(n);
    }
    return toHexString(binaryArrayToUint8Array(header));
}

export function encode_varnibble(n: number): string {
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

export function encode_component(
    mtype: MainTypes,
    stype: SubTypes,
    version: Version,
    bit_length: number,
    digest: string
): string {
    if (
        mtype == MainTypes.META ||
        mtype == MainTypes.SEMANTIC ||
        mtype == MainTypes.CONTENT ||
        mtype == MainTypes.DATA ||
        mtype == MainTypes.INSTANCE ||
        mtype == MainTypes.ID ||
        mtype == MainTypes.FLAKE
    ) {
        const encoded_length: number = encode_length(mtype, bit_length);
        const nbytes = Math.floor(bit_length / 8);
        const header = encode_header(mtype, stype, version, encoded_length);
        const body = digest.substring(0, nbytes * 2);
        const component_code = encode_base32(header + body);
        return component_code;
    } else if (mtype == MainTypes.ISCC) {
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
