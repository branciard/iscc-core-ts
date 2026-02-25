# iscc-core-ts

[![Tests](https://github.com/branciard/iscc-core-ts/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/branciard/iscc-core-ts/actions/workflows/tests.yml)

TypeScript implementation of [iscc-core python reference](https://github.com/iscc/iscc-core)

# Project summary

The “ISCC-CORE typescript implementation library” goal is to implement core functions of the new [ISCC standard ISO 24138:2024](https://www.iso.org/fr/standard/77899.html) in Typescript programming language.
This typescript core library will be useful for the javascript ecosystem and developers ( frontend, backend ) to use and work with this new standard in their project.

The ISCC stands for “International Standard Content Code”. More detail at [https://iscc.codes/](https://iscc.codes/)

The ISCC is a similarity preserving fingerprint and identifier for digital media assets.

ISCCs are generated algorithmically from digital content, just like cryptographic hashes. However, instead of using a single cryptographic hash function to identify data only, the ISCC uses various algorithms to create a composite identifier that exhibits similarity-preserving properties (soft hash).

The component-based structure of the ISCC identifies content at multiple levels of abstraction. Each component is self-describing, modular, and can be used separately or with others to aid in various content identification tasks. The algorithmic design supports content deduplication, database synchronization, indexing, integrity verification, timestamping, versioning, data provenance, similarity clustering, anomaly detection, usage tracking, allocation of royalties, fact-checking and general digital asset management use-cases.

## Development Status

> **Note**: This library is under active development and not ready for production use.

Track development progress at our [project board](https://github.com/users/branciard/projects/1).


### Implementation Status

| Function | Status | Reference Coverage |
|----------|--------|---------------|
| gen_meta_code_v0 | ✓ Done | 16/16 tests |
| gen_text_code_v0 | ✓ Done | 5/5 tests |
| gen_image_code_v0 | ✓ Done | 3/3 tests |
| gen_audio_code_v0 | ✓ Done | 5/5 tests |
| gen_video_code_v0 | ✓ Done | 3/3 tests |
| gen_mixed_code_v0 | ✓ Done | 2/2 tests |
| gen_data_code_v0 | ✓ Done | 4/4 tests |
| gen_instance_code_v0 | ✓ Done | 3/3 tests |
| gen_iscc_code_v0 | ✓ Done | 5/5 tests |
| gen_iscc_id_v0 | ✓ Done | 15 tests |
| gen_iscc_id_v1 | ✓ Done | 15 tests |
| gen_flake_code_v0 | ✓ Done | — |


# Prerequisites

## With mise (recommended)

We recommend [mise](https://mise.jdx.dev/) to manage tool versions. A `mise.toml` is included in the repo.

```sh
mise install      # installs Node 22 LTS
mise run install   # npm install
mise run test      # run all tests
mise run typecheck # tsc type checking
```

## Without mise

Install [Node.js](https://nodejs.org/) v22 LTS (or use [nvm](https://github.com/nvm-sh/nvm)):

```sh
nvm install 22
nvm use 22
```

# Install and build

```sh
npm install
npm run build
```

# Tests

```sh
npm run test
```

Expected tests result:

```sh
Test Suites: 18 passed, 18 total
Tests:       263 passed, 263 total
```

# Documentation

- Generate Typedoc documentation in./docs/generated/iscc-core-ts/ with command:
```sh
npm run make:docs/reference
```
- Reference python implementation is available [here](https://github.com/iscc/iscc-core)
- Reference standard documentation is available [here](https://www.iso.org/fr/standard/77899.html)
- Examples (React, Svelte, Vite, Node.js) — see [`examples/README.md`](examples/README.md)

# Funding

This project is funded through [NGI Zero Core](https://nlnet.nl/core), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/ISCC-CORE-ts).

<p align="center">
  <a href="https://nlnet.nl"><img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://nlnet.nl/core"><img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" /></a>
</p>




