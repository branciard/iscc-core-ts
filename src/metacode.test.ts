import { gen_meta_code } from './metacode';

test('test_gen_meta_code_name_only', async () => {
    const result = await gen_meta_code('Hello  World');
    expect(result.name).toBe('Hello World');
    expect(result.description).toBe('');
    //default version is 0
    expect(result.version).toBe(0);
});

test('test_gen_meta_code_name_cannot_be_empty', async () => {
    const promise = gen_meta_code('');
    await expect(promise).rejects.toThrow(Error);
    await expect(promise).rejects.toThrow(
        'Meta-Code requires non-empty name element (after normalization)'
    );
});

test('test_gen_meta_code_name_and_extra', async () => {
    const result = await gen_meta_code('Hello  World', " C'est Extra");
    expect(result.name).toBe('Hello World');
    expect(result.description).toBe("C'est Extra");
    expect(result.version).toBe(0);
});

test('test_gen_meta_code_name_and_extra_version0', async () => {
    const result = await gen_meta_code(
        '   Hello  World  ',
        " C'est Extra   ",
        undefined,
        64,
        0
    );
    expect(result.name).toBe('Hello World');
    expect(result.description).toBe("C'est Extra");
    expect(result.version).toBe(0);
});

test('test_gen_meta_code_name_and_extra_version1', async () => {
    const promise = gen_meta_code(
        'Hello  World',
        " C'est Extra",
        undefined,
        64,
        1
    );
    await expect(promise).rejects.toThrow(Error);
    await expect(promise).rejects.toThrow('Only ISCC version 0 is supported');
});

test('test_gen_meta_code_name_only', async () => {
    const result = await gen_meta_code('Hello World');
    expect(result.name).toBe('Hello World');
    expect(result.description).toBe('');
    //default version is 0
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e2041f8394111eb713a22165c46c90ab8f0fd9399c92028fd6d288944b23ff5bf76'
    );
    expect(result.iscc).toBe('ISCC:AAAWN77F727NXSUS');
});

test('test_gen_meta_code_name_and_desc', async () => {
    const textEncoder = new TextEncoder();
    const input = textEncoder.encode('# Some' + '\n\n\n' + ' description');
    const expectedOutput = textEncoder.encode(
        '# Some' + '\n\n' + ' description'
    );
    const result = await gen_meta_code(
        'Hello  World',
        new TextDecoder().decode(input)
    );
    expect(result.name).toBe('Hello World');
    expect(textEncoder.encode(result.description)).toEqual(expectedOutput);
    expect(result.version).toBe(0);
    expect(result.metahash).toBe(
        '1e20bd06bd79a3df82b163e346e5a477062aed41c2a9cf1e5812cf8947e2e3555a38'
    );
    expect(result.iscc).toBe('ISCC:AAAWN77F72MBZZK3');
});

test('test_gen_meta_code_meta_dict', async () => {
    const json = '{"hello": "metadata"}';
    const result = await gen_meta_code('hello', undefined, json);
    expect(result.name).toBe('hello');
    expect(result.description).toBe('');
    expect(result.version).toBe(0);
    expect(result.meta).toBe(
        'data:application/json;base64,eyJoZWxsbyI6Im1ldGFkYXRhIn0='
    );
    expect(result.metahash).toBe(
        '1e200c6f9a94eb08835a957ffc9a7c80cf3fb54d1c6a8f13a41a6573a57ba146b0d2'
    );
    expect(result.iscc).toBe('ISCC:AAAWKLHFXMFCA2OC');
});
