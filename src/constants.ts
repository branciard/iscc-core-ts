export const METACODE_BITS: number = 64;
export const TEXT_BITS: number = 64;
export const IMAGE_BITS: number = 64;
export const MIXED_BITS: number = 64;
export const META_TRIM_NAME: number = 128;
export const META_NGRAM_SIZE_TEXT: number = 3;
export const META_NGRAM_SIZE_BYTES: number = 4;
export const CODE_CONTENT_TEXT_BITS: number = 64;
export const TEXT_NGRAM_SIZE = 13;



/**
 * 
 *     """
    ## MT - MainTypes

    | Uint | Symbol   | Bits | Purpose                                                 |
    |----- |:---------|------|---------------------------------------------------------|
    | 0    | META     | 0000 | Match on metadata similarity                            |
    | 1    | SEMANTIC | 0001 | Match on semantic content similarity                    |
    | 2    | CONTENT  | 0010 | Match on perceptual content similarity                  |
    | 3    | DATA     | 0011 | Match on data similarity                                |
    | 4    | INSTANCE | 0100 | Match on data identity                                  |
    | 5    | ISCC     | 0101 | Composite of two or more ISCC-UNITs with common header  |
    """

 */
export enum MainTypes {
    META = 0,
    SEMANTIC = 1,
    CONTENT = 2,
    DATA = 3,
    INSTANCE = 4,
    ISCC = 5,
    ID = 6,
    FLAKE = 7,
    TESTMainType8 = 8
}


/**
 * ## ST - SubTypes
 * 
 * | Uint | Symbol   | Bits | Purpose                                                 |
 * |----- |:---------|------|---------------------------------------------------------|
 * | 0    | NONE     | 0000 | For MainTypes that do not specify SubTypes    (META, DATA, and INSTANCE )           |
 */
export enum ST {
    /** For MainTypes that do not specify SubTypes */
    NONE = 0
  }

/**
 * ### ST_CC
 * 
 * SubTypes for `MT.CONTENT`
 * 
 * | Uint | Symbol   | Bits | Purpose                                                 |
 * |----- |:---------|------|---------------------------------------------------------|
 * | 0    | TEXT     | 0000 | Match on syntactic text similarity                      |
 * | 1    | IMAGE    | 0001 | Match on perceptual image similarity                    |
 * | 2    | AUDIO    | 0010 | Match on audio chroma similarity                        |
 * | 3    | VIDEO    | 0011 | Match on perceptual similarity                          |
 * | 4    | MIXED    | 0100 | Match on similarity of content codes                    |
 */

export enum ST_CC {
    TEXT = 0,
    IMAGE = 1,
    AUDIO = 2,
    VIDEO = 3,
    MIXED = 4,
    TESTSubTypes8 = 8
  }
    
  /**
   * ### ST_ISCC
   * 
   * SubTypes for `MT.ISCC`
   * 
   * | Uint | Symbol   | Bits | Purpose                                                 |
   * |----- |:---------|------|---------------------------------------------------------|
   * | 0    | TEXT     | 0000 | Composite ISCC including Text-Code                      |
   * | 1    | IMAGE    | 0001 | Composite ISCC including Image-Code                     |
   * | 2    | AUDIO    | 0010 | Composite ISCC including Audio-Code                     |
   * | 3    | VIDEO    | 0011 | Composite ISCC including Video-Code                     |
   * | 4    | MIXED    | 0100 | Composite ISCC including Mixed-Code                     |
   * | 5    | SUM      | 0101 | Composite ISCC including only Data- and Instance-Code   |
   * | 6    | NONE     | 0110 | Composite ISCC including Meta, Data and Instance-Code   |
   */
  export enum ST_ISCC {
    /** Composite ISCC including Text-Code */
    TEXT = 0,
    
    /** Composite ISCC including Image-Code */
    IMAGE = 1,
    
    /** Composite ISCC including Audio-Code */
    AUDIO = 2,
    
    /** Composite ISCC including Video-Code */
    VIDEO = 3,
    
    /** Composite ISCC including Mixed-Code */
    MIXED = 4,
    
    /** Composite ISCC including only Data- and Instance-Code */
    SUM = 5,
    
    /** Composite ISCC including Meta, Data and Instance-Code */
    NONE = 6
  }
  
