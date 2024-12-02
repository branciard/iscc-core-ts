import { hash_instance_v0, gen_instance_code_v0 } from './code-instance';

describe('Instance Code Tests', () => {
    test('hash_instance_v0_empty', async () => {
        const digest = await hash_instance_v0(Buffer.from(''));
        expect(digest).toBe('af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262');
    });

  
    test('hash_instance_v0_zero', async () => {
        const digest = await hash_instance_v0(Buffer.from([0]));
        expect(digest).toBe('2d3adedff11b61f14c886e35afa036736dcd87a74d27b5c1510225d0f592e213');
    });
  
    test('gen_instance_code_v0_empty_default', async () => {
        const icObj = await gen_instance_code_v0(Buffer.from(''));
        expect(icObj).toEqual({
            iscc: 'ISCC:IAA26E2JXH27TING',
            datahash: '1e20af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262',
            filesize: 0,
        });
    });

    test('gen_instance_code_v0_zero_default', async () => {
        const icObj = await gen_instance_code_v0(Buffer.from([0]));
        expect(icObj).toEqual({
            iscc: 'ISCC:IAAS2OW637YRWYPR',
            datahash: '1e202d3adedff11b61f14c886e35afa036736dcd87a74d27b5c1510225d0f592e213',
            filesize: 1,
        });
    });

    test('gen_instance_code_v0_hello_world_128', async () => {
        const icObj = await gen_instance_code_v0(Buffer.from('hello world'), 128);
        expect(icObj).toEqual({
            iscc: 'ISCC:IAB5OSMB56TQUDEIBOGYYGMF2B25W',
            datahash: '1e20d74981efa70a0c880b8d8c1985d075dbcbf679b99a5f9914e5aaf96b831a9e24',
            filesize: 11,
        });
    });

    test('gen_instance_code_v0_hello_world_256', async () => {
        const icObj = await gen_instance_code_v0(Buffer.from('hello world'), 256);
        expect(icObj).toEqual({
            iscc: 'ISCC:IAD5OSMB56TQUDEIBOGYYGMF2B25XS7WPG4ZUX4ZCTS2V6LLQMNJ4JA',
            datahash: '1e20d74981efa70a0c880b8d8c1985d075dbcbf679b99a5f9914e5aaf96b831a9e24',
            filesize: 11,
        });
    });

    test('gen_instance_code_schema_conformance', async () => {
        const isccObj = await gen_instance_code_v0(Buffer.from('hello world'));
        expect(isccObj).toEqual({
            iscc: 'ISCC:IAA5OSMB56TQUDEI',
            datahash: '1e20d74981efa70a0c880b8d8c1985d075dbcbf679b99a5f9914e5aaf96b831a9e24',
            filesize: 11,
        });
    });
});