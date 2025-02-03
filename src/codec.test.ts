import { decode_base32, decode_base32hex, decode_base64, decode_header, decode_length, decode_varnibble, encode_base32, encode_base32hex, encode_base64, encode_header, encode_varnibble, iscc_clean, iscc_decode, iscc_explain, iscc_type_id, iscc_validate, toHexString, encode_base58, decode_base58 } from "./codec";
import { MainTypes } from "./constants";
import { gen_meta_code } from "./metacode";




test('test_main_type', () => {
    expect(typeof MainTypes.META).toBe('number');
    expect(MainTypes.META).toBe(0);
});


test('test_write_header', () => {
    const bytes = (...values: number[]) => new Uint8Array(values);
    expect(encode_header(0, 0, 0, 0)).toEqual(toHexString(bytes(0b00000000, 0b00000000)));
    expect(encode_header(1, 0, 0, 0)).toEqual(toHexString(bytes(0b00010000, 0b00000000)));
    expect(encode_header(7, 1, 1, 1)).toEqual(toHexString(bytes(0b01110001, 0b00010001)));
    expect(encode_header(8, 1, 1, 1)).toEqual(toHexString(bytes(0b10000000, 0b00010001, 0b00010000)));
    expect(encode_header(8, 8, 1, 1)).toEqual(toHexString(bytes(0b10000000, 0b10000000, 0b00010001)));
});


test('test_read_header', () => {
    // Helper function to create hex string from byte array
    const bytesToHex = (bytes: number[]): string => {
        return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Test cases
    expect(decode_header(bytesToHex([0b00000000, 0b00000000])))
        .toEqual([0, 0, 0, 0, new Uint8Array()]);

    expect(decode_header(bytesToHex([0b00000000, 0b00000000, 0b00000000])))
        .toEqual([0, 0, 0, 0, new Uint8Array([0x00])]);

    expect(decode_header(bytesToHex([0b00010000, 0b00000000])))
        .toEqual([1, 0, 0, 0, new Uint8Array()]);

    expect(decode_header(bytesToHex([0b01110001, 0b00010001])))
        .toEqual([7, 1, 1, 1, new Uint8Array()]);

    expect(decode_header(bytesToHex([0b10000000, 0b00010001, 0b00010000])))
        .toEqual([8, 1, 1, 1, new Uint8Array()]);

    expect(decode_header(bytesToHex([0b10000000, 0b10000000, 0b00010001])))
        .toEqual([8, 8, 1, 1, new Uint8Array()]);
});


test('test_write_varnibble', () => {
    // Test negative value
    expect(() => encode_varnibble(-1)).toThrow();

    // Test valid values
    expect(encode_varnibble(0)).toBe("0000");
    expect(encode_varnibble(7)).toBe("0111");
    expect(encode_varnibble(8)).toBe("10000000");
    expect(encode_varnibble(9)).toBe("10000001");
    expect(encode_varnibble(71)).toBe("10111111");
    expect(encode_varnibble(72)).toBe("110000000000");
    expect(encode_varnibble(73)).toBe("110000000001");
    expect(encode_varnibble(583)).toBe("110111111111");
    expect(encode_varnibble(584)).toBe("1110000000000000");
    expect(encode_varnibble(4679)).toBe("1110111111111111");

    // Test value out of range
    expect(() => encode_varnibble(4680)).toThrow();
    // Test invalid type
    expect(() => encode_varnibble(1.5)).toThrow();
    
});

test('test_read_varnibble', () => {
    // Test invalid inputs
    expect(() => decode_varnibble("0")).toThrow();
    expect(() => decode_varnibble("1")).toThrow();
    expect(() => decode_varnibble("011")).toThrow();
    expect(() => decode_varnibble("100")).toThrow();

    // Test valid inputs
    expect(decode_varnibble("0000")).toEqual([0, ""]);
    expect(decode_varnibble("000000")).toEqual([0, "00"]);
    expect(decode_varnibble("0111")).toEqual([7, ""]);
    expect(decode_varnibble("01110")).toEqual([7, "0"]);
    expect(decode_varnibble("01111")).toEqual([7, "1"]);
    expect(decode_varnibble("10000000")).toEqual([8, ""]);
    expect(decode_varnibble("10000001")).toEqual([9, ""]);
    expect(decode_varnibble("10000001110")).toEqual([9, "110"]);
    expect(decode_varnibble("10111111")).toEqual([71, ""]);
    expect(decode_varnibble("101111110")).toEqual([71, "0"]);
    expect(decode_varnibble("110000000000")).toEqual([72, ""]);
    expect(decode_varnibble("11000000000010")).toEqual([72, "10"]);
    expect(decode_varnibble("110000000001")).toEqual([73, ""]);
    expect(decode_varnibble("110000000001010")).toEqual([73, "010"]);
    expect(decode_varnibble("110111111111")).toEqual([583, ""]);
    expect(decode_varnibble("1101111111111010")).toEqual([583, "1010"]);
    expect(decode_varnibble("1110000000000000")).toEqual([584, ""]);
    expect(decode_varnibble("111000000000000001010")).toEqual([584, "01010"]);
    expect(decode_varnibble("1110111111111111")).toEqual([4679, ""]);
    expect(decode_varnibble("1110111111111111101010")).toEqual([4679, "101010"]);
});


test('test_encode_base32', () => {
    expect(encode_base32('')).toBe('');
    expect(encode_base32('66')).toBe('MY');        // 'f' in hex
    expect(encode_base32('666f')).toBe('MZXQ');    // 'fo' in hex
    expect(encode_base32('666f6f')).toBe('MZXW6'); // 'foo' in hex
    expect(encode_base32('666f6f62')).toBe('MZXW6YQ');    // 'foob' in hex
    expect(encode_base32('666f6f6261')).toBe('MZXW6YTB'); // 'fooba' in hex
    expect(encode_base32('666f6f626172')).toBe('MZXW6YTBOI'); // 'foobar' in hex
});

test('test_decode_base32', () => {
    expect(decode_base32('')).toEqual(new Uint8Array([]));
    expect(decode_base32('MY')).toEqual(new Uint8Array([0x66]));  // 'f'
    expect(decode_base32('My')).toEqual(new Uint8Array([0x66]));  // 'f'
    expect(decode_base32('my')).toEqual(new Uint8Array([0x66]));  // 'f'
    expect(decode_base32('MZXQ')).toEqual(new Uint8Array([0x66, 0x6f]));  // 'fo'
    expect(decode_base32('MZXW6')).toEqual(new Uint8Array([0x66, 0x6f, 0x6f]));  // 'foo'
    expect(decode_base32('MZXW6YQ')).toEqual(new Uint8Array([0x66, 0x6f, 0x6f, 0x62]));  // 'foob'
    expect(decode_base32('MZXW6YTB')).toEqual(new Uint8Array([0x66, 0x6f, 0x6f, 0x62, 0x61]));  // 'fooba'
    expect(decode_base32('MZXW6YTBOI')).toEqual(new Uint8Array([0x66, 0x6f, 0x6f, 0x62, 0x61, 0x72]));  // 'foobar'
});

test('test_decode_base32_casefold', () => {
    expect(decode_base32('MZXW6YTBOI')).toEqual(decode_base32('mZxW6ytBOI'));
});


test('test_decode_base64', () => {
    // Generate random 8 bytes as hex string
    const data = Array.from({ length: 8 }, () => 
        Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, '0')
    ).join('');
    
    const encoded = encode_base64(data);
    const decoded = decode_base64(encoded);
    
    // Compare the decoded result with original data
    expect(Buffer.from(decoded).toString('hex')).toBe(data);
});


