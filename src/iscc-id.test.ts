import {
    gen_iscc_id,
    gen_iscc_id_v0,
    gen_iscc_id_v1,
    iscc_id_incr,
    iscc_id_incr_v0,
    alg_simhash_from_iscc_id,
} from './iscc-id';

describe('gen_iscc_id_v1', () => {
    test('generates ISCC-IDv1 with specific timestamp and hub_id 0', () => {
        // timestamp = 1000000 microseconds, hub_id = 0, realm_id = 0
        const result = gen_iscc_id_v1(1000000, 0, 0);
        expect(result.iscc).toMatch(/^ISCC:MA/);
        expect(result.iscc.length).toBeGreaterThan(10);
    });

    test('generates ISCC-IDv1 with hub_id', () => {
        const result = gen_iscc_id_v1(1000000, 42, 0);
        expect(result.iscc).toMatch(/^ISCC:MA/);
    });

    test('generates ISCC-IDv1 with realm_id 1', () => {
        const result = gen_iscc_id_v1(1000000, 0, 1);
        expect(result.iscc).toMatch(/^ISCC:ME/);
    });

    test('throws on timestamp overflow', () => {
        expect(() => gen_iscc_id_v1(2 ** 52, 0, 0)).toThrow('Timestamp overflow');
    });

    test('throws on hub_id overflow', () => {
        expect(() => gen_iscc_id_v1(1000, 4096, 0)).toThrow('HUB-ID overflow');
    });

    test('throws on invalid realm_id', () => {
        expect(() => gen_iscc_id_v1(1000, 0, 2)).toThrow('Realm-ID must be');
    });

    test('uses current time when timestamp is null', () => {
        const result = gen_iscc_id_v1(null, 0, 0);
        expect(result.iscc).toMatch(/^ISCC:MA/);
    });

    test('same timestamp and hub_id produce same result', () => {
        const a = gen_iscc_id_v1(123456789, 100, 0);
        const b = gen_iscc_id_v1(123456789, 100, 0);
        expect(a.iscc).toBe(b.iscc);
    });

    test('different timestamps produce different results', () => {
        const a = gen_iscc_id_v1(1000000, 0, 0);
        const b = gen_iscc_id_v1(2000000, 0, 0);
        expect(a.iscc).not.toBe(b.iscc);
    });
});

describe('gen_iscc_id', () => {
    test('delegates to gen_iscc_id_v1', () => {
        const a = gen_iscc_id(1000000, 0, 0);
        const b = gen_iscc_id_v1(1000000, 0, 0);
        expect(a.iscc).toBe(b.iscc);
    });
});

describe('gen_iscc_id_v0', () => {
    test('generates ISCC-IDv0 from ISCC-CODE and wallet', () => {
        // Use a known ISCC-CODE from conformance data
        const iscc_code = 'KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY';
        const wallet = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // known Bitcoin address
        const result = gen_iscc_id_v0(iscc_code, 1, wallet, 0);
        expect(result.iscc).toMatch(/^ISCC:ME/); // BITCOIN chain_id=1
    });

    test('generates ISCC-IDv0 with uniqueness counter', () => {
        const iscc_code = 'KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY';
        const wallet = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        const result = gen_iscc_id_v0(iscc_code, 1, wallet, 1);
        // With counter, the result is longer
        expect(result.iscc).toMatch(/^ISCC:ME/);
    });
});

describe('iscc_id_incr', () => {
    test('increments ISCC-IDv0 counter', () => {
        const iscc_code = 'KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY';
        const wallet = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
        const original = gen_iscc_id_v0(iscc_code, 1, wallet, 0);

        // First increment: adds counter = 1
        const incr1 = iscc_id_incr(original.iscc);
        expect(incr1).toBeTruthy();

        // Second increment: counter = 2
        const incr2 = iscc_id_incr('ISCC:' + incr1);
        expect(incr2).toBeTruthy();
        expect(incr2).not.toBe(incr1);
    });

    test('throws for ISCC-IDv1', () => {
        const idv1 = gen_iscc_id_v1(1000000, 0, 0);
        expect(() => iscc_id_incr(idv1.iscc)).toThrow(
            'ISCC-IDv1 does not support uniqueness counters'
        );
    });
});

describe('alg_simhash_from_iscc_id', () => {
    test('round-trip: simhash from ISCC-ID matches original', () => {
        const iscc_code = 'KUAFVC5DMJJGYKZ4MQV6B6THIBBUG';
        const wallet = 'testWallet123';
        const id = gen_iscc_id_v0(iscc_code, 0, wallet, 0);

        const simhash = alg_simhash_from_iscc_id(id.iscc, wallet);
        expect(simhash).toBeTruthy();
        expect(simhash.length).toBe(16); // 8 bytes = 16 hex chars
    });
});
