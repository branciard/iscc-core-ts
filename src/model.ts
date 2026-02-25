import { decode_header, encode_header, decode_units, encode_base32, decode_base32, encode_base32hex, decode_length } from './codec';
import { MT, ST, ST_CC, ST_ISCC, Version, ST_ID, SubType, SUBTYPE_MAP } from './constants';
import { b64EncodeUnicode } from './utils';

/**
 * Convenience class to handle different representations of an ISCC
 */
export class Code {
    private _head: [MT, SubType, Version, number];
    private _body: Uint8Array;
    private static MC_PREFIX = new Uint8Array([0x01, 0x97, 0x01]); // multicodec prefix for ISCC
    
    constructor(code: string | Buffer | [MT, SubType, Version, number, Uint8Array] | Code) {
        if (code instanceof Code) {
            const codeFields = [...code._head, code.hashBytes];
            this._head = [
                codeFields[0] as MT,
                codeFields[1] as SubType,
                codeFields[2] as Version,
                codeFields[3] as number
            ];
            this._body = codeFields[4] as Uint8Array;
        } else if (typeof code === 'string') {
            const cleaned = code.trim();
            const decoded = Buffer.from(decode_base32(cleaned));
            const fields = decode_header(decoded.toString('hex'));
            this._head = [fields[0], fields[1], fields[2], fields[3]];
            this._body = fields[4];
        } else if (Array.isArray(code)) {
            this._head = [code[0], code[1], code[2], code[3]];
            this._body = code[4];
        } else if (Buffer.isBuffer(code)) {
            const fields = decode_header(code.toString('hex'));
            this._head = [fields[0], fields[1], fields[2], fields[3]];
            this._body = fields[4];
        } else {
            throw new Error(`Code must be string, Buffer, tuple or Code not ${typeof code}`);
        }
    }

    /**
     * Standard base32 representation of an ISCC code
     */
    get code(): string {
        return encode_base32(this.bytes.toString('hex'));
    }

    /**
     * Standard uri representation of an ISCC code
     */
    get uri(): string {
        return `ISCC:${this.code.toUpperCase()}`;
    }

    /**
     * Raw bytes of code (including header)
     */
    get bytes(): Buffer {
        return Buffer.concat([this.headerBytes, Buffer.from(this._body)]);
    }

    /**
     * Hex representation of code (including header)
     */
    get hex(): string {
        return this.bytes.toString('hex');
    }

    /**
     * Base32hex representation of code (including header)
     */
    get base32hex(): string {
        return encode_base32hex(this.bytes.toString('hex'));
    }

    /**
     * Integer representation of code (including header)
     */
    get uint(): number {
        return parseInt(this.hex, 16);
    }

    /**
     * Byte representation of header prefix of the code
     */
    get headerBytes(): Buffer {
        const headerHex = encode_header(...this._head);
        return Buffer.from(headerHex, 'hex');
    }

    /**
     * A unique composite type-id
     */
    get typeId(): string {
        if (this.maintype === MT.ISCC) {
            const mtypes = decode_units(this._head[3]);
            const length = mtypes.map(t => MT[t][0]).join('') + 'DI';
            return `${MT[this.maintype]}-${SUBTYPE_MAP[`${this.maintype},${this.version}`]?.[this.subtype as number] ?? this.subtype}-${Version[this.version]}-${length}`;
        }
        return `${MT[this.maintype]}-${SUBTYPE_MAP[`${this.maintype},${this.version}`]?.[this.subtype as number] ?? this.subtype}-${Version[this.version]}-${this.length}`;
    }

    /**
     * Human readable representation of code header
     */
    get explain(): string {
        if (this.maintype === MT.ID) {
            const counterBytes = this._body.slice(8);
            if (counterBytes.length) {
                const counter = this.decodeUvarint(counterBytes);
                return `${this.typeId}-${Buffer.from(this._body.slice(0, 8)).toString('hex')}-${counter}`;
            }
        }
        return `${this.typeId}-${this.hashHex}`;
    }

    /**
     * Byte representation of code (without header)
     */
    get hashBytes(): Uint8Array {
        return this._body;
    }

    /**
     * Hex string representation of code (without header)
     */
    get hashHex(): string {
        return Buffer.from(this._body).toString('hex');
    }

    /**
     * Base32 representation of code (without header)
     */
    get hashBase32(): string {
        return encode_base32(Buffer.from(this._body).toString('hex'));
    }

    /**
     * Base32hex representation of code (without header)
     */
    get hashBase32hex(): string {
        return encode_base32hex(Buffer.from(this._body).toString('hex'));
    }

    /**
     * String representation of bits (without header)
     */
    get hashBits(): string {
        return [...this._body]
            .map(byte => byte.toString(2).padStart(8, '0'))
            .join('');
    }

    /**
     * Array of 0,1 integers representing bits (without header)
     */
    get hashInts(): number[] {
        return [...this.hashBits].map(Number);
    }

    /**
     * Unsigned integer representation (without header)
     */
    get hashUint(): number {
        return parseInt(this.hashHex, 16);
    }

    /**
     * ISCC header + body with multicodec prefix
     */
    get mcBytes(): Buffer {
        return Buffer.concat([Buffer.from(Code.MC_PREFIX), this.bytes]);
    }

    /**
     * Multiformats base16 encoded
     */
    get mfBase16(): string {
        return 'f' + this.mcBytes.toString('hex');
    }

    /**
     * Multiformats base32 encoded
     */
    get mfBase32(): string {
        return 'b' + encode_base32(this.mcBytes.toString('hex')).toLowerCase();
    }

    /**
     * Multiformats base32hex encoded
     */
    get mfBase32hex(): string {
        return 'v' + encode_base32hex(Buffer.from(this.mcBytes).toString('hex')).toLowerCase();
    }

    /**
     * Multiformats base64url encoded
     */
    get mfBase64url(): string {
        return 'u' + b64EncodeUnicode(this.mcBytes.toString());
    }

    private decodeUvarint(bytes: Uint8Array): number {
        let x = 0;
        let s = 0;
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            if (b < 0x80) {
                if (i > 9 || (i === 9 && b > 1)) {
                    throw new Error('uint64 overflow');
                }
                return x | (b << s);
            }
            x |= (b & 0x7f) << s;
            s += 7;
        }
        throw new Error('EOF');
    }

    toString(): string {
        return this.code;
    }

    static fromHex(hex: string): Code {
        return new Code(Buffer.from(hex, 'hex'));
    }

    equals(other: Code): boolean {
        return this.code === other.code;
    }

    get hashCode(): number {
        return this.uint;
    }

    get maintype(): MT {
        return this._head[0];
    }

    get subtype(): SubType {
        return this._head[1];
    }

    get version(): Version {
        return this._head[2];
    }

    get length(): number {
        // Pass subtype as third parameter for MT.ISCC to properly handle WIDE subtype
        if (this._head[0] === MT.ISCC) {
            return decode_length(this._head[0], this._head[3], this._head[1]);
        }
        return decode_length(this._head[0], this._head[3]);
    }

}