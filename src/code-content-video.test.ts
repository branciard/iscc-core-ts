
import { gen_video_code, gen_video_code_v0, soft_hash_video_v0} from './code-content-video';

test('test_hash_video_v0_features', () => {

    const input = Array(380).fill(0);
    const result = soft_hash_video_v0([input], 256);
    const expected = new Uint8Array(32).fill(0);
    expect(result).toEqual(expected);
});

test('hash_video_v0_range', () => {
    const frame_vectors = [Array.from({ length: 380 }, (_, i) => i)];
    const result = soft_hash_video_v0(frame_vectors, 256);
    const expected = "528f91431f7c4ad26932fc073a28cac93f21a3071a152fc2925bdaed1d190061";
    expect(Buffer.from(result).toString('hex')).toBe(expected);
});

test('hash_video_v0_multiple_framevectors', () => {
    const fa = Array(76).fill([0, 1, 0, 2, 1]).flat();
    const fb = Array(76).fill([1, 2, 1, 0, 2]).flat();
    const frame_vectors = [fa, fb];
    const result = soft_hash_video_v0(frame_vectors, 256);
    const expected = "9230d219501e00f42664b4bd206b000c98488635b0b03c010010ee00aaf93e43";
    expect(Buffer.from(result).toString('hex')).toBe(expected);
});

test('code_video_v0_features', () => {
    const input = [Array(380).fill(0)];
    const result = gen_video_code_v0(input);
    expect(result).toEqual({ "iscc": "ISCC:EMAQAAAAAAAAAAAA" });
});

test('code_video_v0_range_128', () => {
    const frame_vectors = [Array.from({ length: 380 }, (_, i) => i)];
    const result = gen_video_code_v0(frame_vectors, 128);
    expect(result).toEqual({ "iscc": "ISCC:EMBVFD4RIMPXYSWSNEZPYBZ2FDFMS" });
});

test('code_video_v0_multiple_framevectors_256', () => {
    const fa = Array(76).fill([0, 1, 0, 2, 1]).flat();
    const fb = Array(76).fill([1, 2, 1, 0, 2]).flat();
    const frame_vectors = [fa, fb];
    const result = gen_video_code_v0(frame_vectors, 256);
    expect(result).toEqual({ "iscc": "ISCC:EMDZEMGSDFIB4AHUEZSLJPJANMAAZGCIQY23BMB4AEABB3QAVL4T4QY" });
});

test('code_video_multiple_framevectors_256', () => {
    const fa = Array(76).fill([0, 1, 0, 2, 1]).flat();
    const fb = Array(76).fill([1, 2, 1, 0, 2]).flat();
    const frame_vectors = [fa, fb];
    const result = gen_video_code(frame_vectors, 256);
    expect(result).toEqual({ "iscc": "ISCC:EMDZEMGSDFIB4AHUEZSLJPJANMAAZGCIQY23BMB4AEABB3QAVL4T4QY" });
});

test('gen_video_code_schema_conformance', () => {
    const fa = Array(76).fill([0, 1, 0, 2, 1]).flat();
    const fb = Array(76).fill([1, 2, 1, 0, 2]).flat();
    const frame_vectors = [fa, fb];
    const result = gen_video_code_v0(frame_vectors);
    expect(result).toEqual({ "iscc": "ISCC:EMAZEMGSDFIB4AHU" });
});