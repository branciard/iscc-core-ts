/**
 *
 *
 * Specification implementaton of https://iscc.codes/specification/#text_trim
 *
 * @param text
 * @returns
 */

import XRegExp from 'xregexp';

export function text_trim(text: string, limit?: number): string {
    return text_encodeUTF8(text, limit).trim();
}

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

export function text_remove_newlines(text: string): string {
    return text
        .split(/(\s+)/)
        .filter((x) => x.trim().length > 0)
        .join(' ');
}

function isCharControlCategoryUnicode(s: string) {
    const cc = XRegExp('^\\p{Control}+$');
    if (cc.test(s)) {
        return true;
    } else {
        return false;
    }
}

function isCharNewLinesUnicode(s: string) {
    const regex = /\u000A|\u000B|\u000C|\u000D|\u0085|\u2028|\u2029/;
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
