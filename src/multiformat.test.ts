import { iscc_clean, iscc_decode, iscc_decompose } from './codec';

describe('multiformat', () => {
    // Test constants
    const CANONICAL = 'ISCC:EAAWFH3PX3MCYB6N';
    const MF_B32H = 'vpg0i00b2jtnrtm1c0v6g';
    const MF_B32H_P = 'iscc:vpg0i00b2jtnrtm1c0v6g';

    test('test_iscc_clean', () => {
        expect(iscc_clean(MF_B32H)).toBe(MF_B32H);
        expect(iscc_clean(MF_B32H_P)).toBe(MF_B32H);
    });

    test('iscc_decode', () => {
        const ISCC_OBJ = iscc_decode(CANONICAL);
        const expected = [...ISCC_OBJ.slice(0, 4), ISCC_OBJ[4]];

        expect(iscc_decode(MF_B32H)).toEqual(expected);
        expect(iscc_decode(MF_B32H_P)).toEqual(expected);
    });

    test('iscc_decompose', () => {
        const decomposed = iscc_decompose(CANONICAL);
        expect(iscc_decompose(MF_B32H)).toEqual(decomposed);
        expect(iscc_decompose(MF_B32H_P)).toEqual(decomposed);
    });


});
