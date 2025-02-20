/**
 *
 *
 * Specification implementaton of https://iscc.codes/specification/#text_trim
 *
 * @param text
 * @returns
 */

import XRegExp from 'xregexp';

import { LINE_ENDING_REGEX } from './constants';

/**
 * Trims and normalizes text according to ISCC specification.
 * 
 * Implements the text_trim function as specified in https://iscc.codes/specification/#text_trim
 * 
 * @param text - Input text to be trimmed
 * @param limit - Optional byte limit for the text
 * @returns Trimmed and normalized text
 * 
 * @example
 * ```typescript
 * const text = "  Hello World!  ";
 * const trimmed = text_trim(text);
 * console.log(trimmed); // "Hello World!"
 * ```
 */
export function text_trim(text: string, limit?: number): string {
    return text_encodeUTF8(text, limit).trim();
}

/**
 * Encodes text to UTF-8 and optionally limits its length.
 * 
 * @param text - Input text to encode
 * @param limit - Optional maximum number of bytes
 * @returns UTF-8 encoded text, potentially truncated
 * @internal
 */
export function text_encodeUTF8(text: string, limit?: number): string {
    const encoder = new TextEncoder();
    const utf8Arr = encoder.encode(text);
    const decoder = new TextDecoder('utf-8');
    if (limit && limit > 0) {
        text = decoder.decode(utf8Arr.slice(0, limit));
    } else {
        text = decoder.decode(utf8Arr);
    }
    return text;
}

/**
 * Removes newlines from text and replaces them with spaces.
 * Consecutive whitespace is collapsed into a single space.
 * 
 * @param text - Input text to process
 * @returns Text with newlines removed
 */
export function text_remove_newlines(text: string): string {
    return text
        .split(/(\s+)/)
        .filter((x) => x.trim().length > 0)
        .join(' ');
}

/**
 * Checks if a character belongs to the Unicode Control category.
 * 
 * @param s - Single character to check
 * @returns True if character is in Control category
 * @internal
 */
function isCharControlCategoryUnicode(s: string) {
    const cc = XRegExp('^\\p{Control}+$');
    if (cc.test(s)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Checks if a character is a Unicode newline character.
 * 
 * @param s - Single character to check
 * @returns True if character is a newline
 * @internal
 */
function isCharNewLinesUnicode(s: string) {
    const regex = LINE_ENDING_REGEX
    if (regex.test(s)) {
        return true;
    } else {
        return false;
    }
}
/**
 *
 * For category name unicode filtering, the reference is https://unicode.org/Public/UCD/latest/ucd/PropertyValueAliases.txt
 *
 * @param text
 * @returns text normalized
 */

/**
 * Cleans text according to ISCC specification.
 * 
 * The cleaning process:
 * 1. Normalizes text to NFKC form
 * 2. Removes control characters except newlines
 * 3. Limits consecutive newlines to maximum of 2
 * 4. Converts all newlines to LF (\u000A)
 * 5. Trims leading/trailing whitespace
 * 
 * @param text - Input text to clean
 * @returns Cleaned text
 * 
 * @example
 * ```typescript
 * const text = "Hello\r\n\r\n\r\nWorld";
 * const cleaned = text_clean(text);
 * console.log(cleaned); // "Hello\n\nWorld"
 * ```
 */
export function text_clean(text: string): string {
    text = text.normalize('NFKC');
    let textWithoutCC = '';
    const charsWithCC = Array.from(text);
    // Remove control characters
    for (const c of charsWithCC) {
        if (!isCharControlCategoryUnicode(c) || isCharNewLinesUnicode(c)) {
            textWithoutCC = textWithoutCC.concat(c);
        }
    }

    let textFiltered = '';
    const chars = Array.from(textWithoutCC);
    let newline_count: number = 0;
    for (const c of chars) {
        if (isCharNewLinesUnicode(c)) {
            if (newline_count < 2) {
                textFiltered = textFiltered.concat('\u{000A}');
                newline_count += 1;
            }
            continue;
        } else {
            newline_count = 0;
        }
        textFiltered = textFiltered.concat(c);
    }
    text = textFiltered;
    return text.trim();
}

/**
 * Collapses text for similarity matching according to ISCC specification.
 * 
 * The collapsing process:
 * 1. Normalizes text to NFD form
 * 2. Trims whitespace
 * 3. Removes all whitespace
 * 4. Converts to lowercase
 * 5. Removes Unicode characters in categories:
 *    - Other (Cc, Cf, Cn, Co, Cs)
 *    - Mark (Mc, Me, Mn)
 *    - Punctuation (Pc, Pd, Pe, Pf, Pi, Po, Ps)
 * 6. Normalizes to NFKC form
 * 
 * @param text - Input text to collapse
 * @returns Collapsed text
 * 
 * @example
 * ```typescript
 * const text = "Hello, World!";
 * const collapsed = text_collapse(text);
 * console.log(collapsed); // "helloworld"
 * ```
 */
export function text_collapse(text: string): string {
    text = text.normalize('NFD');
    text = text_trim(text);
    text = text.replace(/\s/g, '');
    text = text.toLowerCase();

    // Filter out all characters that fall into the Unicode categories listed in the constant UNICODE_FILTER: "Cc", "Cf", "Cn", "Co", "Cs", "Mc", "Me", "Mn", "Pc", "Pd", "Pe", "Pf", "Pi", "Po", "Ps"
    /*
    gc ; C                                ; Other                            # Cc | Cf | Cn | Co | Cs
    gc ; Cc                               ; Control                          ; cntrl
    gc ; Cf                               ; Format
    gc ; Cn                               ; Unassigned
    gc ; Co                               ; Private_Use
    gc ; Cs                               ; Surrogate
    */
    text = text.replace(/\p{Other}/gu, '');

    /*
    gc ; M                                ; Mark                             ; Combining_Mark                   # Mc | Me | Mn
    gc ; Mc                               ; Spacing_Mark
    gc ; Me                               ; Enclosing_Mark
    gc ; Mn                               ; Nonspacing_Mark
    */
    text = text.replace(/\p{Mark}/gu, '');

    /*
    gc ; P                                ; Punctuation                      ; punct                            # Pc | Pd | Pe | Pf | Pi | Po | Ps
    gc ; Pc                               ; Connector_Punctuation
    gc ; Pd                               ; Dash_Punctuation
    gc ; Pe                               ; Close_Punctuation
    gc ; Pf                               ; Final_Punctuation
    gc ; Pi                               ; Initial_Punctuation
    gc ; Po                               ; Other_Punctuation
    gc ; Ps                               ; Open_Punctuation
    */
    text = text.replace(/\p{Punctuation}/gu, '');

    text = text.normalize('NFKC');

    return text;
}
