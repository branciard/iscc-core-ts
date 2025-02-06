
import { TEXT_NGRAM_SIZE } from './constants';
import { text_collapse } from './content-normalization';
import { sliding_window } from './utils';
import { algMinhash256 } from './minhash';
import { xxHash32 } from 'js-xxhash';
import { encode_component } from './codec';
import {
    MainTypes,
    ST_CC,
    TEXT_BITS,
    Version
} from './constants';


export function gen_text_code(
    text: string,
    bits?: number,
    version?: number
): { 
    iscc: string;
    characters: number;
    } {
    if (!version) {
        version = 0;
    }
    if (version == 0) {
        return gen_text_code_v0(text, bits);
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

export function gen_text_code_v0(
   text: string,
   bits?: number
):{ 
iscc: string;
characters: number;
} {


    
    text = text_collapse(text);
    const characters = text?text.length:0;
    const digest = Buffer.from(soft_hash_text_v0(text)).toString('hex');
    const text_code = encode_component(
        MainTypes.CONTENT,
        ST_CC.TEXT,
        Version.V0,
        bits ? bits : TEXT_BITS,
        // fix bug https://github.com/nodejs/node/issues/21242 https://github.com/merkletreejs/merkletreejs/pull/91
        digest.length % 2 ? '0' + digest : digest
    );

    const iscc = 'ISCC:' + text_code;
    return {
        iscc: iscc,
        characters: characters
    };
}


/**
 * 
 * 
 *     Creates a 256-bit similarity preserving hash for text input with algorithm v0.

    - Slide over text with a
      [`text_ngram_size`][iscc_core.options.CoreOptions.text_ngram_size] wide window
      and create [`xxh32`](https://cyan4973.github.io/xxHash/) hashes
    - Create a [`minhash_256`][iscc_core.minhash.alg_minhash_256] from the hashes generated
      in the previous step.

    !!! note

        Before passing text to this function it must be:

        - stripped of markup
        - normalized
        - stripped of whitespace
        - lowercased

 * @param text 
 * @returns 
 */
export function soft_hash_text_v0(
    text: string
): Uint8Array {

    const ngrams = sliding_window(text, TEXT_NGRAM_SIZE);
    const features = ngrams.map(s => BigInt(xxHash32(s) >>> 0));
    const hash_digest = algMinhash256(features);
    return hash_digest;
}

