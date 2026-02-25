# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.0](https://github.com/branciard/iscc-core-ts/releases/tag/v1.0.0) - 2026-02-25

Iteration 4 — Dev starter kit and 1.0 release.
This iteration finalises the NLnet NGI Zero Core grant. The Radically Open Security (ROS) external security audit has been analysed and all findings remediated. An independent internal security and performance review added further hardening. The library now reaches full parity with the Python iscc-core v1.2.2 reference, backed by 263 conformance tests running across 4 module modes (1,052 test executions). Four hello-world examples (React, Svelte, Vite vanilla, Node.js) provide a developer starter kit for the JavaScript ecosystem. A cross-reference analysis of audit findings against the Python reference has been documented for potential upstream contributions.

### Security audit remediation

All 5 findings from the ROS code audit (May 2025, commit `a81035f8`) have been resolved:

- **CLN-005** (Elevated): Resource exhaustion via `name` parameter — pre-truncate before expensive `text_clean()` processing
- **CLN-006** (Elevated): Missing `description` byte limit — porting bug fixed, added `META_TRIM_DESCRIPTION = 4096` matching Python
- **CLN-007** (Elevated): Resource exhaustion via `meta` parameter — added `MAX_META_BYTES = 10_000_000` validation
- **CLN-003** (Low): `chunkString` accepted negative length — added positive integer validation
- **CLN-004** (Low): `isJson` prototype pollution — added `__proto__`/`constructor`/`prototype` key rejection

Full details: [`docs/audit-remediation-report.md`](docs/audit-remediation-report.md)

### Internal security and performance review

Beyond the audit, an independent review identified and resolved 17 additional findings:

- **Critical**: Fixed `mfBase64url` binary data corruption (UTF-8 round-trip issue); fixed `json_canonical` round-trip check for non-sorted keys
- **Security**: Fixed unbounded `_COUNTER` Map memory leak in `code-flake.ts`; added input validation for `alg_simhash` and `soft_hash_video_v0`; replaced loose equality (`==`) with strict equality (`===`) across 8 files; removed unsafe `as any` casts in `codec.ts`
- **Performance**: 5 hot-path optimizations — `content-normalization.ts` (~20× faster), `codec.ts:toHexString` (~10× faster), `utils.ts:binaryArrayToUint8Array` (~5× faster), `simhash.ts` (~3× faster), `minhash.ts:algMinhashCompress` (~3× faster)

### Python v1.2.2 parity

- Full catch-up with latest Python iscc-core v1.2.2 reference [#46](https://github.com/branciard/iscc-core-ts/issues/46)
- 263 conformance tests derived from Python test vectors, running in 4 module modes (CJS, CJS-isolated, ESM, ESM-isolated) [#47](https://github.com/branciard/iscc-core-ts/issues/47)

### Developer starter kit — Examples

- **React example** (React 19 + Vite 7): 13 interactive sections covering all ISCC code generators
- **Svelte example** (Svelte 5 + Vite): Full port of the React example with ISCC brand styling
- **Vite vanilla example** (TypeScript + Vite): No-framework example, all 13 sections
- **Node.js example**: CLI-based example testing all library functions
- Fixed browser crypto compatibility: `crypto.getRandomValues` → `crypto.randomFillSync` in `code-flake.ts`

### Documentation

- Generated API documentation with TypeDoc [#34](https://github.com/branciard/iscc-core-ts/issues/34)
- Audit remediation report: [`docs/audit-remediation-report.md`](docs/audit-remediation-report.md)
- Python upstream findings report: [`docs/python-upstream-findings.md`](docs/python-upstream-findings.md)
- Updated README with examples links and implementation status table



## [v0.3.0](https://github.com/branciard/iscc-core-ts/releases/tag/v0.3.0) - 2024-02-20

Iteration 3.
In this iteration the NGI security launch will be planned. During the external security audit, I will also see with the ISCC fondation for a perfect match of the ISO standard support and see with python developer to exchanges and tackle corner cases. Release pipeline will be implemented.

Issues fixed: 
- Upgrade typescript impl to last python Release v1.1.0 [#45](https://github.com/branciard/iscc-core-ts/issues/45)
- Check if all functions of codec.py are implemented into codec.ts and test coverage is ok [#44](https://github.com/branciard/iscc-core-ts/issues/44)
- Verify if migration to typescript of models.py is necessary [#43](https://github.com/branciard/iscc-core-ts/issues/43)
- test "handles 1MiB data robustly" not working [#42](https://github.com/branciard/iscc-core-ts/issues/42)
- Check if workaround on toString('hex') is realy needed [#41](https://github.com/branciard/iscc-core-ts/issues/41)
- clarify NONE and TEXT equal = 0 in subType usage for encode_component codec fonction [#40](https://github.com/branciard/iscc-core-ts/issues/40)

Milestone(s):
- a. Launch NGI external security audit [#27](https://github.com/branciard/iscc-core-ts/issues/27)
- b. Verfiy implementation according to ISO standard publish [#21](https://github.com/branciard/iscc-core-ts/issues/21)
- c. Define and setup release pipeline [#20](https://github.com/branciard/iscc-core-ts/issues/20)
- d. Improve Readme and documentation [#19](https://github.com/branciard/iscc-core-ts/issues/19)
- e. Publish Iteration 2 release 0.3.0 [#29](https://github.com/branciard/iscc-core-ts/issues/29)
