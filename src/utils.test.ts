import { binaryArrayToUint8Array, sliding_window } from './utils';

test('test_gen_meta_code_sliding_window', () => {
    const result = sliding_window('abcdef', 3);
    expect(result).toEqual(['abc', 'bcd', 'cde', 'def']);
});

test('test binaryArrayToUint8Array 1', async () => {
    const result = binaryArrayToUint8Array('0001');
    const resultExpected: Uint8Array = new Uint8Array(1);
    resultExpected[0] = 16;
    expect(resultExpected).toStrictEqual(result);
});

test('test binaryArrayToUint8Array 2', async () => {
    const result = binaryArrayToUint8Array('00010000');
    const resultExpected: Uint8Array = new Uint8Array(1);
    resultExpected[0] = 16;
    expect(resultExpected).toStrictEqual(result);
});

test('test binaryArrayToUint8Array 3', async () => {
    const result = binaryArrayToUint8Array('0001000000011');
    const resultExpected: Uint8Array = new Uint8Array(2);
    resultExpected[0] = 16;
    resultExpected[1] = 24;
    expect(resultExpected).toStrictEqual(result);
});

test('test binaryArrayToUint8Array 4', async () => {
    const result = binaryArrayToUint8Array('0001000000011000');
    const resultExpected: Uint8Array = new Uint8Array(2);
    resultExpected[0] = 16;
    resultExpected[1] = 24;
    expect(resultExpected).toStrictEqual(result);
});
