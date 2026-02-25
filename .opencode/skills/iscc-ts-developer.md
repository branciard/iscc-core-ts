---
name: iscc-ts-developer
description: TypeScript development guide for the iscc-core-ts library — the TypeScript port of iscc-core (Python). Use when implementing, testing, debugging, or extending the ISCC-CORE TypeScript library. Triggers on ISCC TypeScript questions, porting from Python, conformance testing, codec implementation, or similarity hashing in TypeScript.
---

# ISCC TypeScript Developer

Guide for TypeScript development of the `iscc-core-ts` library — the TypeScript port of the Python `iscc-core` reference implementation (ISO 24138:2024).

## Project Context

- **Grant**: NLnet NGI Zero — https://nlnet.nl/project/ISCC-CORE-ts/
- **Python reference**: `/home/fbranciard/dev/iscc-core/` (v1.2.2)
- **TypeScript port**: `/home/fbranciard/dev/iscc-core-ts/` (v0.3.0)
- **ISCC skills reference**: `/home/fbranciard/dev/iscc-skills/`
- **Repository**: https://github.com/branciard/iscc-core-ts

## Architecture & Module Mapping

### Python → TypeScript Module Map

| Python Module | TypeScript File | Status |
|---|---|---|
| `code_meta.py` | `src/metacode.ts` | ✅ Ported |
| `code_content_text.py` | `src/code-content-text.ts` | ✅ Ported |
| `code_content_image.py` | `src/code-content-image.ts` | ✅ Ported (includes `algDct`) |
| `code_content_audio.py` | `src/code-content-audio.ts` | ✅ Ported |
| `code_content_video.py` | `src/code-content-video.ts` | ✅ Ported (includes `WTA_VIDEO_ID_PERMUTATIONS`) |
| `code_content_mixed.py` | `src/code-content-mixed.ts` | ✅ Ported |
| `code_data.py` | `src/code-data.ts` | ✅ Ported |
| `code_instance.py` | `src/code-instance.ts` | ✅ Ported |
| `iscc_code.py` | `src/iscc-code.ts` | ✅ Ported |
| `codec.py` | `src/codec.ts` | ✅ Ported |
| `constants.py` | `src/constants.ts` | ✅ Ported |
| `models.py` | `src/model.ts` | ✅ Ported (Code class only, no Flake class) |
| `simhash.py` | `src/simhash.ts` | ✅ Ported |
| `minhash.py` | `src/minhash.ts` | ✅ Ported |
| `cdc.py` | `src/cdc.ts` | ✅ Ported |
| `dct.py` | Embedded in `code-content-image.ts` | ✅ Ported |
| `wtahash.py` | Embedded in `code-content-video.ts` | ✅ Ported |
| `utils.py` | `src/utils.ts` | ⚠️ Partial (missing similarity/distance functions) |
| `code_flake.py` | — | ❌ Not ported |
| `iscc_id.py` | — | ❌ Not ported |
| `conformance.py` | — | ❌ Not ported |
| `options.py` | Constants in `constants.ts` | ⚠️ Simplified |
| `check.py` | — | ❌ Not needed (Python-specific Cython check) |

### Missing Functions to Port

**From `utils.py`** (add to `src/utils.ts`):
- `iscc_similarity(a, b)` — Hamming similarity between ISCC codes
- `iscc_distance(a, b)` — Hamming distance between ISCC codes
- `iscc_compare(a, b)` — Full comparison report
- `iscc_distance_bytes(a, b)` — Distance from raw bytes
- `iscc_nph_similarity(a, b)` — Normalized Prefix Hamming Similarity (v1.2.1)
- `iscc_nph_distance(a, b)` — Normalized Prefix Hamming Distance (v1.2.1)
- `json_canonical(obj)` — JSON Canonical Serialization
- `multi_hash_blake3(data)` — Multi-hash with BLAKE3
- `cidv1_hex(stream)` — CIDv1 hex encoding
- `cidv1_to_token_id(cidv1)` — CIDv1 to token ID
- `cidv1_from_token_id(token_id)` — Token ID to CIDv1

