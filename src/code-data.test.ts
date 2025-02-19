import seedrandom from 'seedrandom';
import {
    soft_hash_data_v0,
    gen_data_code_v0,
    gen_data_code
} from './code-data';
import { DataHasherV0 } from './code-data';

export function staticBytes(
    n: number = 1024 * 1024,
    blockSize: number = 4
): Buffer {
    // Create a buffer to store the result
    const result = Buffer.alloc(n);
    let offset = 0;
    let i = 1;

    while (n > 0) {
        // Create a buffer for the counter
        const counterBuffer = Buffer.alloc(blockSize);
        counterBuffer.writeUInt32LE(i, 0);

        // Calculate how many bytes to take
        const take = Math.min(blockSize, n);

        // Copy the bytes to the result buffer
        counterBuffer.copy(result, offset, 0, take);

        offset += take;
        n -= take;
        i += 1;
    }

    return result;
}

describe('code-data', () => {
    test('softHashDataV0 handles static bytes', async () => {
        const data = staticBytes(); // Assuming staticBytes() is imported or defined
        const digest = await soft_hash_data_v0(data);
        expect(digest.toString('hex')).toBe(
            'e5b3daf1118cf09cb5c5ac323a9f68ca04465f9e3942297ebd1e6360f5bb98df'
        );
    });

    test('softHashDataV0 handles empty input', async () => {
        const digest = await soft_hash_data_v0(Buffer.from(''));
        expect(digest.toString('hex')).toBe(
            '25f0bab671f506e1c532f892d9d7917a252e7a520832f5963a8cd4e9a7e312b5'
        );
    });

    test('softHashDataV0 handles zero byte input', async () => {
        const digest = await soft_hash_data_v0(Buffer.from([0x00]));
        expect(digest.toString('hex')).toBe(
            '770f8fd225ec1e5abb95e406afaddef303defe2f0d03b74c388f7b42ef96c7af'
        );
    });

    test('genDataCodeV0 handles default static bytes', async () => {
        const data = staticBytes();
        const dcObj = await gen_data_code_v0(data);
        expect(dcObj).toEqual({ iscc: 'ISCC:GAA6LM626EIYZ4E4' });
    });

    test('genDataCode handles default static bytes', async () => {
        const data = staticBytes();
        const dcObj = await gen_data_code(data);
        expect(dcObj).toEqual({ iscc: 'ISCC:GAA6LM626EIYZ4E4' });
    });

    test('DataHasherV0 handles single shot', async () => {
        const data = staticBytes();
        const hasher = new DataHasherV0();
        await hasher.push(data);
        const digest = hasher.digest();
        expect(digest.toString('hex')).toBe(
            'e5b3daf1118cf09cb5c5ac323a9f68ca04465f9e3942297ebd1e6360f5bb98df'
        );
    });

    test('DataHasherV0 handles stream push', async () => {
        const data = staticBytes();
        const hasher = new DataHasherV0();
        let offset = 0;
        const chunkSize = 2048;

        while (offset < data.length) {
            const chunk = data.subarray(offset, offset + chunkSize);
            await hasher.push(chunk);
            offset += chunkSize;
        }

        const digest = await hasher.digest();
        expect(digest.toString('hex')).toBe(
            'e5b3daf1118cf09cb5c5ac323a9f68ca04465f9e3942297ebd1e6360f5bb98df'
        );
    });

    test('DataHasherV0 handles mixed mode', async () => {
        const data = staticBytes();
        const firstChunk = data.subarray(0, 2048);
        const hasher = new DataHasherV0();
        await hasher.push(firstChunk);
        let offset = 2048;
        const chunkSize = 2048;

        while (offset < data.length) {
            const chunk = data.subarray(offset, offset + chunkSize);
            await hasher.push(chunk);
            offset += chunkSize;
        }

        const digest = await hasher.digest();
        expect(digest.toString('hex')).toBe(
            'e5b3daf1118cf09cb5c5ac323a9f68ca04465f9e3942297ebd1e6360f5bb98df'
        );
    });

    test('handles 1MiB data robustly', async () => {
        const data = staticBytes();
        let ba = Buffer.from(data);

        // Set random seed
        const seededRandom = seedrandom('1');
        const rbyte = () => Math.floor(seededRandom() * 256);
        const rpos = () => Math.floor(seededRandom() * (1024 * 1024));

        // Initial hash
        const h1 = (await soft_hash_data_v0(ba)).toString('hex');
        expect(h1).toBe(
            'e5b3daf1118cf09cb5c5ac323a9f68ca04465f9e3942297ebd1e6360f5bb98df'
        );

        // 7 random single byte changes
        for (let step = 0; step < 7; step++) {
            const oldLen = ba.length;
            const pos = rpos();
            const newByte = rbyte();

            // Create new buffer with inserted byte
            const newBa = Buffer.alloc(ba.length + 1);
            ba.copy(newBa, 0, 0, pos);
            newBa.writeUInt8(newByte, pos);
            ba.copy(newBa, pos + 1, pos);
            // Verify hash remains the same
            const newHash = (await soft_hash_data_v0(newBa)).toString('hex');
            expect(newHash).toBe(h1);
            // Update ba for next iteration
            ba = Buffer.from(newBa);
        }

        // 8th byte change should produce different hash
        const finalPos = rpos();
        const finalBa = Buffer.alloc(ba.length + 1);
        ba.copy(finalBa, 0, 0, finalPos);
        finalBa.writeUInt8(rbyte(), finalPos);
        ba.copy(finalBa, finalPos + 1, finalPos);

        const h2 = (await soft_hash_data_v0(finalBa)).toString('hex');
        expect(h2).not.toBe(h1);
    });

    test('DataHasher matches softHashDataV0', async () => {
        const data = staticBytes();
        const hasher = new DataHasherV0();
        await hasher.push(data);
        const hasherDigest = await hasher.digest();
        const softHashDigest = await soft_hash_data_v0(data);
        expect(hasherDigest).toEqual(softHashDigest);
    });

    test('genDataCodeV0 conforms to schema', async () => {
        const isccObj = await gen_data_code_v0(Buffer.from([0xff]));
        expect(isccObj).toEqual({ iscc: 'ISCC:GAAV5ZIQC4WCUBIK' });
    });
});
