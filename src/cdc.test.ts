import { algCdcParams, algCdcChunks } from './cdc';
import { blake3 } from 'hash-wasm';

export function staticBytes(n: number = 1024 * 1024, blockSize: number = 4): Buffer {
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

describe('CDC Tests', () => {
  
    test('get_params returns correct values', () => {
      const params1024 = algCdcParams(1024);
      expect([
        params1024.minSize,
        params1024.maxSize,
        params1024.centerSize,
        params1024.maskS,
        params1024.maskL
      ]).toEqual([256, 8192, 640, 2047, 511]);
      const params8192 = algCdcParams(8192  );
      expect([
        params8192.minSize,
        params8192.maxSize,
        params8192.centerSize,
        params8192.maskS,
        params8192.maskL
      ]).toEqual([2048, 65536, 5120, 16383, 4095]);
    });

 
    test('test_data_chunks_empty', async () => {
        const chunks: Buffer[] = [];
        for await (const chunk of algCdcChunks(Buffer.from(''), false)) {
            chunks.push(chunk);
        }
        expect(chunks).toEqual([Buffer.from('')]);
    });

    test('handles 1 byte input', async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(Buffer.from([0x00]), false)) {
          chunks.push(chunk);
      }
      expect(chunks).toEqual([Buffer.from([0x00])]);
  });

  test('handles below min size', async () => {
      const data = staticBytes(256 - 1);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }
      expect(chunks).toEqual([data]);
  });

  test('handles min size', async () => {
      const data = staticBytes(256);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }
      expect(chunks).toEqual([data]);
  });

  test('handles above min size', async () => {
      const data = staticBytes(256 + 1);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }
      expect(chunks).toEqual([data]);
  });

  test('handles average size', async () => {
      const data = staticBytes(1024);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }
      expect(chunks).toEqual([data]);
  });

  test('handles above average size', async () => {
      const data = staticBytes(1024 + 1);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }
      expect(chunks).toEqual([data]);
  });

  test('splits into two chunks correctly', async () => {
      const data = staticBytes(1024 + 309);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }

      expect(chunks).toEqual([data.subarray(0, -1), data.subarray(-1)]);
  });
  

  test('handles max odd case', async () => {
      const expected = [
          "bc0dcea65a2cc750bd1d9b46eb67b6ea54d1fd43088343ceafda3788ac515a31",
          "b6739322973cc1ec27dd70781823187b90159e9739da22d451b3f89b56dd591b",
          "00ff5f6d4895630c9bd76ab4138b3e156707a79589018055305746532bf59f8e",
          "9f261eb3c27561c11aac31475e3ca8d88cafceeb51bae7feb1e8e43794af9760",
          "67f7e7d1d8720581f1b7545a50c320f4814b1d6f7bccba0c911e0ea01788c8fb",
          "1fa982a3d9acfcaedab6e65030ccb2c651b2c2b0f918e9588b22832000c48261",
          "5fae55e1aee84705fc3dc6e831d4f7981677e03338343bd6a783c45e333a55fe",
      ];
      const data = staticBytes(8192);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }
      const hashes = await Promise.all(chunks.map(chunk => blake3(chunk)));
      expect(hashes.length).toBe(7);
      expect(hashes).toEqual(expected);
  });

  test('handles max even case', async () => {
      const expected = [
          "bc0dcea65a2cc750bd1d9b46eb67b6ea54d1fd43088343ceafda3788ac515a31",
          "b6739322973cc1ec27dd70781823187b90159e9739da22d451b3f89b56dd591b",
          "00ff5f6d4895630c9bd76ab4138b3e156707a79589018055305746532bf59f8e",
          "9f261eb3c27561c11aac31475e3ca8d88cafceeb51bae7feb1e8e43794af9760",
          "67f7e7d1d8720581f1b7545a50c320f4814b1d6f7bccba0c911e0ea01788c8fb",
          "1fa982a3d9acfcaedab6e65030ccb2c651b2c2b0f918e9588b22832000c48261",
          "25fd35033e2964b02bb5c593b14ff613db663494e709cda3cd388f4f53ec7aca",
          "2032f28cfcdad86090b60fa5cfd8cc44b972df47d5f7e3637001d8e03b8fbc07",
      ];
      const data = staticBytes(8192 + 1000);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, false)) {
          chunks.push(chunk);
      }
      const hashes = await Promise.all(chunks.map(chunk => blake3(chunk)));
      expect(hashes.length).toBe(8);
      expect(hashes).toEqual(expected);
  });

  test('handles utf32 case', async () => {
      const expected = [
          "bc0dcea65a2cc750bd1d9b46eb67b6ea54d1fd43088343ceafda3788ac515a31",
          "62066f8394ff7bb7afdd7081ffa0c39a0341f8bd4985ad318bf28ab238a2327f",
          "d6e1586e7c3265a237335f76ad3f20d4323c66dd8ec269aaf5bbafcb7179430b",
          "a1ff4a40219292bd44e5bd71c89f3d411bb984853ecf1f32bcc34da07438374e",
          "dab6f7b0b12d135fb459d88bf44a97f8ab46f3105f634937a5a1d9034ab572c8",
          "a3e94d7f29498a6572d7e95a496470444283c8f84cd3ce9e9935477c82cc91ef",
          "66ad20c3d28f25f526b5e1684f0d008e8e35b55bc4e35fc1643e4aab80948761",
          "b0c9b6ea63f1667d903a7fb8ff18c2b3233fbb378f327102c605d19cd26f37dd",
          "f249cbe070bba6b689251074ddb75aa3ddfc02caa357f2f8f714cfeb39523d96",
      ];
      const data = staticBytes(8192 + 1000);
      const chunks: Buffer[] = [];
      for await (const chunk of algCdcChunks(data, true)) {
          chunks.push(chunk);
      }
      const hashes = await Promise.all(chunks.map(chunk => blake3(chunk)));
      expect(hashes.length).toBe(9);
      expect(hashes).toEqual(expected);
  });
  

