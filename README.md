# iscc-core-ts
Iscc core TypeScript implementation of [iscc-core reference](https://github.com/iscc/iscc-core)

# Work In progress

This library is under develpement. It is not ready for production.

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
|                    |         | &#x2610; test_0013_norm_i18n_256
|                    |         | &#x2611; test_0014_meta_object_json
|                    |         | &#x2611; test_0015_meta_object_json_ld
|                    |         | &#x2611; test_0016_meta_data_url
| gen_text_code_v0   |  TODO   | &#x2610; test_0000_empty_str
|                    |         | &#x2610; test_0001_hello_world
|                    |         | &#x2610; test_0002_hello_world_256_bits
|                    |         | &#x2610; test_0003_i18n
|                    |         | &#x2610; test_0004_more    
| gen_image_code_v0  |  TODO   | &#x2610; test_0000_all_black_64 
|                    |         | &#x2610; test_0001_all_white_128 
|                    |         | &#x2610; test_0003_img_256 
| gen_audio_code_v0  |  TODO   | &#x2610; test_0000_empty_64
|                    |         | &#x2610; test_0001_one_128 
|                    |         | &#x2610; test_0002_two_256
|                    |         | &#x2610; test_0003_test_neg_256
|                    |         | &#x2610; test_0004_cv_256
| gen_video_code_v0  |  TODO   | &#x2610; test_0000_one_zero_frame_64
|                    |         | &#x2610; test_0001_multiple_frames_128
|                    |         | &#x2610; test_0003_range_256
| gen_mixed_code_v0  |  TODO   | &#x2610; test_0000_std_64
|                    |         | &#x2610; test_0001_128_truncated 
| gen_data_code_v0   |  TODO   | &#x2610; test_0000_two_bytes_64
|                    |         | &#x2610; test_0001_empty_64
|                    |         | &#x2610; test_0002_zero_128
|                    |         | &#x2610; test_0003_static_256
| gen_instance_code_v0   |  TODO   | &#x2610; test_0000_empty_64
|                    |         | &#x2610; test_0001_zero_128
|                    |         | &#x2610; test_0002_static_256
| gen_iscc_code_v0   |  TODO   | &#x2610; test_0000_standard
|                    |         | &#x2610; test_0001_no_meta
|                    |         | &#x2610; test_0002_no_meta_content_256
|                    |         | &#x2610; test_0003_no_meta_content_128
|                    |         | &#x2610; test_0004_ordering



# Prerequiste

We recomand to use [nvm](https://github.com/nvm-sh/nvm) to install and target node and npm versions. [Here](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/) an NVM install guide.

Nvm version used:
```sh
nvm --version
npm i
```
Install node 21 

```sh
nvm install --lts
Installing latest LTS version.
v20.18.0 is already installed.
Now using node v20.18.0 (npm v10.8.2)
```

# Install and build

```sh
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







