import { gen_text_code, soft_hash_text_v0 } from './code-content-text';
import { text_collapse } from './content-normalization';
const TEXT_A = `
    Their most significant and usefull property of similarity-preserving
    fingerprints gets lost in the fragmentation of individual, propietary and
    use case specific implementations. The real benefit lies in similarity
    preservation beyond your local data archive on a global scale accross
    vendors.
`;

const TEXT_B = `
    The most significant and usefull property of similarity-preserving
    fingerprints gets lost in the fragmentation of individual, propietary and
    use case specific implementations. The real benefit lies in similarity
    preservation beyond your local data archive on a global scale accross
    vendors.
`;

const TEXT_C = `
    A need for open standard fingerprinting. We don´t need the best
    Fingerprinting algorithm just an accessible and widely used one.
`;

test('test_hash_text_a', () => {
    const a = Buffer.from(soft_hash_text_v0(TEXT_A)).toString('hex');
    expect(a).toBe(
        '5f869a775c18bfbc3a117ab0114e13b2bf92614cda91513ee1f889fef3d6985f'
    );
});

test('test_hash_text_b', () => {
    const a = Buffer.from(soft_hash_text_v0(TEXT_B)).toString('hex');
    expect(a).toBe(
        '5f869a775c18bdfc3a117ab0114e13f2bf92610cda91513ee1f889bef3d6985f'
    );
});

test('test_hash_text_c', () => {
    const a = Buffer.from(soft_hash_text_v0(TEXT_C)).toString('hex');
    expect(a).toBe(
        '377b2f7b099a6df6bbc4a2ee4ff957b944c6434fa0e78842e7aad1169b71dd07'
    );
});

test('test_gen_text_code_a_default', () => {
    const a = gen_text_code(TEXT_A);
    expect(a).toEqual({ iscc: 'ISCC:EAAZHFKU6PNI7UVW', characters: 249 });
});

test('test_gen_text_code_a_32bits', () => {
    const a = gen_text_code(TEXT_A, 32);
    expect(a).toEqual({ iscc: 'ISCC:EAAJHFKU6M', characters: 249 });
});

test('test_code_text_b_128_bits', () => {
    const b = gen_text_code(TEXT_B, 128);
    expect(b).toEqual({
        iscc: 'ISCC:EABZHFKU6PNIXUVWYEEIQLOYHILX6',
        characters: 247
    });
});

test('test_code_text_c_256_bits', () => {
    const c = gen_text_code(TEXT_C, 256);
    expect(c).toEqual({
        iscc: 'ISCC:EADQE77SQ5NHKYPCDXT3E2NTB2EGV7VSKEUJDNXG2MICLCFZOPSDI4I',
        characters: 108
    });
});

test('test_normalize_text', () => {
    const txt =
        '  Iñtërnâtiôn\nàlizætiøn☃💩 –  is a tric\t ky \u00A0 thing!\r';
    const normalized = text_collapse(txt);
    expect(normalized).toEqual('internationalizætiøn☃💩isatrickything');
    expect(text_collapse(' ')).toEqual('');
    expect(text_collapse('  Hello  World ? ')).toEqual('helloworld');
    expect(text_collapse('Hello\nWorld')).toEqual('helloworld');
});

test('test_code_text_empty', () => {
    const empty = gen_text_code('', 128);
    expect(empty).toEqual({
        iscc: 'ISCC:EABSL4F2WZY7KBXBYUZPREWZ26IXU',
        characters: 0
    });
});

test('test_gen_text_code_schema_conformance', () => {
    const hello = gen_text_code('Hello World');
    expect(hello).toEqual({ iscc: 'ISCC:EAASKDNZNYGUUF5A', characters: 10 });
});