test('test_encode_base32hex', () => {
        // Test empty string
        expect(encode_base32hex('')).toBe('');
    
        // Test "hello world"
        const helloWorldHex = Buffer.from('hello world').toString('hex');
        expect(encode_base32hex(helloWorldHex)).toBe('D1IMOR3F41RMUSJCCG');
        
        // Test roundtrip
        const encoded = encode_base32hex(helloWorldHex);
        const decoded = decode_base32hex(encoded);
        expect(Buffer.from(decoded).toString('hex')).toBe(helloWorldHex);
    });


test('test_base32hex_roundtrip_lower', () => {
    const data = "cc01cd9d2b7d247a8333f7b0b7d2cda8056c3d15eef738c1962e9148624feac1c14f";
    const expected_b32hex = "PG0SR79BFKI7L0PJUUOBFKMDL02MOF8LTRRJHGCM5Q8KGOIFTB0S2JO";
    
    // Test encoding
    expect(encode_base32hex(data)).toBe(expected_b32hex);
    
    // Test decoding with lowercase
    const decoded = decode_base32hex(expected_b32hex.toLowerCase());
    expect(Buffer.from(decoded).toString('hex')).toBe(data);
});

test('test_decode_base32hex', () => {
    const decoded = decode_base32hex("D1IMOR3F41RMUSJCCG");
    expect(Buffer.from(decoded).toString()).toBe("hello world");
});


