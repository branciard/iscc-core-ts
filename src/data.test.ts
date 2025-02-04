import XRegExp from 'xregexp';
import { gen_meta_code } from './metacode';
import { gen_text_code } from './code-content-text';
import { gen_image_code } from './code-content-image';
import { gen_audio_code } from './code-content-audio';
import { gen_video_code } from './code-content-video';
import { gen_mixed_code } from './code-content-mixed';
import { gen_data_code } from './code-data';
import { gen_instance_code } from './code-instance';
import { gen_iscc_code} from './iscc-code';    

test('gen_meta_code_v0_test_0001_title_only', async () => {
    const result = await gen_meta_code('Die Unendliche Geschichte');
    expect(result.name).toBe('Die Unendliche Geschichte');
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e200d890ec03394de69d28750ccc89510afaa0b405eec4efbfd79df19d2d5764c83'
    );
    expect(result.iscc).toBe('ISCC:AAAZXZ6OU74YAZIM');
});

test('gen_meta_code_v0_test_0002_title_extra', async () => {
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

test('gen_meta_code_v0_test_0003_96_bits', async () => {
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

test('gen_meta_code_v0_test_0004_128_bits', async () => {
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

test('gen_meta_code_v0_test_0005_160_bits', async () => {
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

test('gen_meta_code_v0_test_0006_192_bits', async () => {
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

test('gen_meta_code_v0_test_0007_224_bits', async () => {
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

test('gen_meta_code_v0_test_0008_256_bits', async () => {
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

test('gen_meta_code_v0_test_0009_i18n', async () => {
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

test('gen_meta_code_v0_test_0010_normalizeation', async () => {
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

test('gen_meta_code_v0_test_0011_trim', async () => {
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

test('gen_meta_code_v0_test_0012_trim_i18n', async () => {
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

test('gen_meta_code_v0_test_POP_UNICODE_member of unicode C=> Cs category', async () => {
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

test('gen_meta_code_v0_test_0013_norm_i18n_256', async () => {
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
    expect(result.description).toBe("Iñtërnâtiôn\nàlizætiøn☃"+POP_UNICODE+" –  is a tric ky   thing!");
    expect(result.metahash).toBe("1e20e5b0e0d2ee04e7606b7dcb6f6901f4bf78f8b850a91566383b86b22c5127768d");
    expect(result.iscc).toBe("ISCC:AAD6KOWKOF334VRANKFXRZXZWMVZZDZZAGHC3ON7O5ENTBJ3TXJ5XYQ");
});

test('gen_meta_code_v0_test_0014_meta_object_json', async () => {
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

test('gen_meta_code_v0_test_0015_meta_object_json_ld', async () => {
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

test('gen_meta_code_v0_test_0016_meta_data_url', async () => {
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


test('gen_text_code_v0_test_0000_empty_str', async () => {
    const result = await gen_text_code(
        '',
        64
    );
    expect(result.iscc).toBe('ISCC:EAASL4F2WZY7KBXB');
    expect(result.characters).toBe(0);
});


test('gen_text_code_v0_test_0001_hello_world', async () => {
    const result = await gen_text_code(
      "Hello World",
        64
    );
    expect(result.iscc).toBe('ISCC:EAASKDNZNYGUUF5A');
    expect(result.characters).toBe(10);
});

test('gen_text_code_v0_test_0002_hello_world_256_bits', async () => {
    const result = await gen_text_code(
      "Hello World",
      256
    );
    expect(result.iscc).toBe('ISCC:EADSKDNZNYGUUF5AMFEJLZ5P66CP5YKCOA3X7F36RWE4CIRCBTUWXYY');
    expect(result.characters).toBe(10);
}); 

test('gen_text_code_v0_test_0003_i18n', async () => {
    const result = await gen_text_code(
      "Iñtërnâtiônàlizætiøn☃    Iñtërnâtiônàlizætiøn☃",
      256
    );
    expect(result.iscc).toBe('ISCC:EADTJCW2DT555KK6DEQAR5DQT7VYJGZM6CXHG3BM56WOMQDDVS7754I');
    expect(result.characters).toBe(42);
}); 

test('gen_text_code_v0_test_0004_more', async () => {
    const result = await gen_text_code(
      "Their most significant and usefull property of similarity-preserving fingerprints gets lost in the fragmentation of individual, propietary and use case specific implementations. The real benefit lies in similarity preservation beyond your local data archive on a global scale accross vendors.\n",
      128
    );
    expect(result.iscc).toBe('ISCC:EABZHFKU6PNI7UVWYEEIQLOYHYLX6');
    expect(result.characters).toBe(249);
}); 

test('gen_image_code_v0_test_0000_all_black_64', async () => {
    const result = await gen_image_code(
     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
     64
    );
    expect(result.iscc).toBe('ISCC:EEAQAAAAAAAAAAAA');
}); 

test('gen_image_code_v0_test_0001_all_white_128', async () => {
    const result = await gen_image_code(
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        128
    );
    expect(result.iscc).toBe('ISCC:EEBYAAAAAAAAAAAAAAAAAAAAAAAAA');
}); 

test('gen_image_code_v0_test_0003_img_256', async () => {
    const result = await gen_image_code(
        [23, 17, 13, 15, 25, 79, 91, 91, 105, 68, 109, 99, 98, 93, 75, 69, 58, 51, 51, 71, 153, 159, 130, 80, 94, 80, 90, 77, 50, 19, 23, 26, 18, 16, 8, 9, 16, 68, 107, 112, 73, 79, 112, 97, 106, 90, 72, 76, 87, 67, 43, 112, 174, 161, 122, 74, 97, 68, 56, 72, 50, 17, 18, 22, 15, 18, 10, 7, 11, 64, 141, 95, 70, 96, 110, 128, 121, 70, 67, 68, 102, 129, 124, 166, 182, 168, 103, 47, 88, 71, 44, 62, 53, 17, 18, 21, 13, 17, 11, 7, 6, 112, 200, 173, 101, 93, 123, 128, 94, 71, 75, 77, 115, 133, 154, 177, 206, 178, 84, 33, 70, 71, 45, 42, 49, 18, 17, 20, 13, 17, 12, 7, 6, 107, 188, 214, 184, 98, 90, 101, 87, 84, 80, 83, 108, 121, 137, 177, 213, 188, 53, 31, 35, 50, 49, 35, 40, 20, 16, 19, 17, 18, 12, 7, 8, 89, 185, 213, 207, 173, 79, 82, 92, 89, 73, 94, 112, 96, 80, 126, 181, 175, 45, 27, 35, 25, 37, 42, 42, 22, 16, 20, 19, 18, 13, 7, 8, 69, 180, 223, 208, 190, 148, 116, 120, 99, 71, 85, 121, 99, 106, 121, 117, 126, 63, 22, 36, 31, 28, 46, 48, 24, 17, 20, 18, 20, 16, 8, 7, 61, 143, 221, 223, 207, 176, 129, 130, 88, 98, 73, 98, 122, 124, 130, 129, 90, 53, 16, 32, 44, 31, 47, 44, 24, 18, 19, 18, 22, 17, 8, 6, 53, 97, 193, 221, 216, 200, 153, 130, 111, 99, 93, 103, 144, 129, 105, 106, 70, 44, 21, 25, 39, 33, 51, 40, 23, 19, 19, 19, 24, 19, 9, 5, 43, 98, 178, 215, 221, 188, 152, 155, 123, 115, 103, 109, 147, 146, 136, 106, 81, 53, 22, 26, 27, 35, 51, 37, 23, 19, 20, 21, 25, 20, 11, 5, 28, 103, 161, 197, 207, 190, 179, 169, 139, 133, 119, 105, 139, 124, 132, 115, 88, 61, 22, 36, 43, 38, 55, 36, 25, 24, 24, 23, 25, 19, 13, 6, 16, 87, 112, 158, 188, 182, 168, 166, 153, 129, 123, 132, 127, 159, 155, 119, 106, 71, 27, 35, 41, 47, 59, 39, 28, 26, 27, 24, 25, 19, 14, 8, 6, 75, 128, 161, 171, 174, 153, 167, 169, 133, 93, 154, 125, 114, 96, 103, 83, 74, 31, 32, 40, 50, 72, 42, 31, 27, 28, 26, 24, 18, 16, 13, 3, 54, 131, 164, 163, 185, 191, 182, 175, 168, 128, 149, 131, 64, 125, 134, 82, 49, 35, 33, 46, 55, 72, 38, 28, 26, 28, 26, 23, 18, 17, 16, 9, 29, 128, 167, 180, 195, 175, 146, 207, 182, 157, 129, 107, 140, 128, 156, 108, 87, 33, 33, 44, 56, 49, 32, 27, 26, 30, 26, 24, 18, 18, 19, 19, 22, 107, 174, 168, 168, 203, 147, 202, 223, 166, 127, 75, 84, 133, 145, 113, 80, 33, 39, 53, 43, 28, 30, 33, 31, 35, 26, 21, 19, 23, 28, 25, 19, 80, 146, 134, 210, 161, 199, 151, 225, 175, 128, 90, 137, 173, 102, 81, 56, 38, 55, 61, 33, 26, 36, 39, 35, 35, 26, 23, 25, 26, 33, 38, 21, 32, 141, 207, 194, 184, 134, 150, 215, 202, 129, 68, 144, 124, 104, 98, 66, 56, 70, 54, 38, 38, 36, 36, 37, 38, 26, 26, 26, 25, 31, 40, 39, 27, 93, 207, 211, 161, 179, 201, 159, 210, 139, 48, 99, 125, 115, 86, 75, 68, 55, 39, 40, 35, 35, 38, 39, 42, 27, 27, 30, 27, 30, 35, 42, 43, 65, 137, 202, 194, 166, 175, 136, 195, 157, 58, 98, 110, 112, 90, 80, 54, 20, 23, 33, 40, 39, 42, 41, 43, 26, 27, 36, 29, 29, 34, 37, 43, 38, 100, 198, 222, 215, 208, 183, 181, 173, 87, 110, 130, 125, 108, 100, 48, 25, 29, 34, 41, 44, 45, 44, 45, 26, 27, 36, 31, 33, 35, 31, 34, 38, 118, 234, 231, 241, 212, 227, 180, 119, 149, 138, 141, 146, 142, 131, 60, 48, 49, 42, 42, 45, 47, 46, 45, 30, 36, 34, 41, 43, 44, 43, 55, 61, 103, 242, 250, 249, 230, 239, 223, 139, 196, 156, 163, 170, 176, 152, 47, 41, 55, 59, 57, 52, 45, 45, 46, 35, 45, 34, 38, 52, 57, 61, 54, 63, 104, 220, 254, 241, 240, 240, 216, 169, 177, 173, 213, 208, 195, 168, 67, 44, 57, 52, 45, 48, 45, 45, 48, 47, 52, 38, 40, 45, 53, 62, 74, 98, 104, 137, 209, 199, 181, 220, 215, 180, 109, 122, 241, 236, 214, 163, 60, 58, 48, 61, 54, 49, 44, 46, 50, 58, 52, 41, 37, 52, 62, 69, 98, 96, 81, 71, 110, 122, 104, 121, 120, 93, 50, 67, 219, 249, 215, 127, 66, 59, 54, 41, 58, 55, 41, 45, 53, 67, 61, 54, 32, 67, 87, 81, 92, 79, 70, 61, 102, 90, 82, 74, 71, 70, 57, 40, 110, 187, 132, 88, 81, 68, 56, 48, 58, 64, 44, 45, 52, 73, 72, 51, 36, 80, 87, 85, 88, 63, 70, 75, 87, 81, 75, 75, 74, 78, 67, 50, 54, 69, 50, 73, 79, 75, 57, 62, 55, 65, 55, 45, 52, 77, 72, 40, 51, 78, 74, 91, 85, 54, 78, 91, 72, 83, 73, 76, 73, 76, 74, 58, 56, 67, 49, 66, 74, 61, 57, 68, 63, 54, 61, 53, 51, 72, 70, 56, 65, 68, 76, 88, 76, 56, 81, 96, 68, 80, 73, 72, 75, 77, 66, 63, 61, 65, 53, 65, 69, 59, 59, 61, 70, 53, 64, 51, 55, 70, 68, 64, 67, 66, 70, 79, 68, 66, 81, 86, 69, 78, 73, 73, 73, 77, 65, 62, 68, 66, 58, 67, 62, 64, 59, 61, 62, 55, 63, 47, 52, 77, 68, 64, 69, 63, 68, 69, 72, 73, 84, 76, 72, 78, 77, 74, 72, 77, 67, 67, 64, 70, 59, 64, 65, 66, 65, 60, 65, 53, 61, 49, 51],
        256
    );
    expect(result.iscc).toBe('ISCC:EED4GQZQTY6J5DTHQ2DWCPDZHQOM6QZQTY6J5DTFZ2DWCPDZHQOMXDI');
}); 

test('gen_audio_code_v0_test_0000_empty_64', async () => {
    const result = await gen_audio_code(
        [],
        64
    );
    expect(result.iscc).toBe('ISCC:EIAQAAAAAAAAAAAA');
}); 

test('gen_audio_code_v0_test_0001_one_128', async () => {
    const result = await gen_audio_code(
        [1],
        128
    );
    expect(result.iscc).toBe('ISCC:EIBQAAAAAEAAAAABAAAAAAAAAAAAA');
}); 

test('gen_audio_code_v0_test_0002_two_256', async () => {
    const result = await gen_audio_code(
        [1, 2],
        256
    );
    expect(result.iscc).toBe('ISCC:EIDQAAAAAMAAAAABAAAAAAQAAAAAAAAAAAAAAAAAAEAAAAACAAAAAAA');
}); 

test('gen_audio_code_v0_test_0003_test_neg_256', async () => {
    const result = await gen_audio_code(
        [-1, 0, 1],
        256
    );
    expect(result.iscc).toBe('ISCC:EIDQAAAAAH777777AAAAAAAAAAAACAAAAAAP777774AAAAAAAAAAAAI');
}); 

test('gen_audio_code_v0_test_0003_test_neg_256', async () => {
    const result = await gen_audio_code(
        [684003877, 683946551, 1749295639, 2017796679, 2026256086, 2022066918, 2022001639, 2021968035, 2038741139, 2059709571, 503750851, 369541315, 320225426, 289292450, 830368930, 838789539, 1940835201, 1928186752, 1651297920, 1651283600, 1650959072, 1655022116, 1722069540, 1726259749, 1713694254, 1847914286, 1847912494, 1780832302, -362410962, -352973810, 1809196111, 1770397775, 1753686797, 683942429, 943989277, 943989255, 944121430, 952503910, 948374246, 948717799, 1485621411, 462203011, 508470403, 370053251, 303988867, 322879651, 322892963, 862907811, 1928256417, 1928317841, 1651297152, 1647091344, 1650827936, 1659216416, 1722069540, 1726263844, 1717887533, 1713696302, 1847912494, 1847883822, -366540754, -345633778, -336184242, 1771447375, 1753620815, 1757684255, 675553815, 943989255, 944120390, 952508006, 948308582, 948718050, 411879650, 428648578, 516861059, 370057347, 303988865, 306086033, 306086051, 841919649, 846133665, 1919929264, 1647168400, 1647101584, 1650827936, 1659216484, 1671733796, 1738838588, 1717887517, 1713696302, 1847913774, 1847912494, 1780960302, -362410978, -336196594, 1775641678, 1770397775, 1753555743, 683942429, 943989271, 944185926, 2026255094, 2022051494, 2021919654],
        256
    );
    expect(result.iscc).toBe('ISCC:EIDWUJFCEZZOJYVDHJHIRB3KQSQCM2REUITDUTVAQNRGJIRENCCCULY');
}); 

test('gen_video_code_v0_test_0000_one_zero_frame_64', async () => {
    const result = await gen_video_code(
        [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
        64
    );
    expect(result.iscc).toBe('ISCC:EMAQAAAAAAAAAAAA');
}); 

test('gen_video_code_v0_test_0001_multiple_frames_128', async () => {
    const result = await gen_video_code(
        [[0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1, 0, 1, 0, 2, 1], [1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2, 1, 2, 1, 0, 2]],
        128
    );
    expect(result.iscc).toBe('ISCC:EMBZEMGSDFIB4AHUEZSLJPJANMAAY');
}); 

test('gen_video_code_v0_test_0003_range_256', async () => {
    const result = await gen_video_code(
        [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379]],
        256
    );
    expect(result.iscc).toBe('ISCC:EMDVFD4RIMPXYSWSNEZPYBZ2FDFMSPZBUMDRUFJPYKJFXWXNDUMQAYI');
});

test('gen_mixed_code_v0_test_0000_std_64', async () => {
    const result = await gen_mixed_code(
        ["EUA6GIKXN42IQV3S", "EIAUKMOUIOYZCKA5", "EQA6JK5IEKO6E732", "EIAU2XRWOT4AKMTZ"],
        64
    );
    expect(result.iscc).toBe('ISCC:EQASNZJ36ZT33AL7');
    expect(result.parts.toString()).toBe(["EUA6GIKXN42IQV3S", "EIAUKMOUIOYZCKA5", "EQA6JK5IEKO6E732", "EIAU2XRWOT4AKMTZ"].toString());
});

test('gen_mixed_code_v0_test_0001_128_truncated', async () => {
    const result = await gen_mixed_code(
        ["EQCR2VTB6AUI2J6A5AOYMRA2BNPNTBQS2GGNFQ2DUU", "EAC7ULQD5WEKFMNQUZWWYK5NHTATG4OV62AMIUWLYI", "EACQRBYECQSWFDC5JYDLCCJNF72Q4IYOXV3POUHRNI", "EEC453X23MWGUEZQC3SG7UJMY65HQYFQDJMO4CAL5A"],
        128
    );
    expect(result.iscc).toBe('ISCC:EQBSBXXOMP6SZ2VX6DXG332JFUX76');
    expect(result.parts.toString()).toBe(["EQCR2VTB6AUI2J6A5AOYMRA2BNPNTBQS2GGNFQ2DUU", "EAC7ULQD5WEKFMNQUZWWYK5NHTATG4OV62AMIUWLYI", "EACQRBYECQSWFDC5JYDLCCJNF72Q4IYOXV3POUHRNI", "EEC453X23MWGUEZQC3SG7UJMY65HQYFQDJMO4CAL5A"].toString());
});

test('gen_data_code_v0_test_0000_two_bytes_64', async () => {
    const result = await gen_data_code(
        Buffer.from([0xff,0x00]),
         64
    );
    expect(result.iscc).toBe('ISCC:GAAXL2XYM5BQIAZ3');
 });

 test('gen_data_code_v0_test_0001_empty_64', async () => {
    const result = await gen_data_code(
        Buffer.from([]),
         64
    );
    expect(result.iscc).toBe('ISCC:GAASL4F2WZY7KBXB');
 });


 test('gen_data_code_v0_test_0002_zero_128', async () => {
    const result = await gen_data_code(
        Buffer.from([0x00]),
        128
    );
    expect(result.iscc).toBe('ISCC:GABXOD4P2IS6YHS2XOK6IBVPVXPPG');
 });

 test('gen_data_code_v0_test_0003_static_256', async () => {
    // Create sequential numbers from 1 to 2048 in little-endian format
    const data = Buffer.alloc(2048 * 4); // 4 bytes per number
    for (let i = 0; i < 2048; i++) {
        // Write each number as a 32-bit little-endian integer
        data.writeUInt32LE(i + 1, i * 4);
    }
    
    // Create input object matching the Python test format
    const input = {
        stream: data,
        bits: 256
    };
    
    const result = await gen_data_code(input.stream, input.bits);
    
    expect(result).toEqual({
        iscc: "ISCC:GAD2FL7K437RJZK2MMLL4C2672JVQTMGJYYZ3KAINZRWETNWFES3KYA"
    });
});


test('gen_instance_code_v0_test_0000_empty_64', async () => {
    const result = await gen_instance_code(
        Buffer.from([]),
        64
    );
    expect(result.iscc).toBe('ISCC:IAA26E2JXH27TING');
    expect(result.datahash).toBe('1e20af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262');
    expect(result.filesize).toBe(0);
 });

 test('gen_instance_code_v0_test_0001_zero_128', async () => {
    const result = await gen_instance_code(
        Buffer.from([0x00]),
        128
    );
    expect(result.iscc).toBe('ISCC:IABS2OW637YRWYPRJSEG4NNPUA3HG');
    expect(result.datahash).toBe('1e202d3adedff11b61f14c886e35afa036736dcd87a74d27b5c1510225d0f592e213');
    expect(result.filesize).toBe(1);
 });

 test('gen_instance_code_v0_test_0002_static_256', async () => {
        // Create sequential numbers from 1 to 2048 in little-endian format
        const data = Buffer.alloc(2048 * 4); // 4 bytes per number
        for (let i = 0; i < 2048; i++) {
            // Write each number as a 32-bit little-endian integer
            data.writeUInt32LE(i + 1, i * 4);
        }
        
        // Create input object matching the Python test format
        const input = {
            stream: data,
            bits: 256
        };
        
    const result = await gen_instance_code(
        input.stream, input.bits
    );
    expect(result.iscc).toBe('ISCC:IAD66JNRTSKU5FLU2L7POWZNQTYKDOYQRGQJLJ24E5DWM7MPWYAPH7Q');
    expect(result.datahash).toBe('1e20ef25b19c954e9574d2fef75b2d84f0a1bb1089a095a75c2747667d8fb600f3fe');
    expect(result.filesize).toBe(8192);
 });


 test('gen_iscc_code_v0_test_0000_standard', async () => {
    const result =  gen_iscc_code(
        ["AAAYPXW445FTYNJ3", "EAARMJLTQCUWAND2", "GABVVC5DMJJGYKZ4ZBYVNYABFFYXG", "IADWIK7A7JTUAQ2D6QARX7OBEIK3OOUAM42LOBLCZ4ZOGDLRHMDL6TQ"]
    );
    expect(result.iscc).toBe('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY');
 });


 test('gen_iscc_code_v0_test_0001_no_meta', async () => {
    const result = gen_iscc_code(
        ["EAARMJLTQCUWAND2", "GABVVC5DMJJGYKZ4ZBYVNYABFFYXG", "IADWIK7A7JTUAQ2D6QARX7OBEIK3OOUAM42LOBLCZ4ZOGDLRHMDL6TQ"]
    );
    expect(result.iscc).toBe('ISCC:KAARMJLTQCUWAND2LKF2GYSSNQVTYZBL4D5GOQCDIM');
 });


 test('gen_iscc_code_v0_test_0002_no_meta_content_256', async () => {
    const result =  gen_iscc_code(
        ["GABVVC5DMJJGYKZ4ZBYVNYABFFYXG", "IADWIK7A7JTUAQ2D6QARX7OBEIK3OOUAM42LOBLCZ4ZOGDLRHMDL6TQ"]
    );
    expect(result.iscc).toBe('ISCC:KUAFVC5DMJJGYKZ4MQV6B6THIBBUG');
 });

 test('gen_iscc_code_v0_test_0003_no_meta_content_128', async () => {
    const result =  gen_iscc_code(
        ["GAAQQICFKJYKY4KU", "IADWIK7A7JTUAQ2D6QARX7OBEIK3OOUAM42LOBLCZ4ZOGDLRHMDL6TQ"]
    );
    expect(result.iscc).toBe('ISCC:KUAAQICFKJYKY4KUMQV6B6THIBBUG');
 });

 test('gen_iscc_code_v0_test_0004_ordering', async () => {
    const result =  gen_iscc_code(
        ["EAARMJLTQCUWAND2", "AAAYPXW445FTYNJ3", "IADWIK7A7JTUAQ2D6QARX7OBEIK3OOUAM42LOBLCZ4ZOGDLRHMDL6TQ", "GABVVC5DMJJGYKZ4ZBYVNYABFFYXG"]
    );
    expect(result.iscc).toBe('ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY');
 });