/*

def test_data_chunks_1byte():
    assert list(iscc_core.cdc.alg_cdc_chunks(b"\x00", False)) == [b"\x00"]


def test_data_chunks_below_min():
    data = static_bytes(256 - 1)
    assert list(iscc_core.cdc.alg_cdc_chunks(data, False)) == [data]


def test_data_chunks_min():
    data = static_bytes(256)
    assert list(iscc_core.cdc.alg_cdc_chunks(data, False)) == [data]


def test_data_chunks_above_min():
    data = static_bytes(256 + 1)
    assert list(iscc_core.cdc.alg_cdc_chunks(data, False)) == [data]


def test_data_chunks_avg():
    data = static_bytes(1024)
    assert list(iscc_core.cdc.alg_cdc_chunks(data, False)) == [data]


def test_data_chunks_avg_above():
    data = static_bytes(1024 + 1)
    assert list(iscc_core.cdc.alg_cdc_chunks(data, False)) == [data]


def test_data_chunks_two_chunks():
    data = static_bytes(1024 + 309)
    assert list(iscc_core.cdc.alg_cdc_chunks(data, False)) == [data[:-1], data[-1:]]


def test_data_chunks_max_odd():
    expected = [
        "bc0dcea65a2cc750bd1d9b46eb67b6ea54d1fd43088343ceafda3788ac515a31",
        "b6739322973cc1ec27dd70781823187b90159e9739da22d451b3f89b56dd591b",
        "00ff5f6d4895630c9bd76ab4138b3e156707a79589018055305746532bf59f8e",
        "9f261eb3c27561c11aac31475e3ca8d88cafceeb51bae7feb1e8e43794af9760",
        "67f7e7d1d8720581f1b7545a50c320f4814b1d6f7bccba0c911e0ea01788c8fb",
        "1fa982a3d9acfcaedab6e65030ccb2c651b2c2b0f918e9588b22832000c48261",
        "5fae55e1aee84705fc3dc6e831d4f7981677e03338343bd6a783c45e333a55fe",
    ]
    data = static_bytes(8192)
    hashes = [blake3(c).hexdigest() for c in iscc_core.cdc.alg_cdc_chunks(data, False)]
    assert len(hashes) == 7
    assert hashes == expected


def test_data_chunks_max_even():
    expected = [
        "bc0dcea65a2cc750bd1d9b46eb67b6ea54d1fd43088343ceafda3788ac515a31",
        "b6739322973cc1ec27dd70781823187b90159e9739da22d451b3f89b56dd591b",
        "00ff5f6d4895630c9bd76ab4138b3e156707a79589018055305746532bf59f8e",
        "9f261eb3c27561c11aac31475e3ca8d88cafceeb51bae7feb1e8e43794af9760",
        "67f7e7d1d8720581f1b7545a50c320f4814b1d6f7bccba0c911e0ea01788c8fb",
        "1fa982a3d9acfcaedab6e65030ccb2c651b2c2b0f918e9588b22832000c48261",
        "25fd35033e2964b02bb5c593b14ff613db663494e709cda3cd388f4f53ec7aca",
        "2032f28cfcdad86090b60fa5cfd8cc44b972df47d5f7e3637001d8e03b8fbc07",
    ]
    data = static_bytes(8192 + 1000)
    hashes = [blake3(c).hexdigest() for c in iscc_core.cdc.alg_cdc_chunks(data, False)]
    assert len(hashes) == 8
    assert hashes == expected


def test_data_chunks_utf32():
    expected = [
        "bc0dcea65a2cc750bd1d9b46eb67b6ea54d1fd43088343ceafda3788ac515a31",
        "62066f8394ff7bb7afdd7081ffa0c39a0341f8bd4985ad318bf28ab238a2327f",
        "d6e1586e7c3265a237335f76ad3f20d4323c66dd8ec269aaf5bbafcb7179430b",
        "a1ff4a40219292bd44e5bd71c89f3d411bb984853ecf1f32bcc34da07438374e",
        "dab6f7b0b12d135fb459d88bf44a97f8ab46f3105f634937a5a1d9034ab572c8",
        "a3e94d7f29498a6572d7e95a496470444283c8f84cd3ce9e9935477c82cc91ef",
        "66ad20c3d28f25f526b5e1684f0d008e8e35b55bc4e35fc1643e4aab80948761",
        "b0c9b6ea63f1667d903a7fb8ff18c2b3233fbb378f327102c605d19cd26f37dd",
        "f249cbe070bba6b689251074ddb75aa3ddfc02caa357f2f8f714cfeb39523d96",
    ]
    data = static_bytes(8192 + 1000)
    hashes = [blake3(c).hexdigest() for c in iscc_core.cdc.alg_cdc_chunks(data, True)]
    assert len(hashes) == 9
    assert hashes == expected


*/

});