test('test_codec_clean', () => {
    expect(iscc_clean('somecode')).toBe('somecode');
    expect(iscc_clean('ISCC: SOME-CODE')).toBe('SOMECODE');
    expect(iscc_clean(' SOMECODE ')).toBe('SOMECODE');
    expect(iscc_clean('ISCC:')).toBe('');
});

test('test_codec_clean_raises_bad_scheme', () => {
    expect(() => {
        iscc_clean('http://whatever');
    }).toThrow('Invalid scheme: http');
});

test('test_codec_clean_raises_multiple_colon', () => {
    expect(() => {
        iscc_clean('ISCC:something:something');
    }).toThrow('Malformed ISCC string: ISCC:something:something');
});

test('test_codec_decode_length_mt_iscc', () => {
    expect(decode_length(MainTypes.ISCC, 3)).toBe(256);
});

test('test_codec_decode_length_invalid_type_raises', () => {
    // ts-expect-error Testing invalid input
    expect(() => {
    
        decode_length(8, 3);
    }).toThrow('Invalid length 3 for MainType 8');
});


test('codec_validate_regex', async () => {
    const valid = (await gen_meta_code("Hello World", "32")).iscc;
    expect(iscc_validate(valid)).toBe(true);
    const invalid = valid.slice(0, -1);
    expect(iscc_validate(invalid, { strict: false })).toBe(false);
    expect(() => {
        iscc_validate(invalid, { strict: true });
    }).toThrow();
});

test('codec_validate_header_prefix', async () => {
    const valid = (await gen_meta_code("Hello World", "32")).iscc;
    const invalid = "ISCC:AE" + valid.slice(7);
    expect(iscc_validate(invalid, { strict: false })).toBe(false);
    expect(() => {
        iscc_validate(invalid, { strict: true });
    }).toThrow();
});

test('codec_validate_iscc_id', () => {
    expect(iscc_validate("ISCC:MMAMRVPW22XVU4FR", { strict: false })).toBe(true);
});

test('codec_validate_wrong_version', () => {
    expect(iscc_validate("ISCC:CE22222222", { strict: false })).toBe(false);
    expect(() => {
        iscc_validate("ISCC:CE22222222", { strict: true });
    }).toThrow();
});

test('test_decode_iscc', () => {
    const [mt, st, ver, len, data] = iscc_decode("AAAQCAAAAABAAAAA");
    expect(mt).toBe(0);
    expect(st).toBe(0);
    expect(ver).toBe(0);
    expect(len).toBe(1);
    expect(data).toEqual(new Uint8Array([1, 0, 0, 0, 2, 0, 0, 0]));
});

test('test_type_id_maintype_meta', () => {
    expect(iscc_type_id("AAAQCAAAAABAAAAA")).toBe("META-NONE-V0-64");
});


test('test_type_id_maintype_iscc_code', () => {
    const iscc = "KICQOCPJM46YUUCBMWS6FFXRGM3LJOU5MZOVPOUHIJOHPI324GKN67Q";
    expect(iscc_type_id(iscc)).toBe("ISCC-AUDIO-V0-MCDI");
});

test('test_type_id_maintype_iscc_id', () => {
    const iscc = "MEAAO5JRN22FN2M2";
    expect(iscc_type_id(iscc)).toBe("ID-BITCOIN-V0-64");
});

test('test_explain_maintype_meta', () => {
    expect(iscc_explain("AAAQCAAAAABAAAAA")).toBe("META-NONE-V0-64-0100000002000000");
});


test('test_explain_maintype_iscc_code', () => {
    const iscc = "KICQOCPJM46YUUCBMWS6FFXRGM3LJOU5MZOVPOUHIJOHPI324GKN67Q";
    expect(iscc_explain(iscc))
        .toBe("ISCC-AUDIO-V0-MCDI-0709e9673d8a504165a5e296f13336b4ba9d665d57ba87425c77a37ae194df7e");
});

test('test_explain_maintype_iscc_id_no_counter', () => {
    const iscc = "MEAAO5JRN22FN2M2";
    expect(iscc_explain(iscc)).toBe("ID-BITCOIN-V0-64-0775316eb456e99a");
});

test('test_explain_maintype_iscc_id_counter', () => {
    const iscc = "ISCC:MAASAJINXFXA2SQXAE";
    expect(iscc_explain(iscc)).toBe("ID-PRIVATE-V0-72-20250db96e0d4a17-1");
});

test('test_base58_roundtrip', () => {
    // Test roundtrip encoding/decoding with random data
    const testData = new Uint8Array(32);
    crypto.getRandomValues(testData);
    
    const encoded = encode_base58(testData);
    const decoded = decode_base58(encoded);
    
    expect(decoded).toEqual(testData);
});

