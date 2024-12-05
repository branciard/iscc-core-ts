import { iscc_explain } from "./codec";
import { gen_iscc_code, gen_iscc_code_v0 } from "./iscc-code";
const MID_64 = "AAAYPXW445FTYNJ3";
const CID_64 = "EAARMJLTQCUWAND2";
const DID_128 = "GABVVC5DMJJGYKZ4ZBYVNYABFFYXG";
const IID_256 = "IADWIK7A7JTUAQ2D6QARX7OBEIK3OOUAM42LOBLCZ4ZOGDLRHMDL6TQ";

const DID_64 = "GAAQQICFKJYKY4KU";

test('gen_iscc_code_full', () => {
    const icode = gen_iscc_code([MID_64, CID_64, DID_128, IID_256]);
    expect(icode).toEqual({
        iscc: "ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY"
    });
    expect(iscc_explain(icode.iscc)).toBe(
        "ISCC-TEXT-V0-MCDI-87dedce74b3c353b16257380a960347a5a8ba362526c2b3c642be0fa67404343"
    );
});

test('gen_iscc_code_v0_full', () => {
    const icode = gen_iscc_code_v0([MID_64, CID_64, DID_128, IID_256]);
    expect(icode).toEqual({
        iscc: "ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY"
    });
    expect(iscc_explain(icode.iscc))
        .toBe("ISCC-TEXT-V0-MCDI-87dedce74b3c353b16257380a960347a5a8ba362526c2b3c642be0fa67404343");
});

test('gen_iscc_code_v0_no_meta', () => {
    const icode = gen_iscc_code_v0([CID_64, DID_128, IID_256]);
    expect(icode).toEqual({
        iscc: "ISCC:KAARMJLTQCUWAND2LKF2GYSSNQVTYZBL4D5GOQCDIM"
    });
    expect(iscc_explain(icode.iscc))
        .toBe("ISCC-TEXT-V0-CDI-16257380a960347a5a8ba362526c2b3c642be0fa67404343");
});

test('gen_iscc_code_v0_no_meta_content', () => {
    const icode = gen_iscc_code_v0([DID_128, IID_256]);
    expect(icode).toEqual({
        iscc: "ISCC:KUAFVC5DMJJGYKZ4MQV6B6THIBBUG"
    });
    // we may also get a ISCC-SUM-V0-256 version
    expect(iscc_explain(icode.iscc))
        .toBe("ISCC-SUM-V0-DI-5a8ba362526c2b3c642be0fa67404343");
});

test('gen_iscc_code_v0_no_meta_content_128', () => {
    const icode = gen_iscc_code_v0([DID_64, IID_256]);
    expect(icode).toEqual({
        iscc: "ISCC:KUAAQICFKJYKY4KUMQV6B6THIBBUG"
    });
    expect(iscc_explain(icode.iscc))
        .toBe("ISCC-SUM-V0-DI-0820455270ac7154642be0fa67404343");
});

test('gen_iscc_code_v0_ordering', () => {
    const icode = gen_iscc_code_v0([CID_64, MID_64, IID_256, DID_128]);
    expect(icode).toEqual({
        iscc: "ISCC:KACYPXW445FTYNJ3CYSXHAFJMA2HUWULUNRFE3BLHRSCXYH2M5AEGQY"
    });
    expect(iscc_explain(icode.iscc))
        .toBe("ISCC-TEXT-V0-MCDI-87dedce74b3c353b16257380a960347a5a8ba362526c2b3c642be0fa67404343");
});

test('gen_iscc_code_v0_insufficient_codes_raises', () => {
    expect(() => {
        gen_iscc_code_v0([CID_64]);
    }).toThrow('Minimum two');
});

test('gen_iscc_code_v0_32_bit_codes_raise', () => {
    expect(() => {
        gen_iscc_code_v0(["AAAGKLHFXM", "EAAP5Q74YU"]);
    }).toThrow('Cannot build');
});

test('gen_iscc_code_v0_data_or_instance_missing_raises', () => {
    expect(() => {
        gen_iscc_code_v0([MID_64, CID_64, DID_128]);
    }).toThrow('ISCC-CODE requires');
});


