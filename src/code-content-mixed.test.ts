import { gen_text_code_v0 } from './code-content-text';
import { gen_mixed_code, gen_mixed_code_v0 } from './code-content-mixed';
import { gen_meta_code_v0 } from './metacode';

test('test_gen_mixed_code_v0_single_raises', () => {
    const tc = gen_text_code_v0('Hello World',  64 );
    expect(() => {
        gen_mixed_code_v0([tc.iscc]);
    }).toThrow('Minimum of 2 codes needed for Content-Code-Mixed.');
});


test('test_gen_mixed_code_v0_non_cc_raises', async () => {
    const tc = gen_text_code_v0('Hello World').iscc;
    const metacode = await gen_meta_code_v0('Meta Code Title');
    const mc = metacode.iscc;

    const codes = [tc, mc];
    expect(() => {
        gen_mixed_code_v0(codes, 64 );
    }).toThrow('Only codes with main-type CONTENT allowed as input for Content-Code-Mixed');
});


test('test_gen_mixed_code_v0_codes_mixed_length', () => {
    const tc_long = gen_text_code_v0('Hello World',  256 ).iscc;
    const tc_short = gen_text_code_v0('Short Text-Code', 64 ).iscc;
    const codes = [tc_long, tc_short];
    expect(codes[0]).toEqual('ISCC:EADSKDNZNYGUUF5AMFEJLZ5P66CP5YKCOA3X7F36RWE4CIRCBTUWXYY');
    expect(codes[1]).toEqual('ISCC:EAA3265Q67Q27P7F');

    expect(gen_mixed_code_v0(codes,  64 )).toEqual({
        iscc: 'ISCC:EQASBPL7XH763357',
        parts: [
            'ISCC:EADSKDNZNYGUUF5AMFEJLZ5P66CP5YKCOA3X7F36RWE4CIRCBTUWXYY',
            'ISCC:EAA3265Q67Q27P7F',
        ],
    });
});


test('test_gen_mixed_code_v0_codes_too_short_raises', () => {
    const tc_long = gen_text_code_v0('Hello World', 256 ).iscc;
    const tc_short = gen_text_code_v0('Short Text-Code',  64 ).iscc;
    const codes = [tc_long, tc_short];
    expect(() => {
        gen_mixed_code_v0(codes,128 );
    }).toThrow('Code too short for 128-bit length');
});

test('test_gen_mixed_code_codes_too_short_raises', () => {
    const tc_long = gen_text_code_v0('Hello World', 256 ).iscc;
    const tc_short = gen_text_code_v0('Short Text-Code', 64 ).iscc;
    const codes = [tc_long, tc_short];
    expect(() => {
        gen_mixed_code(codes,128 );
    }).toThrow('Code too short for 128-bit length');
});

test('test_gen_mixed_code_schema_conformance', () => {
    const tc_long = gen_text_code_v0('Hello World',  256 ).iscc;
    const tc_short = gen_text_code_v0('Short Text-Code',  64 ).iscc;
    const codes = [tc_long, tc_short];
    const iscc_obj = gen_mixed_code_v0(codes);
    expect(iscc_obj).toEqual({
        iscc: 'ISCC:EQASBPL7XH763357',
        parts: [
            'ISCC:EADSKDNZNYGUUF5AMFEJLZ5P66CP5YKCOA3X7F36RWE4CIRCBTUWXYY',
            'ISCC:EAA3265Q67Q27P7F',
        ],
    });
});


/*





def test_gen_mixed_code_v0_non_cc_raises():
    tc = iscc_core.gen_text_code_v0("Hello World", bits=64)["iscc"]
    mc = iscc_core.gen_meta_code_v0("Meta Code Title", bits=64)["iscc"]
    codes = tc, mc
    with pytest.raises(AssertionError):
        iscc_core.gen_mixed_code_v0(codes, bits=64)


def test_gen_mixed_code_v0_codes_mixed_length():
    tc_long = iscc_core.gen_text_code_v0("Hello World", bits=256)["iscc"]
    tc_short = iscc_core.gen_text_code_v0("Short Text-Code", bits=64)["iscc"]
    codes = tc_long, tc_short
    assert iscc_core.gen_mixed_code_v0(codes=codes, bits=64) == {
        "iscc": "ISCC:EQASBPL7XH763357",
        "parts": [
            "ISCC:EADSKDNZNYGUUF5AMFEJLZ5P66CP5YKCOA3X7F36RWE4CIRCBTUWXYY",
            "ISCC:EAA3265Q67Q27P7F",
        ],
    }


def test_gen_mixed_code_v0_codes_to_short_raises():
    tc_long = iscc_core.gen_text_code_v0("Hello World", bits=256)["iscc"]
    tc_short = iscc_core.gen_text_code_v0("Short Text-Code", bits=64)["iscc"]
    codes = tc_long, tc_short
    with pytest.raises(AssertionError):
        iscc_core.gen_mixed_code_v0(codes=codes, bits=128)


def test_gen_mixed_code_codes_to_short_raises():
    tc_long = iscc_core.gen_text_code_v0("Hello World", bits=256)["iscc"]
    tc_short = iscc_core.gen_text_code_v0("Short Text-Code", bits=64)["iscc"]
    codes = tc_long, tc_short
    with pytest.raises(AssertionError):
        iscc_core.gen_mixed_code(codes=codes, bits=128)


def test_gen_mixed_code_schema_conformance():
    tc_long = iscc_core.gen_text_code_v0("Hello World", bits=256)["iscc"]
    tc_short = iscc_core.gen_text_code_v0("Short Text-Code", bits=64)["iscc"]
    codes = tc_long, tc_short
    iscc_obj = iscc_core.gen_mixed_code_v0(codes=codes)
    assert iscc_obj == {
        "iscc": "ISCC:EQASBPL7XH763357",
        "parts": [
            "ISCC:EADSKDNZNYGUUF5AMFEJLZ5P66CP5YKCOA3X7F36RWE4CIRCBTUWXYY",
            "ISCC:EAA3265Q67Q27P7F",
        ],
    }


    */