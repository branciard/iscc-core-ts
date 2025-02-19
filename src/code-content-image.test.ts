import {
    gen_image_code,
    gen_image_code_v0,
    soft_hash_image_v0,
    algDct
} from './code-content-image';

export const IMG_WHITE_PIXELS: number[] = Array(1024).fill(255);
export const IMG_BLACK_PIXELS: number[] = Array(1024).fill(0);
export const IMG_SAMPLE_PIXELS: number[] = [
    23, 17, 13, 15, 25, 79, 91, 91, 105, 68, 109, 99, 98, 93, 75, 69, 58, 51,
    51, 71, 153, 159, 130, 80, 94, 80, 90, 77, 50, 19, 23, 26, 18, 16, 8, 9, 16,
    68, 107, 112, 73, 79, 112, 97, 106, 90, 72, 76, 87, 67, 43, 112, 174, 161,
    122, 74, 97, 68, 56, 72, 50, 17, 18, 22, 15, 18, 10, 7, 11, 64, 141, 95, 70,
    96, 110, 128, 121, 70, 67, 68, 102, 129, 124, 166, 182, 168, 103, 47, 88,
    71, 44, 62, 53, 17, 18, 21, 13, 17, 11, 7, 6, 112, 200, 173, 101, 93, 123,
    128, 94, 71, 75, 77, 115, 133, 154, 177, 206, 178, 84, 33, 70, 71, 45, 42,
    49, 18, 17, 20, 13, 17, 12, 7, 6, 107, 188, 214, 184, 98, 90, 101, 87, 84,
    80, 83, 108, 121, 137, 177, 213, 188, 53, 31, 35, 50, 49, 35, 40, 20, 16,
    19, 17, 18, 12, 7, 8, 89, 185, 213, 207, 173, 79, 82, 92, 89, 73, 94, 112,
    96, 80, 126, 181, 175, 45, 27, 35, 25, 37, 42, 42, 22, 16, 20, 19, 18, 13,
    7, 8, 69, 180, 223, 208, 190, 148, 116, 120, 99, 71, 85, 121, 99, 106, 121,
    117, 126, 63, 22, 36, 31, 28, 46, 48, 24, 17, 20, 18, 20, 16, 8, 7, 61, 143,
    221, 223, 207, 176, 129, 130, 88, 98, 73, 98, 122, 124, 130, 129, 90, 53,
    16, 32, 44, 31, 47, 44, 24, 18, 19, 18, 22, 17, 8, 6, 53, 97, 193, 221, 216,
    200, 153, 130, 111, 99, 93, 103, 144, 129, 105, 106, 70, 44, 21, 25, 39, 33,
    51, 40, 23, 19, 19, 19, 24, 19, 9, 5, 43, 98, 178, 215, 221, 188, 152, 155,
    123, 115, 103, 109, 147, 146, 136, 106, 81, 53, 22, 26, 27, 35, 51, 37, 23,
    19, 20, 21, 25, 20, 11, 5, 28, 103, 161, 197, 207, 190, 179, 169, 139, 133,
    119, 105, 139, 124, 132, 115, 88, 61, 22, 36, 43, 38, 55, 36, 25, 24, 24,
    23, 25, 19, 13, 6, 16, 87, 112, 158, 188, 182, 168, 166, 153, 129, 123, 132,
    127, 159, 155, 119, 106, 71, 27, 35, 41, 47, 59, 39, 28, 26, 27, 24, 25, 19,
    14, 8, 6, 75, 128, 161, 171, 174, 153, 167, 169, 133, 93, 154, 125, 114, 96,
    103, 83, 74, 31, 32, 40, 50, 72, 42, 31, 27, 28, 26, 24, 18, 16, 13, 3, 54,
    131, 164, 163, 185, 191, 182, 175, 168, 128, 149, 131, 64, 125, 134, 82, 49,
    35, 33, 46, 55, 72, 38, 28, 26, 28, 26, 23, 18, 17, 16, 9, 29, 128, 167,
    180, 195, 175, 146, 207, 182, 157, 129, 107, 140, 128, 156, 108, 87, 33, 33,
    44, 56, 49, 32, 27, 26, 30, 26, 24, 18, 18, 19, 19, 22, 107, 174, 168, 168,
    203, 147, 202, 223, 166, 127, 75, 84, 133, 145, 113, 80, 33, 39, 53, 43, 28,
    30, 33, 31, 35, 26, 21, 19, 23, 28, 25, 19, 80, 146, 134, 210, 161, 199,
    151, 225, 175, 128, 90, 137, 173, 102, 81, 56, 38, 55, 61, 33, 26, 36, 39,
    35, 35, 26, 23, 25, 26, 33, 38, 21, 32, 141, 207, 194, 184, 134, 150, 215,
    202, 129, 68, 144, 124, 104, 98, 66, 56, 70, 54, 38, 38, 36, 36, 37, 38, 26,
    26, 26, 25, 31, 40, 39, 27, 93, 207, 211, 161, 179, 201, 159, 210, 139, 48,
    99, 125, 115, 86, 75, 68, 55, 39, 40, 35, 35, 38, 39, 42, 27, 27, 30, 27,
    30, 35, 42, 43, 65, 137, 202, 194, 166, 175, 136, 195, 157, 58, 98, 110,
    112, 90, 80, 54, 20, 23, 33, 40, 39, 42, 41, 43, 26, 27, 36, 29, 29, 34, 37,
    43, 38, 100, 198, 222, 215, 208, 183, 181, 173, 87, 110, 130, 125, 108, 100,
    48, 25, 29, 34, 41, 44, 45, 44, 45, 26, 27, 36, 31, 33, 35, 31, 34, 38, 118,
    234, 231, 241, 212, 227, 180, 119, 149, 138, 141, 146, 142, 131, 60, 48, 49,
    42, 42, 45, 47, 46, 45, 30, 36, 34, 41, 43, 44, 43, 55, 61, 103, 242, 250,
    249, 230, 239, 223, 139, 196, 156, 163, 170, 176, 152, 47, 41, 55, 59, 57,
    52, 45, 45, 46, 35, 45, 34, 38, 52, 57, 61, 54, 63, 104, 220, 254, 241, 240,
    240, 216, 169, 177, 173, 213, 208, 195, 168, 67, 44, 57, 52, 45, 48, 45, 45,
    48, 47, 52, 38, 40, 45, 53, 62, 74, 98, 104, 137, 209, 199, 181, 220, 215,
    180, 109, 122, 241, 236, 214, 163, 60, 58, 48, 61, 54, 49, 44, 46, 50, 58,
    52, 41, 37, 52, 62, 69, 98, 96, 81, 71, 110, 122, 104, 121, 120, 93, 50, 67,
    219, 249, 215, 127, 66, 59, 54, 41, 58, 55, 41, 45, 53, 67, 61, 54, 32, 67,
    87, 81, 92, 79, 70, 61, 102, 90, 82, 74, 71, 70, 57, 40, 110, 187, 132, 88,
    81, 68, 56, 48, 58, 64, 44, 45, 52, 73, 72, 51, 36, 80, 87, 85, 88, 63, 70,
    75, 87, 81, 75, 75, 74, 78, 67, 50, 54, 69, 50, 73, 79, 75, 57, 62, 55, 65,
    55, 45, 52, 77, 72, 40, 51, 78, 74, 91, 85, 54, 78, 91, 72, 83, 73, 76, 73,
    76, 74, 58, 56, 67, 49, 66, 74, 61, 57, 68, 63, 54, 61, 53, 51, 72, 70, 56,
    65, 68, 76, 88, 76, 56, 81, 96, 68, 80, 73, 72, 75, 77, 66, 63, 61, 65, 53,
    65, 69, 59, 59, 61, 70, 53, 64, 51, 55, 70, 68, 64, 67, 66, 70, 79, 68, 66,
    81, 86, 69, 78, 73, 73, 73, 77, 65, 62, 68, 66, 58, 67, 62, 64, 59, 61, 62,
    55, 63, 47, 52, 77, 68, 64, 69, 63, 68, 69, 72, 73, 84, 76, 72, 78, 77, 74,
    72, 77, 67, 67, 64, 70, 59, 64, 65, 66, 65, 60, 65, 53, 61, 49, 51
];

