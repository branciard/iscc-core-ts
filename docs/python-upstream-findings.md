# Python Upstream Security Findings

**Source**: Radically Open Security (ROS) Code Audit of `iscc-core-ts` v1.0 (May 4, 2025)  
**Cross-checked against**: `iscc-core` (Python) v1.2.2  
**Date**: February 25, 2026  
**Author**: François Branciard (NLnet grant — ISCC-CORE-ts migration)

---

## Background

During the NLnet-funded TypeScript migration of `iscc-core`, Radically Open Security performed a code audit on the TypeScript port (`iscc-core-ts`). Five findings were identified (CLN-003 through CLN-007), all of which have been remediated in the TypeScript library.

Additionally, an independent internal security review uncovered further issues (classified H1–H4), which were also resolved in TypeScript.

This document cross-references those findings against the Python reference implementation (`iscc-core` v1.2.2) to determine which vulnerabilities also exist upstream and may warrant fixes via pull request.

---

## Findings Applicable to Python

### 1. CLN-005 — Resource Exhaustion via `name` Parameter in `gen_meta_code`

| | |
|---|---|
| **Severity** | Elevated |
| **Type** | Uncontrolled Resource Consumption (CWE-400) |
| **Python Status** | **Vulnerable** |
| **File** | `iscc_core/code_meta.py`, line 49 |

**Description**: The `name` parameter is passed directly to `text_clean()` before any length truncation. `text_clean()` performs Unicode NFKC normalization followed by character-by-character Unicode category filtering — both expensive operations. A malicious input of 10^7+ characters causes excessive CPU and memory consumption.

**Vulnerable Python code** (`code_meta.py:47-51`):

```python
# 1. Normalize `name`
name = "" if name is None else name
name = text_clean(name)              # ← processes entire input, no size limit
name = text_remove_newlines(name)
name = text_trim(name, ic.core_opts.meta_trim_name)  # ← truncation happens AFTER
```

**Recommended fix**: Pre-truncate `name` before calling `text_clean()`. Since the final output is trimmed to `meta_trim_name` (128 bytes), a generous pre-truncation to `meta_trim_name * 10` (1,280 bytes) prevents DoS while preserving all legitimate use cases.

```python
name = "" if name is None else name
name = name[:ic.core_opts.meta_trim_name * 10]  # pre-truncate before expensive processing
name = text_clean(name)
name = text_remove_newlines(name)
name = text_trim(name, ic.core_opts.meta_trim_name)
```

**Note**: The same pre-truncation pattern should also apply to `description` before its `text_clean()` call at line 58, even though `description` already has a proper `text_trim()` at line 59. The expensive `text_clean()` still runs on the full input.

---

### 2. CLN-007 — Resource Exhaustion via `meta` Parameter in `gen_meta_code`

| | |
|---|---|
| **Severity** | Elevated |
| **Type** | Uncontrolled Resource Consumption (CWE-400) |
| **Python Status** | **Vulnerable** |
| **File** | `iscc_core/code_meta.py`, lines 62–78 |

**Description**: The `meta` parameter (either a dict or Data-URL string) has no size validation. Arbitrarily large JSON objects are fully canonicalized via `jcs.canonicalize()` and hashed via `blake3`, and arbitrarily large Data-URL strings are fully decoded via `DataURL.from_url()`. No maximum size is enforced.

**Vulnerable Python code** (`code_meta.py:62-78`):

```python
if meta:
    if isinstance(meta, str):
        durl = meta
        payload = DataURL.from_url(durl).data       # ← no size limit on Data-URL
        meta_code_digest = soft_hash_meta_v0(name, payload)
        metahash = ic.multi_hash_blake3(payload)
        metadata_value = durl
    elif isinstance(meta, dict):
        payload = jcs.canonicalize(meta)             # ← no size limit on dict
        meta_code_digest = soft_hash_meta_v0(name, payload)
        metahash = ic.multi_hash_blake3(payload)
        # ...
```

**Recommended fix**: Add a maximum byte size check for the `meta` parameter. The TypeScript port uses a 10 MB limit (`MAX_META_BYTES = 10_000_000`):

```python
MAX_META_BYTES = 10_000_000  # 10 MB

if meta:
    if isinstance(meta, str):
        if len(meta.encode("utf-8")) > MAX_META_BYTES:
            raise ValueError(f"meta Data-URL exceeds maximum size of {MAX_META_BYTES} bytes")
        durl = meta
        payload = DataURL.from_url(durl).data
        # ...
    elif isinstance(meta, dict):
        payload = jcs.canonicalize(meta)
        if len(payload) > MAX_META_BYTES:
            raise ValueError(f"meta JSON exceeds maximum size of {MAX_META_BYTES} bytes")
        # ...
```

---

### 3. H3 — Crash on Empty Input in `alg_simhash`