/**
 * SubTypes for `MT.ID`
 * 
 * | Uint | Symbol   | Bits | Purpose                                                 |
 * |----- |:---------|------|---------------------------------------------------------|
 * | 0    | PRIVATE  | 0000 | ISCC-ID minted via private repository (not unique)      |
 * | 1    | BITCOIN  | 0001 | ISCC-ID minted via Bitcoin blockchain                   |
 * | 2    | ETHEREUM | 0010 | ISCC-ID minted via Ethereum blockchain                  |
 * | 3    | POLYGON  | 0011 | ISCC-ID minted via Polygon blockchain                   |
 */
export enum ST_ID {
    /** ISCC-ID minted via private repository (not unique) */
    PRIVATE = 0,
    
    /** ISCC-ID minted via Bitcoin blockchain */
    BITCOIN = 1,
    
    /** ISCC-ID minted via Ethereum blockchain */
    ETHEREUM = 2,
    
    /** ISCC-ID minted via Polygon blockchain */
    POLYGON = 3,
  }




/*
        ## VS - Version
    
        Code Version
    
        | Uint | Symbol   | Bits | Purpose                                                 |
        |----- |:---------|------|---------------------------------------------------------|
        | 0    | V0       | 0000 | Initial Version of Code without breaking changes        |
    
        """
    
        V0 = 0
    
    */




export enum Version {
    V0 = 0,
    V1 = 1
}

/**
 * Supported Multibase encodings.
 * - base16 -> f
 * - base32 -> b
 * - base32hex -> v
 * - base58btc -> z
 * - base64url -> u
 */
export enum MULTIBASE {
    base16 = 'f',
    base32 = 'b',
    base32hex = 'v',
    base58btc = 'z',
    base64url = 'u'
}

  

export interface IMetaCodeResult {
    iscc: string;
    metahash: string;
    name: string;
    description?: string;
    meta?: string;
    version: number;
}




/**
 * ## LN - Length
 * 
 * Valid lengths for hash-digests.
 */
export enum Length {
    L32 = 32,
    L64 = 64,
    L72 = 72,
    L80 = 80,
    L96 = 96,
    L128 = 128,
    L160 = 160,
    L192 = 192,
    L224 = 224,
    L256 = 256,
    L320 = 320
}

// Define UNITS as readonly tuples
export const UNITS: ReadonlyArray<ReadonlyArray<MainTypes>> = [
    [],
    [MainTypes.CONTENT],
    [MainTypes.SEMANTIC],
    [MainTypes.CONTENT, MainTypes.SEMANTIC],
    [MainTypes.META],
    [MainTypes.META, MainTypes.CONTENT],
    [MainTypes.META, MainTypes.SEMANTIC],
    [MainTypes.META, MainTypes.SEMANTIC, MainTypes.CONTENT],
] as const;


/**
 * Random gear vector for CDC calculations
 * @description Used for content-defined chunking operations
 */