test('test_gen_image_code_v0_default', () => {
    const result = gen_image_code_v0(IMG_SAMPLE_PIXELS);
    expect(result).toEqual({ iscc: 'ISCC:EEA4GQZQTY6J5DTH' });
});

test('test_gen_image_code_v0_32bit', () => {
    const result = gen_image_code_v0(IMG_SAMPLE_PIXELS, 32);
    expect(result).toEqual({ iscc: 'ISCC:EEAMGQZQTY' });
});

test('test_gen_image_code_v0_256bit', () => {
    const result = gen_image_code_v0(IMG_SAMPLE_PIXELS, 256);
    expect(result).toEqual({
        iscc: 'ISCC:EED4GQZQTY6J5DTHQ2DWCPDZHQOM6QZQTY6J5DTFZ2DWCPDZHQOMXDI'
    });
});

test('test_hash_image_v0_white', () => {
    expect(
        Buffer.from(soft_hash_image_v0(IMG_WHITE_PIXELS, 64)).toString('hex')
    ).toEqual('8000000000000000');
    expect(
        Buffer.from(soft_hash_image_v0(IMG_WHITE_PIXELS, 256)).toString('hex')
    ).toEqual(
        '8000000000000000000000000000000000000000000000000000000000000000'
    );
});

test('test_hash_image_v0_black', () => {
    expect(
        Buffer.from(soft_hash_image_v0(IMG_BLACK_PIXELS, 64)).toString('hex')
    ).toEqual('0000000000000000');
    expect(
        Buffer.from(soft_hash_image_v0(IMG_BLACK_PIXELS, 256)).toString('hex')
    ).toEqual(
        '0000000000000000000000000000000000000000000000000000000000000000'
    );
});

