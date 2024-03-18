export function sliding_window(seq: string, width: number) {
    if (width < 2) {
        throw new RangeError('Sliding window width must be 2 or bigger.');
    }
    const idx = [...Array(Math.max(seq.length - width + 1, 1)).keys()];
    return idx.map((i) => seq.substring(i, i + width));
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

// fix https://github.com/nodejs/node/issues/21242
export function toHexString(bytes: any) {
    return bytes
        .map((byte: any) => {
            if (byte > 15) return (byte & 0xff).toString(16);
            else return '0' + (byte & 0xff).toString(16);
        })
        .join('');
}

// Encoding UTF-8 ⇢ base64

export function b64EncodeUnicode(str: string) {
    return btoa(
        encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            function (match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            }
        )
    );
}

// Decoding base64 ⇢ UTF-8
export function b64DecodeUnicode(str: string) {
    return decodeURIComponent(
        Array.prototype.map
            .call(atob(str), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );
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
