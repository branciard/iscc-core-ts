
import {  ICodeContentImageResult, TEXT_NGRAM_SIZE } from './constants';
import { text_collapse } from './content-normalization';
import { sliding_window } from './utils';
import { algMinhash256 } from './minhash';
import { xxHash32 } from 'js-xxhash';
import { encode_component } from './codec';
import {
    MainTypes,
    SubTypes,
    IMAGE_BITS,
    Version
} from './constants';


export function gen_image_code(
    pixels: number[],
    bits?: number,
    version?: number
): ICodeContentImageResult{
    if (!version) {
        version = 0;
    }
    if (version == 0) {
        return gen_image_code_v0(pixels, bits);
    } else {
        throw new Error('Only ISCC version 0 is supported');
    }
}

/**
*
* @param name
* @param description
* @returns
*/

export function gen_image_code_v0(
    pixels: number[],
   bits?: number
): ICodeContentImageResult {


    const digest = Buffer.from(soft_hash_image_v0(pixels,bits ? bits : IMAGE_BITS)).toString('hex');
    const image_code = encode_component(
        MainTypes.CONTENT,
        SubTypes.IMAGE,
        Version.V0,
        bits ? bits : IMAGE_BITS,
        // fix bug https://github.com/nodejs/node/issues/21242 https://github.com/merkletreejs/merkletreejs/pull/91
        digest.length % 2 ? '0' + digest : digest
    );

    const iscc = 'ISCC:' + image_code;
    return {
        iscc: iscc
    };
}


    /**
     * Calculate image hash from normalized grayscale pixel sequence of length 1024.
     *
     * @param pixels - Normalized image pixels
     * @param bits - Bit-length of image hash (default 64).
     * @return Similarity preserving Image-Hash digest.
     */
export function soft_hash_image_v0(
    pixels: number[],
    bits: number
): Uint8Array {
    if (bits > 256) {
        throw new Error(`${bits} bits exceeds max length 256 for soft_hash_image`);
    }
   
   // DCT per row
   const dctRowLists: number[][] = [];
   for (let i = 0; i < pixels.length; i += 32) {
       dctRowLists.push(algDct(pixels.slice(i, i + 32)));
   }

   // DCT per col
   const dctRowListsT = dctRowLists[0].map((_, colIndex) => dctRowLists.map(row => row[colIndex]));
   const dctColListsT = dctRowListsT.map(algDct);

   const dctMatrix = dctColListsT[0].map((_, rowIndex) => dctColListsT.map(col => col[rowIndex]));

   function flatten(m: number[][], x: number, y: number): number[] {
       return m.slice(y, y + 8).flatMap(row => row.slice(x, x + 8));
   }

   let bitstring = "";
   const slices = [[0, 0], [1, 0], [0, 1], [1, 1]];

   for (const [x, y] of slices) {
       // Extract 8 x 8 slice
       const flatList = flatten(dctMatrix, x, y);

       // Calculate median
       const med = median(flatList);

       // Append 64-bit digest by comparing to median
       for (const value of flatList) {
           bitstring += value > med ? "1" : "0";
       }
       
       const bl = bitstring.length;
       if (bl >= bits) {
           const hashDigest = new Uint8Array(Math.floor(bl / 8));
           for (let i = 0; i < bl; i += 8) {
               hashDigest[i / 8] = parseInt(bitstring.substr(i, 8), 2);
           }
           return hashDigest;
       }
   }

   throw new Error("Failed to generate hash digest");
}



function median(numbers: number[]): number {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}



export function algDct(v: number[]): number[] {
    /**
     * Discrete cosine transform.
     *
     * See: [nayuki.io](https://www.nayuki.io/page/fast-discrete-cosine-transform-algorithms).
     *
     * @param v - Input vector for DCT calculation.
     * @return DCT Transformed vector.
     */

    const n = v.length;
    if (n === 1) {
        return [...v];
    } else if (n === 0 || n % 2 !== 0) {
        throw new Error("Invalid input length");
    } else {
        const half = Math.floor(n / 2);
        const alpha = Array.from({ length: half }, (_, i) => v[i] + v[n - 1 - i]);
        const beta = Array.from({ length: half }, (_, i) => 
            (v[i] - v[n - 1 - i]) / (Math.cos((i + 0.5) * Math.PI / n) * 2.0)
        );
        
        const alphaTransformed = algDct(alpha);
        const betaTransformed = algDct(beta);
        
        const result: number[] = [];
        for (let i = 0; i < half - 1; i++) {
            result.push(alphaTransformed[i]);
            result.push(betaTransformed[i] + betaTransformed[i + 1]);
        }
        result.push(alphaTransformed[half - 1]);
        result.push(betaTransformed[half - 1]);
        
        return result;
    }
}