test('test_hash_image_v0_sample', () => {
    expect(
        Buffer.from(soft_hash_image_v0(IMG_SAMPLE_PIXELS, 64)).toString('hex')
    ).toEqual('c343309e3c9e8e67');
    expect(
        Buffer.from(soft_hash_image_v0(IMG_SAMPLE_PIXELS, 256)).toString('hex')
    ).toEqual(
        'c343309e3c9e8e678687613c793c1ccf43309e3c9e8e65ce87613c793c1ccb8d'
    );
});

test('test_gen_code_image_v0_white', () => {
    expect(gen_image_code_v0(IMG_WHITE_PIXELS, 64)).toEqual({
        iscc: 'ISCC:EEAYAAAAAAAAAAAA'
    });
    expect(gen_image_code_v0(IMG_WHITE_PIXELS, 96)).toEqual({
        iscc: 'ISCC:EEBIAAAAAAAAAAAAAAAAAAA'
    });
    expect(gen_image_code_v0(IMG_WHITE_PIXELS, 128)).toEqual({
        iscc: 'ISCC:EEBYAAAAAAAAAAAAAAAAAAAAAAAAA'
    });
    expect(gen_image_code_v0(IMG_WHITE_PIXELS, 256)).toEqual({
        iscc: 'ISCC:EEDYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    });
});

test('test_get_code_image_v0', () => {
    expect(gen_image_code_v0(IMG_SAMPLE_PIXELS, 256)).toEqual({
        iscc: 'ISCC:EED4GQZQTY6J5DTHQ2DWCPDZHQOM6QZQTY6J5DTFZ2DWCPDZHQOMXDI'
    });
});

test('test_get_code_image', () => {
    expect(gen_image_code(IMG_SAMPLE_PIXELS, 256)).toEqual({
        iscc: 'ISCC:EED4GQZQTY6J5DTHQ2DWCPDZHQOM6QZQTY6J5DTFZ2DWCPDZHQOMXDI'
    });
});

test('test_dct_empty', () => {
    expect(() => {
        algDct([]);
    }).toThrow('Invalid input length');
});

test('test_dct_zeros', () => {
    const input = new Array(64).fill(0);
    const result = algDct(input);
    expect(result).toEqual(new Array(64).fill(0));
});

test('test_dct_ones', () => {
    const input = new Array(64).fill(1);
    const result = algDct(input);
    const expected = [64, ...new Array(63).fill(0)];
    expect(result).toEqual(expected);
});

test('first element of dct of range(64) should be 2016', () => {
    const input = Array.from({ length: 64 }, (_, i) => i);
    const result = algDct(input);
    expect(result[0]).toBe(2016);
});

test('test_gen_image_code_schema_conformance', () => {
    expect(gen_image_code(IMG_SAMPLE_PIXELS)).toEqual({
        iscc: 'ISCC:EEA4GQZQTY6J5DTH'
    });
});

test('test_soft_hash_image_v0_larger_256_raises', () => {
    expect(() => {
        soft_hash_image_v0(IMG_SAMPLE_PIXELS, 288);
    }).toThrow('288 bits exceeds max length 256 for soft_hash_image');
});
