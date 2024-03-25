import XRegExp from 'xregexp';
import { gen_meta_code } from './metacode';

test('test_0001_title_only', async () => {
    const result = await gen_meta_code('Die Unendliche Geschichte');
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e200d890ec03394de69d28750ccc89510afaa0b405eec4efbfd79df19d2d5764c83'
    );
    expect(result.iscc).toBe('ISCC:AAAZXZ6OU74YAZIM');
});

test('test_0002_title_extra', async () => {
    const result = await gen_meta_code(
        'Die Unendliche Geschichte',
        'Von Michael Ende'
    );
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('Von Michael Ende');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e209b9077adf626061ab56c2221d44988aa85c5e126066324000b99ac9c8baf4151'
    );
    expect(result.iscc).toBe('ISCC:AAAZXZ6OU4E45RB5');
});

test('test_0003_96_bits', async () => {
    const result = await gen_meta_code(
        'Die Unendliche Geschichte',
        'Von Michael Ende',
        undefined,
        96
    );
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('Von Michael Ende');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e209b9077adf626061ab56c2221d44988aa85c5e126066324000b99ac9c8baf4151'
    );
    expect(result.iscc).toBe('ISCC:AABJXZ6OU4E45RB57GAGKDA');
});

test('test_0004_128_bits', async () => {
    const result = await gen_meta_code(
        'Die Unendliche Geschichte',
        'Von Michael Ende',
        undefined,
        128
    );
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('Von Michael Ende');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e209b9077adf626061ab56c2221d44988aa85c5e126066324000b99ac9c8baf4151'
    );
    expect(result.iscc).toBe('ISCC:AABZXZ6OU4E45RB57GAGKDGHZXV74');
});

test('test_0005_160_bits', async () => {
    const result = await gen_meta_code(
        'Die Unendliche Geschichte',
        'Von Michael Ende',
        undefined,
        160
    );
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('Von Michael Ende');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e209b9077adf626061ab56c2221d44988aa85c5e126066324000b99ac9c8baf4151'
    );
    expect(result.iscc).toBe('ISCC:AACJXZ6OU4E45RB57GAGKDGHZXV752RFK42Q');
});

test('test_0006_192_bits', async () => {
    const result = await gen_meta_code(
        'Die Unendliche Geschichte',
        'Von Michael Ende',
        undefined,
        192
    );
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('Von Michael Ende');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e209b9077adf626061ab56c2221d44988aa85c5e126066324000b99ac9c8baf4151'
    );
    expect(result.iscc).toBe('ISCC:AACZXZ6OU4E45RB57GAGKDGHZXV752RFK424V76TRU');
});

test('test_0007_224_bits', async () => {
    const result = await gen_meta_code(
        'Die Unendliche Geschichte',
        'Von Michael Ende',
        undefined,
        224
    );
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('Von Michael Ende');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e209b9077adf626061ab56c2221d44988aa85c5e126066324000b99ac9c8baf4151'
    );
    expect(result.iscc).toBe(
        'ISCC:AADJXZ6OU4E45RB57GAGKDGHZXV752RFK424V76TRVZ2TKS2'
    );
});

test('test_0008_256_bits', async () => {
    const result = await gen_meta_code(
        'Die Unendliche Geschichte',
        'Von Michael Ende',
        undefined,
        256
    );
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('Von Michael Ende');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e209b9077adf626061ab56c2221d44988aa85c5e126066324000b99ac9c8baf4151'
    );
    expect(result.iscc).toBe(
        'ISCC:AADZXZ6OU4E45RB57GAGKDGHZXV752RFK424V76TRVZ2TKS2K6X5VVA'
    );
});

test('test_0009_i18n', async () => {
    const result = await gen_meta_code(
        'Iñtërnâtiônàlizætiøn☃',
        'Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃',
        undefined,
        256
    );
    expect(result.name).toBe('Iñtërnâtiônàlizætiøn☃');
    expect(result.description).toBe(
        'Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃'
    );
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20295aa6140de0e533bc1b932d5bd70fda0d2315afc88a29bcb572a388a649ba85'
    );
    expect(result.iscc).toBe(
        'ISCC:AADQPPCUKAL34VCQOCRWHDPQU5RY2LMRHPGS3HL35UEPHQ3CDDZ6GYQ'
    );
});

test('test_0010_normalizeation', async () => {
    const result = await gen_meta_code(
        'Die unéndlíche,  Geschichte',
        '',
        undefined,
        64
    );
    expect(result.name).toBe('Die unéndlíche, Geschichte');
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20df7a9affea960fdbc4c90f979903b9a771341695a7af8bdae6f4a95eb523b4a4'
    );
    expect(result.iscc).toBe('ISCC:AAAZXZ6OU74YAZIM');
});

test('test_0011_trim', async () => {
    const result = await gen_meta_code(
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed',
        '',
        undefined,
        64
    );
    expect(result.name).toBe(
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquy'
    );
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20ccde66af338a44fd50f36fbf51a2c4ed5f2b0da54059e7eb758ddcffb4f67f5e'
    );
    expect(result.iscc).toBe('ISCC:AAA76GFOHGPPBMPM');
});

