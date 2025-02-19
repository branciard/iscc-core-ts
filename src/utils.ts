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
    } catch (e) {
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
