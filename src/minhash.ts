export const MPA = [
    853146490016488653n,
    1849332765672628665n,
    1131688930666554379n,
    1936485333668353377n,
    890837126813020267n,
    1988249303247129861n,
    1408894512544874755n,
    2140251716176616185n,
    1755124413189049421n,
    1355916793659431597n,
    546586563822844083n,
    497603761441203021n,
    2000709902557454173n,
    1057597903350092207n,
    1576204252850880253n,
    2078784234495706739n,
    1022616668454863635n,
    2150082342606334489n,
    712341150087765807n,
    1511757510246096559n,
    1525853819909660573n,
    1263771796138990131n,
    1215963627200985263n,
    590069150281426443n,
    130824646248385081n,
    962725325544728503n,
    1702561325943522847n,
    296074222435072629n,
    490211158716051523n,
    1255327197241792767n,
    699458998727907367n,
    32930168991409845n,
    1985097843455124585n,
    362027841570125531n,
    1903252144040897835n,
    900391845076405289n,
    547470123601853551n,
    1689373724032359119n,
    845594231933442371n,
    400331968021206285n,
    174967108345233429n,
    876513700861085019n,
    505848386844809885n,
    1920468508342256199n,
    1292611725303815789n,
    963317239501343903n,
    1730880032297268007n,
    284614929850059717n,
    1185026248283273081n,
    2167288823816985197n,
    1214905315086686483n,
    1555253098157439857n,
    1048013650291539723n,
    1238618594841147605n,
    1213502582686547311n,
    286300733803129311n,
    1250358511639043529n,
    407534797452854371n,
    960869149538623787n,
    1722699901467253087n,
    1325704236119824319n,
    196979859428570839n,
    1669408735473259699n,
    781336617016068757n
];

export const MPB = [
    1089606993368836715n,
    726972438868274737n,
    66204585613901025n,
    1078410179646709132n,
    1343470117098523467n,
    698653121981343911n,
    1248486536592473639n,
    1447963007834012793n,
    1034598851883537815n,
    1474008409379745934n,
    793773480906057541n,
    980501101461882479n,
    963941556313537655n,
    233651787311327325n,
    243905121737149907n,
    570269452476776142n,
    297633284648631084n,
    1516796967247398557n,
    1494795672066692649n,
    1728741177365151059n,
    1029197538967983408n,
    1660732464170610344n,
    1399769594446678069n,
    506465470557005705n,
    1279720146829545181n,
    860096419955634036n,
    411519685280832908n,
    69539191273403207n,
    1960489729088056217n,
    605092075716397684n,
    1017496016211653149n,
    1304834535101321372n,
    949013511180032347n,
    1142776242221098779n,
    576980004709031232n,
    1071272177143100544n,
    1494527341093835499n,
    1073290814142727850n,
    1285904200674942617n,
    1277176606329477335n,
    343788427301735585n,
    2100915269685487331n,
    1227711252031557450n,
    18593166391963377n,
    2101884148332688233n,
    191808277534686888n,
    2170124912729392024n,
    918430470748151293n,
    1831024560113812361n,
    1951365515851067694n,
    744352348473654499n,
    1921518311887826722n,
    2020165648600700886n,
    1764930142256726985n,
    1903893374912839788n,
    1449378957774802122n,
    1435825328374066345n,
    833197549717762813n,
    2238991044337210799n,
    748955638857938366n,
    1834583747494146901n,
    222012292803592982n,
    901238460725547841n,
    1501611130776083278n
];

export const MAXI64 = (1n << 64n) - 1n;
export const MPRIME = (1n << 61n) - 1n;
export const MAXH = (1n << 32n) - 1n;

/**
 * Calculates a 64-dimensional minhash integer vector.
 *
 * This function implements the MinHash algorithm, which is used for quickly estimating
 * how similar two sets are. It's particularly useful in large-scale data mining tasks.
 *
 * @param {bigint[]} features - An array of bigint features to be hashed.
 * @returns {bigint[]} A 64-dimensional minhash vector.
 * @throws {Error} If the features array is empty.
 *
 * @description
 * The function works as follows:
 * 1. It checks if the input array is empty and throws an error if so.
 * 2. It initializes a result array of length 64 (same as MPA and MPB).
 * 3. For each pair of values (a, b) from MPA and MPB:
 *    - It computes a hash for each feature using the formula ((a * feature + b) & MAXI64) % MPRIME) & MAXH
 *    - It keeps the minimum hash value among all features
 * 4. The minimum hash values form the resulting minhash vector.
 *
 * Constants used:
 * - MPA, MPB: Arrays of 64 predefined values for hashing
 * - MAXI64: Maximum 64-bit integer ((1n << 64n) - 1n)
 * - MPRIME: Prime number close to 2^61 ((1n << 61n) - 1n)
 * - MAXH: Maximum 32-bit integer ((1n << 32n) - 1n)
 */
export function algMinhash(features: bigint[]): bigint[] {
    if (features.length === 0) {
        throw new Error('features is empty array');
    }

    const result = new Array(MPA.length);
    const len = features.length;
    const mpaLen = MPA.length;

    for (let i = 0; i < mpaLen; i++) {
        const a = MPA[i];
        const b = MPB[i];
        let min = MAXH;

        for (let j = 0; j < len; j++) {
            const hash = ((a * features[j] + b) & MAXI64) % MPRIME & MAXH;
            min = hash < min ? hash : min;
        }

        result[i] = min;
    }

    return result;
}

export function algMinhash64(features: bigint[]): Uint8Array {
    /**
     * Create 64-bit minimum hash digest.
     *
     * @param features - List of integer features
     * @returns 64-bit binary from the least significant bits of the minhash values
     */
    return algMinhashCompress(algMinhash(features), 1);
}

export function algMinhash256(features: bigint[]): Uint8Array {
    /**
     * Create 256-bit minimum hash digest.
     *
     * @param features - List of integer features
     * @returns 256-bit binary from the least significant bits of the minhash values
     */
    return algMinhashCompress(algMinhash(features), 4);
}

export function algMinhashCompress(
    mhash: bigint[],
    lsb: number = 4
): Uint8Array {
    const totalBits = lsb * mhash.length;
    const result = new Uint8Array(Math.ceil(totalBits / 8));
    let bitIdx = 0;
    for (let bitpos = 0; bitpos < lsb; bitpos++) {
        for (const h of mhash) {
            if ((h >> BigInt(bitpos)) & 1n) {
                result[bitIdx >> 3] |= (1 << (7 - (bitIdx & 7)));
            }
            bitIdx++;
        }
    }
    return result;
}