test('test_0012_trim_i18n', async () => {
    const result = await gen_meta_code(
        'Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃',
        '',
        undefined,
        64
    );
    expect(result.name).toBe(
        'Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃ Iñtërnâtiônàlizætiøn☃ Iñt'
    );
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20814471724835ba0a08f0cfde6b6c24056fff20377f3c0c1759ea521af788bb79'
    );
    expect(result.iscc).toBe('ISCC:AAARPPSUKDYKOY4N');
});

test('test_POP_UNICODE_member of unicode C=> Cs category', async () => {
    const cc = XRegExp('^\\p{Control}+$');
    const cf = XRegExp('^\\p{Format}+$');
    const cs = XRegExp('^\\p{Surrogate}+$');
    const co = XRegExp('^\\p{Private_Use}+$');
    const cn = XRegExp('^\\p{Unassigned}+$');
    const POP_UNICODE = '\u{1F4A9}';
    const pop = XRegExp('^\u{1F4A9}+$');
    expect(pop.test(POP_UNICODE)).toBe(true);
    expect(cc.test(POP_UNICODE)).toBe(false);
    expect(cf.test(POP_UNICODE)).toBe(false);
    expect(cs.test(POP_UNICODE)).toBe(true); // !!!!
    expect(co.test(POP_UNICODE)).toBe(false);
    expect(cn.test(POP_UNICODE)).toBe(false);
});

test('test_0013_norm_i18n_256', async () => {
    const POP_UNICODE = '\u{1F4A9}'; // is a member of
    const result = await gen_meta_code(
        'Ç 가 Ω ℍ ① ︷ i⁹ ¼ ǆ ⫝̸ ȴ ȷ ɂ ć',
        '  Iñtërnâtiôn\nàlizætiøn☃' +
            POP_UNICODE +
            ' –  is a tric\t ky   thing!\r',
        undefined,
        256
    );
    expect(result.name).toBe('Ç 가 Ω H 1 { i9 1⁄4 dž ⫝̸ ȴ ȷ ɂ ć');
    expect(result.version).toBe(0);
    //expect(result.description).toBe("Iñtërnâtiôn\nàlizætiøn☃"+POP_UNICODE+" –  is a tric ky   thing!");
    //expect(result.metahash).toBe("1e20e5b0e0d2ee04e7606b7dcb6f6901f4bf78f8b850a91566383b86b22c5127768d");
    //expect(result.iscc).toBe("ISCC:AAD6KOWKOF334VRANKFXRZXZWMVZZDZZAGHC3ON7O5ENTBJ3TXJ5XYQ");
    expect(result.description).toBe(
        'Iñtërnâtiôn\nàlizætiøn☃ –  is a tric ky   thing!'
    );
    expect(result.metahash).toBe(
        '1e20c26498328693e2574e28e957f7290472c18056b5e7433664e77f7bbf680247fe'
    );
    expect(result.iscc).toBe(
        'ISCC:AAD6KOWKOF33YVRANKFXRZXZSMBYZDZZAGHC3OP2M5ENTBJ3DKI4XYQ'
    );
});

test('test_0014_meta_object_json', async () => {
    const json = '{"some": "object"}';
    const result = await gen_meta_code('Hello', '', json, 64);
    expect(result.name).toBe('Hello');
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20111d3302b0605ec558c390ee013ae89ec6eea68ad2317a8b2de3f4169afeb2ca'
    );
    expect(result.iscc).toBe('ISCC:AAAWKLHFXN63LHL2');
    expect(result.meta).toBe(
        'data:application/json;base64,eyJzb21lIjoib2JqZWN0In0='
    );
});

test('test_0015_meta_object_json_ld', async () => {
    const json = '{"@context": "object"}';
    const result = await gen_meta_code('Hello', '', json, 64);
    expect(result.name).toBe('Hello');
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20ff95f0bf53f725bd8c937e9074580a7b0b90c4b5b436fb129f660badd8f614c7'
    );
    expect(result.iscc).toBe('ISCC:AAAWKLHFXN5Z7LLX');
    expect(result.meta).toBe(
        'data:application/ld+json;base64,eyJAY29udGV4dCI6Im9iamVjdCJ9'
    );
});

test('test_0016_meta_data_url', async () => {
    const result = await gen_meta_code(
        'Hello',
        '',
        'data:application/json;charset=utf-8;base64,eyJzb21lIjogIm9iamVjdCJ9',
        64
    );
    expect(result.name).toBe('Hello');
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20796fdfd4ba8db1a63a1ad1377fa735cad99a10ff08bc655a7095d6508e815a0f'
    );
    expect(result.iscc).toBe('ISCC:AAAWKLHFXN43ICP2');
    expect(result.meta).toBe(
        'data:application/json;charset=utf-8;base64,eyJzb21lIjogIm9iamVjdCJ9'
    );
});
