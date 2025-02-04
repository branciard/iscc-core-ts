import { text_trim, text_collapse, text_clean } from './content-normalization';

test('Test trim OK', () => {
    const result = text_trim(' hello world ');
    expect(result).toBe('hello world');
});

test('Test trim OK with text_clean call', () => {
    const result = text_clean(' hello world ');
    expect(result).toBe('hello world');
});

test('Test text_clean do not remove Private_Use_unicode ', () => {
    const Private_Use_unicode = '\u{E000}';
    const result = text_clean(' hello ' + Private_Use_unicode + ' world ');
    expect(result).toBe('hello ' + Private_Use_unicode + ' world');
});

test('Test toLowerCase OK', () => {
    const result = text_collapse('HelloWorld');
    expect(result).toBe('helloworld');
});

test('Test remove all space OK', () => {
    const result = text_collapse('hello world');
    expect(result).toBe('helloworld');
});

/**
    gc ; P                                ; Punctuation                      ; punct                            # Pc | Pd | Pe | Pf | Pi | Po | Ps
    gc ; Pc                               ; Connector_Punctuation
    gc ; Pd                               ; Dash_Punctuation
    gc ; Pe                               ; Close_Punctuation
    gc ; Pf                               ; Final_Punctuation
    gc ; Pi                               ; Initial_Punctuation
    gc ; Po                               ; Other_Punctuation
    gc ; Ps                               ; Open_Punctuation
 */

test('Test filter Punctuation unicode OK', () => {
    const Dash_Punctuation_unicode = '\u{301C}';
    const result = text_collapse('helloworld' + Dash_Punctuation_unicode);
    expect(result).toBe('helloworld');
});

/**
    gc ; M                                ; Mark                             ; Combining_Mark                   # Mc | Me | Mn
    gc ; Mc                               ; Spacing_Mark
    gc ; Me                               ; Enclosing_Mark
    gc ; Mn                               ; Nonspacing_Mark
 */

test('Test filter Mark unicode OK', () => {
    const Enclosing_Mark_unicode = '\u{20E4}';
    const result = text_collapse('helloworld' + Enclosing_Mark_unicode);
    expect(result).toBe('helloworld');
});

/**
    gc ; C                                ; Other                            # Cc | Cf | Cn | Co | Cs
    gc ; Cc                               ; Control                          ; cntrl
    gc ; Cf                               ; Format
    gc ; Cn                               ; Unassigned
    gc ; Co                               ; Private_Use
    gc ; Cs                               ; Surrogate
 */

test('Test filter Other unicode on text_collapse OK', () => {
    const Private_Use_unicode = '\u{E000}';
    const result = text_collapse('hello world' + Private_Use_unicode);
    expect(result).toBe('helloworld');
});
