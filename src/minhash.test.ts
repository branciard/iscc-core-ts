import { algMinhash, algMinhashCompress, algMinhash64 } from './minhash';

export const MAXI64 = (1n << 64n) - 1n
export const MPRIME = (1n << 61n) - 1n
export const MAXH = (1n << 32n) - 1n

test('test MAXI64 MPRIME and MAXH calculus', () => {
    expect(853146490016488653n * 65536n).toBe(55911808369720600363008n)
    expect(55911808369720600363008n + 1089606993368836715n).toBe(55912897976713969199723n)
    expect(55912897976713969199723n & MAXI64).toBe(816689300318251627n)
    expect((((853146490016488653n * 65536n + 1089606993368836715n) & MAXI64) % MPRIME) & MAXH).toBe(1968499307n)
});

test('test_minhash_single_feature', async () => {
    expect(() => {
        algMinhash([]);
    }).toThrow('features is empty array');
});

test('test_minhash_single_feature', async () => {
    expect(65536n).toBe(2n ** 16n);
    const mh = await algMinhash([2n ** 16n])
    expect(mh.length).toBe(64);
    expect(mh.at(0)).toBe(1968499307n);
    expect(mh.at(-1)).toBe(2739100501n);
});

test('test_minhash_compress', async () => {
    // Test case 1
    const mh1 = await algMinhash([2n ** 16n]);
    const digest = algMinhashCompress(mh1);
    
    expect(digest.length).toBe(32);
    expect(Buffer.from(digest).toString('hex')).toBe("a18e2fb2bd663d21db9c7dcc9ae78380253cae5bf089766d87a6b51fcb3f8f8e");
  
    // Test case 2
    const mh2 = [0b10100001n, 0b11000010n, 0b10110100n, 0b10011000n];
    const compressed = algMinhashCompress(mh2);
    const asInt = BigInt(`0x${Buffer.from(compressed).toString('hex')}`);
    
    expect(asInt).toBe(0b1000_0100_0010_0001n);
});

test('test_minhash_32bit_features', async () => {
    const i32 = 2n ** 32n - 1n;
    const mh = await algMinhash([2n ** 64n - 1n]);
    
    for (const n of mh) {
        expect(n).toBeLessThanOrEqual(i32);
    }
});

test('test_minhash_64', async () => {
    const mh = await algMinhash64([2n ** 16n]);
    expect(Buffer.from(mh).toString('hex')).toBe("a18e2fb2bd663d21");
});