| | |
|---|---|
| **Severity** | High |
| **Type** | Unhandled Exception / Input Validation (CWE-20) |
| **Python Status** | **Vulnerable** |
| **File** | `iscc_core/simhash.py`, line 15 |

**Description**: `alg_simhash()` accesses `hash_digests[0]` without checking if the list is empty, causing an `IndexError`.

**Vulnerable Python code** (`simhash.py:5-15`):

```python
def alg_simhash(hash_digests):
    # type: (list[bytes]) -> bytes
    """Creates a similarity preserving hash from a sequence of equal sized hash digests."""

    n_bytes = len(hash_digests[0])  # ← IndexError if hash_digests is empty
    n_bits = n_bytes * 8
    vector = [0] * n_bits
    # ...
```

**Recommended fix**: Add an empty input guard:

```python
def alg_simhash(hash_digests):
    # type: (list[bytes]) -> bytes
    if not hash_digests:
        raise ValueError("hash_digests must not be empty")

    n_bytes = len(hash_digests[0])
    # ...
```

---

### 4. H4 — Missing Minimum Length Validation in `soft_hash_video_v0`

| | |
|---|---|
| **Severity** | Medium |
| **Type** | Input Validation (CWE-20) |
| **Python Status** | **Partially vulnerable** |
| **File** | `iscc_core/code_content_video.py`, lines 57–74 |

**Description**: The function validates that `frame_sigs` is non-empty (good), but does not validate that each signature meets the expected minimum length (380 elements for MP7 frame signatures). Short signatures will produce incorrect or degenerate results from `alg_wtahash()`.

**Python code** (`code_content_video.py:57-74`):

```python
def soft_hash_video_v0(frame_sigs, bits=ic.core_opts.video_bits):
    if not frame_sigs:
        raise ValueError("frame_sigs cannot be empty")  # ← good: empty check

    if not isinstance(frame_sigs[0], tuple):
        frame_sigs = [tuple(sig) for sig in frame_sigs]
    sigs = set(frame_sigs)
    vecsum = [sum(col) for col in zip(*sigs)]            # ← no minimum length check
    video_hash_digest = ic.alg_wtahash(vecsum, bits)
    return video_hash_digest
```

**Recommended fix**: Add validation that signature vectors have the expected length:

```python
MIN_FRAME_SIG_LENGTH = 380  # MP7 frame signature expected length

def soft_hash_video_v0(frame_sigs, bits=ic.core_opts.video_bits):
    if not frame_sigs:
        raise ValueError("frame_sigs cannot be empty")

    if not isinstance(frame_sigs[0], tuple):
        frame_sigs = [tuple(sig) for sig in frame_sigs]

    if len(frame_sigs[0]) < MIN_FRAME_SIG_LENGTH:
        raise ValueError(
            f"Frame signatures must have at least {MIN_FRAME_SIG_LENGTH} elements, "
            f"got {len(frame_sigs[0])}"
        )

    sigs = set(frame_sigs)
    vecsum = [sum(col) for col in zip(*sigs)]
    # ...
```

---

## Findings NOT Applicable to Python

| Finding | Reason |
|---------|--------|
| **CLN-006** — Missing `description` trimming | Python already applies `text_trim(description, meta_trim_description)` at line 59 of `code_meta.py`. This was a **porting bug** specific to TypeScript. |
| **CLN-003** — Negative length in `chunkString` | Python's `sliding_window()` already validates `width < 2` at `utils.py:261`. The JavaScript `chunkString` regex constructor injection is JS-specific. |
| **CLN-004** — Prototype pollution in `isJson` | JavaScript-specific vulnerability. Python's `json.loads()` is not susceptible to prototype pollution. |
| **H1** — `json_canonical` round-trip | Python's `json_canonical()` already performs a round-trip equality check at `utils.py:87-89`. |

---

## Summary

| Finding | Severity | Python Status | Recommended Action |
|---------|----------|---------------|-------------------|
| CLN-005 | Elevated | **Vulnerable** | Pre-truncate `name` (and `description`) before `text_clean()` |
| CLN-007 | Elevated | **Vulnerable** | Add `MAX_META_BYTES` validation |
| H3 | High | **Vulnerable** | Add empty list guard in `alg_simhash()` |
| H4 | Medium | **Partially vulnerable** | Add minimum signature length validation |
| CLN-006 | Elevated | Not applicable | Porting bug — Python already fixed |
| CLN-003 | Low | Not applicable | Python already validates; JS-specific issue |
| CLN-004 | Low | Not applicable | JS-specific prototype pollution |
| H1 | High | Not applicable | Python already validates round-trip |

Three high/elevated findings (CLN-005, CLN-007, H3) are confirmed present in the Python reference and warrant upstream PRs. One medium finding (H4) is partially addressed but could benefit from stronger validation.