**New modules to create:**
- `src/code-flake.ts` — `gen_flake_code`, `gen_flake_code_v0`, `uid_flake_v0`
- `src/iscc-id.ts` — `gen_iscc_id`, `gen_iscc_id_v0`, `gen_iscc_id_v1`, `iscc_id_incr`
- `src/conformance.ts` — `conformance_testdata`, `conformance_selftest`

### Recent Python Changes to Sync (v1.2.0 → v1.2.2)

- **WIDE subtype** in ISCC-CODE for 128-bit Data/Instance codes
- **ISCC-IDv1** timestamp/HUB-based generation
- **NPHS/NPHD** utility functions for byte string similarity
- **Text cleaning improvements** (whitespace/newline handling)
- **Unit order fix** (SEMANTIC/CONTENT order in constants)
- **encode_units validation** improvements
- **Flake class** in models

## Build & Test Commands

```bash
npm ci                    # Install dependencies
npm run build             # Compile TypeScript (ESM + CJS)
npm run typecheck         # Type checking only
npm run test              # Run Jest tests (CJS)
npm run test-esm          # Run Jest tests (ESM)
npm run fulltest          # Run all test variants (CJS + ESM + isolated)
npm run lint              # ESLint check
npm run prettier-format   # Format code
npm run make:docs/reference  # Generate TypeDoc docs
```

## Conformance Test Data

Python `data.json` at `iscc_core/data.json` contains the **golden conformance test data**:

```json
{
  "function_name": {
    "test_name": {
      "inputs": [...],
      "outputs": {...}
    }
  }
}
```

**Convention for binary data in test inputs:**
- `"stream:ff00"` — Hex-encoded byte stream (wrap as `BytesIO`/`ReadableStream`)
- `"bytes:ff00"` — Hex-encoded raw bytes

This file can be copied to the TS project and used to auto-generate Jest conformance tests.

## Dependencies

| TypeScript Package | Purpose | Python Equivalent |
|---|---|---|
| `hash-wasm` | SHA-256, BLAKE3 hashing | `blake3`, `hashlib` |
| `js-xxhash` | XXH32 fast hashing | `xxhash` |
| `rfc4648` | Base32/Base32hex encoding | Python stdlib |
| `bs58` | Base58 encoding | `base58` |
| `seedrandom` | Deterministic RNG | N/A |
| `xregexp` | Unicode regex | Python stdlib `re` |

## Code Style Conventions

- **File naming**: kebab-case (`code-content-text.ts`, not `code_content_text.ts`)
- **Function naming**: snake_case for public API (matching Python), camelCase for internal
- **Exports**: All public API exported via `src/index.ts` barrel file
- **Types**: Use TypeScript strict mode, no `as any` or `@ts-ignore`
- **Testing**: Jest with `.test.ts` files colocated in `src/`
- **Buffer handling**: Use `Uint8Array` primarily, `Buffer` for Node.js compat

## DeepWiki Repositories

Query these for current documentation:

| Repository | Contents |
|---|---|
| `iscc/iscc-core` | Python reference implementation (source of truth) |
| `iscc/iscc-ieps` | ISCC Enhancement Proposals (ISO 24138 specs) |
| `branciard/iscc-core-ts` | This TypeScript port |

## Porting Guidelines

1. **Always check Python reference first** — Read the Python function before implementing in TS
2. **Match function signatures** — Keep parameter names and return types compatible
3. **Use `data.json` for validation** — Every function output must match Python's expected output
4. **Handle bytes carefully** — Python `bytes`/`bytearray` → TS `Uint8Array`/`Buffer`
5. **Integer arithmetic** — Python has arbitrary precision integers; use `BigInt` when needed
6. **Streams** — Python `BytesIO` → TS `ReadableStream` or `Uint8Array` with offset tracking
7. **Test against conformance data** — Don't just unit test; validate against `data.json` outputs
