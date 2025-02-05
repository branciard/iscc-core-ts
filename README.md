# iscc-core-ts
Iscc core TypeScript implementation of [iscc-core python reference](https://github.com/iscc/iscc-core)

# Project summary

The “ISCC-CORE typescript implementation library” goal is to implement core functions of the new [ISCC standard ISO 24138:2024](https://www.iso.org/fr/standard/77899.html) in Typescript programming language.
This typescript core library will be useful for the javascript ecosystem and developers ( frontend, backend ) to use and work with this new standard in their project.

The ISCC stands for “International Standard Content Code”. More detail at [https://iscc.codes/](https://iscc.codes/)

The ISCC is a similarity preserving fingerprint and identifier for digital media assets.

ISCCs are generated algorithmically from digital content, just like cryptographic hashes. However, instead of using a single cryptographic hash function to identify data only, the ISCC uses various algorithms to create a composite identifier that exhibits similarity-preserving properties (soft hash).

The component-based structure of the ISCC identifies content at multiple levels of abstraction. Each component is self-describing, modular, and can be used separately or with others to aid in various content identification tasks. The algorithmic design supports content deduplication, database synchronization, indexing, integrity verification, timestamping, versioning, data provenance, similarity clustering, anomaly detection, usage tracking, allocation of royalties, fact-checking and general digital asset management use-cases.

# Work In progress

This library is under development. It is not ready for production. The current development planning can be check [here](https://github.com/users/branciard/projects/1)

| Functions  | Implementation  | test coverage
| ---------- | --------------  | -------- |
| gen_meta_code_v0   | Done    | &#x2611; test_0001_title_only
|                    |         | &#x2611; test_0002_title_extra
|                    |         | &#x2611; test_0003_96_bits
|                    |         | &#x2611; test_0004_128_bits
|                    |         | &#x2611; test_0005_160_bits
|                    |         | &#x2611; test_0006_192_bits
|                    |         | &#x2611; test_0007_224_bits
|                    |         | &#x2611; test_0008_256_bits
|                    |         | &#x2611; test_0009_i18n
|                    |         | &#x2611; test_0010_normalizeation
|                    |         | &#x2611; test_0011_trim
|                    |         | &#x2611; test_0012_trim_i18n
|                    |         | &#x2611; test_0013_norm_i18n_256
|                    |         | &#x2611; test_0014_meta_object_json
|                    |         | &#x2611; test_0015_meta_object_json_ld
|                    |         | &#x2611; test_0016_meta_data_url
| gen_text_code_v0   |  Done   | &#x2611; test_0000_empty_str
|                    |         | &#x2611; test_0001_hello_world
|                    |         | &#x2611; test_0002_hello_world_256_bits
|                    |         | &#x2611; test_0003_i18n
|                    |         | &#x2611; test_0004_more    
| gen_image_code_v0  |  Done   | &#x2611; test_0000_all_black_64 
|                    |         | &#x2611; test_0001_all_white_128 
|                    |         | &#x2611; test_0003_img_256 
| gen_audio_code_v0  |  Done   | &#x2611; test_0000_empty_64
|                    |         | &#x2611; test_0001_one_128 
|                    |         | &#x2611; test_0002_two_256
|                    |         | &#x2611; test_0003_test_neg_256
|                    |         | &#x2611; test_0004_cv_256
| gen_video_code_v0  |  Done   | &#x2611; test_0000_one_zero_frame_64
|                    |         | &#x2611; test_0001_multiple_frames_128
|                    |         | &#x2611; test_0003_range_256
| gen_mixed_code_v0  |  Done   | &#x2611; test_0000_std_64
|                    |         | &#x2611; test_0001_128_truncated 
| gen_data_code_v0   |  Done   | &#x2611; test_0000_two_bytes_64
|                    |         | &#x2611; test_0001_empty_64
|                    |         | &#x2611; test_0002_zero_128
|                    |         | &#x2611; test_0003_static_256
| gen_instance_code_v0   |  Done   | &#x2611; test_0000_empty_64
|                    |         | &#x2611; test_0001_zero_128
|                    |         | &#x2611; test_0002_static_256
| gen_iscc_code_v0   |  Done   | &#x2611; test_0000_standard
|                    |         | &#x2611; test_0001_no_meta
|                    |         | &#x2611; test_0002_no_meta_content_256
|                    |         | &#x2611; test_0003_no_meta_content_128
|                    |         | &#x2611; test_0004_ordering



# Prerequiste

We recomand to use [nvm](https://github.com/nvm-sh/nvm) to install and target node and npm versions. [Here](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/) an NVM install guide.

Nvm version used:
```sh
nvm --version
0.40.1
```
Install node 21 

```sh
nvm install --lts
Installing latest LTS version.
v22.13.1 is already installed.
Now using node v22.13.1 (npm v10.9.2)

```

# Install and build

```sh
npm install -g npm@11.1.0
npm i
npm run build
```

# Tests

```sh
npm run test
npm run test-isolated
npm run test-esm
npm run test-esm-isolated
```

Expected tests result :

```sh
 PASS  src/content-normalization.test.ts
 PASS  src/cdc.test.ts
 PASS  src/code-content-audio.test.ts
 PASS  src/iscc-code.test.ts
 PASS  src/code-content-image.test.ts
 PASS  src/code-content-text.test.ts
 PASS  src/minhash.test.ts
 PASS  src/utils.test.ts
 PASS  src/code-content-video.test.ts
 PASS  src/metacode.test.ts
 PASS  src/codec.test.ts
 PASS  src/code-content-mixed.test.ts
 PASS  src/code-instance.test.ts
 PASS  src/data.test.ts
 PASS  src/code-data.test.ts

Test Suites: 15 passed, 15 total
Tests:       192 passed, 192 total
```

# Funding

This project is funded through [NGI Zero Core](https://nlnet.nl/core), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/ISCC-CORE-ts).

<p align="center">
  <a href="https://nlnet.nl"><img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://nlnet.nl/core"><img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" /></a>
</p>