export const CDC_GEAR = Object.freeze([
    1553318008, 574654857, 759734804, 310648967,
    1393527547, 1195718329, 694400241, 1154184075,
    1319583805, 1298164590, 122602963, 989043992,
    1918895050, 933636724, 1369634190, 1963341198,
    1565176104, 1296753019, 1105746212, 1191982839,
    1195494369, 29065008, 1635524067, 722221599,
    1355059059, 564669751, 1620421856, 1100048288,
    1018120624, 1087284781, 1723604070, 1415454125,
    737834957, 1854265892, 1605418437, 1697446953,
    973791659, 674750707, 1669838606, 320299026,
    1130545851, 1725494449, 939321396, 748475270,
    554975894, 1651665064, 1695413559, 671470969,
    992078781, 1935142196, 1062778243, 1901125066,
    1935811166, 1644847216, 744420649, 2068980838,
    1988851904, 1263854878, 1979320293, 111370182,
    817303588, 478553825, 694867320, 685227566,
    345022554, 2095989693, 1770739427, 165413158,
    1322704750, 46251975, 710520147, 700507188,
    2104251000, 1350123687, 1593227923, 1756802846,
    1179873910, 1629210470, 358373501, 807118919,
    751426983, 172199468, 174707988, 1951167187,
    1328704411, 2129871494, 1242495143, 1793093310,
    1721521010, 306195915, 1609230749, 1992815783,
    1790818204, 234528824, 551692332, 1930351755,
    110996527, 378457918, 638641695, 743517326,
    368806918, 1583529078, 1767199029, 182158924,
    1114175764, 882553770, 552467890, 1366456705,
    934589400, 1574008098, 1798094820, 1548210079,
    821697741, 601807702, 332526858, 1693310695,
    136360183, 1189114632, 506273277, 397438002,
    620771032, 676183860, 1747529440, 909035644,
    142389739, 1991534368, 272707803, 1905681287,
    1210958911, 596176677, 1380009185, 1153270606,
    1150188963, 1067903737, 1020928348, 978324723,
    962376754, 1368724127, 1133797255, 1367747748,
    1458212849, 537933020, 1295159285, 2104731913,
    1647629177, 1691336604, 922114202, 170715530,
    1608833393, 62657989, 1140989235, 381784875,
    928003604, 449509021, 1057208185, 1239816707,
    525522922, 476962140, 102897870, 132620570,
    419788154, 2095057491, 1240747817, 1271689397,
    973007445, 1380110056, 1021668229, 12064370,
    1186917580, 1017163094, 597085928, 2018803520,
    1795688603, 1722115921, 2015264326, 506263638,
    1002517905, 1229603330, 1376031959, 763839898,
    1970623926, 1109937345, 524780807, 1976131071,
    905940439, 1313298413, 772929676, 1578848328,
    1108240025, 577439381, 1293318580, 1512203375,
    371003697, 308046041, 320070446, 1252546340,
    568098497, 1341794814, 1922466690, 480833267,
    1060838440, 969079660, 1836468543, 2049091118,
    2023431210, 383830867, 2112679659, 231203270,
    1551220541, 1377927987, 275637462, 2110145570,
    1700335604, 738389040, 1688841319, 1506456297,
    1243730675, 258043479, 599084776, 41093802,
    792486733, 1897397356, 28077829, 1520357900,
    361516586, 1119263216, 209458355, 45979201,
    363681532, 477245280, 2107748241, 601938891,
    244572459, 1689418013, 1141711990, 1485744349,
    1181066840, 1950794776, 410494836, 1445347454,
    2137242950, 852679640, 1014566730, 1999335993,
    1871390758, 1736439305, 231222289, 603972436,
    783045542, 370384393, 184356284, 709706295,
    1453549767, 591603172, 768512391, 854125182,
  ] as const);

  /**
 * CDC gear vector as Uint32Array for better performance
 */
export const CDC_GEAR_UINT32 = new Uint32Array(CDC_GEAR);
  
// Type for the CDC_GEAR array
export type CDCGear = typeof CDC_GEAR;


export const IO_READ_SIZE: number = 2097152;

export type IsccTuple = [MainTypes, ST|ST_CC, Version, number, Uint8Array];

/**
 * Regular expression for validating canonical ISCC codes.
 * Matches strings that:
 * - Start with "ISCC:"
 * - Followed by 10-68 characters of uppercase A-Z or digits 2-7
 * - End immediately after
 */
export const CANONICAL_REGEX = /^ISCC:[A-Z2-7]{10,68}$/;

/**
 * Valid ISCC code prefixes
 * Each prefix is a two-character string that identifies the type of ISCC code
 */
export const PREFIXES = [
    'AA', 'CA', 'CE', 'CI', 'CM', 'CQ',
    'EA', 'EE', 'EI', 'EM', 'EQ', 'GA',
    'IA', 'KA', 'KE', 'KI', 'KM', 'KQ',
    'KU', 'KY', 'MA', 'ME', 'MI', 'MM',
    'OA',
  ] as const;
  
  /**
   * Type for valid ISCC prefixes
   */
  export type IsccPrefix = typeof PREFIXES[number];

  /**
 * Multicodec prefix code for ISCC
 * Represents the bytes 0xCC 0x01
 */
export const MC_PREFIX = new Uint8Array([0xCC, 0x01]);

// Alternative Buffer version if you're using Node.js
export const MC_PREFIX_BUFFER = Buffer.from([0xCC, 0x01]);

export const SUBTYPE_MAP: Record<MainTypes, typeof ST | typeof ST_ISCC | typeof ST_ID | typeof ST_CC> = {
    [MainTypes.META]: ST,
    [MainTypes.SEMANTIC]: ST_CC,
    [MainTypes.CONTENT]: ST_CC,
    [MainTypes.DATA]: ST,
    [MainTypes.INSTANCE]: ST,
    [MainTypes.ISCC]: ST_ISCC,
    [MainTypes.ID]: ST_ID,
    [MainTypes.FLAKE]: ST,
    [MainTypes.TESTMainType8]: ST_CC
};