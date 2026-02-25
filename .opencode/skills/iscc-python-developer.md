---
name: iscc-python-developer
description: Guide for Python development with the ISCC (International Standard Content Code) framework - a content-derived identifier and fingerprint system for digital media. Use when writing Python code with ISCC libraries (iscc-core, iscc-sdk, iscc-sct, iscc-sci, iscc-search), generating ISCC codes, implementing similarity search, or integrating ISCC into Python applications. Triggers on ISCC-related Python questions, content identification, media fingerprinting, or similarity matching tasks.
---

# ISCC Python Developer

Guide for Python development with the International Standard Content Code (ISCC) framework.

## Prerequisites

This skill requires the DeepWiki MCP server for fetching repository documentation:

```bash
claude mcp add -s user -t http deepwiki https://mcp.deepwiki.com/mcp
```

## Core Workflow

1. **Understand the task** - Identify which ISCC capability is needed
2. **Query DeepWiki** - Fetch relevant documentation from the appropriate repository
3. **Generate code** - Write Python code using the correct ISCC library

## Repository Selection

Query DeepWiki (`mcp__deepwiki__ask_question`) with the appropriate repository:

| Task | Repository |
|------|------------|
| Low-level codec, ISCC-UNIT generation, binary encoding | `iscc/iscc-core` |
| High-level API, metadata extraction, media processing | `iscc/iscc-sdk` |
| Semantic text similarity, granular text features | `iscc/iscc-sct` |
| Semantic image similarity | `iscc/iscc-sci` |
| Similarity search, vector indexing | `iscc/iscc-vdb` |
| JSON schema, JSON-LD contexts | `iscc/iscc-schema` |
| Signing, timestamping, cryptographic operations | `iscc/iscc-crypto` |
| REST API service | `iscc/iscc-web` |
| Community specifications | `iscc/iscc-ieps` |

## DeepWiki Integration

Always query DeepWiki before writing ISCC code to get current API details:

```python
# Example: Get iscc-sdk usage
mcp__deepwiki__ask_question(
    repoName="iscc/iscc-sdk",
    question="How to generate an ISCC code from an image file?"
)
```

For architecture questions, query multiple repos or use `read_wiki_contents` for overview.

## Quick Reference

### Generate ISCC Code (iscc-sdk)

```python
from pathlib import Path
import iscc_sdk as idk

def generate_iscc_from_file(file_path):
    # type: (Path) -> str
    """Generate ISCC code from a media file."""
    iscc_meta = idk.code_iscc(str(file_path))
    return iscc_meta.iscc
```

### Low-Level ISCC-UNITs (iscc-core)

```python
from typing import BinaryIO
import iscc_core as ic

def generate_data_instance(stream):
    # type: (BinaryIO) -> tuple[str, str]
    """Generate Data-Code and Instance-Code from binary stream."""
    data_code = ic.gen_data_code(stream)
    stream.seek(0)
    instance_code = ic.gen_instance_code(stream)
    return data_code["iscc"], instance_code["iscc"]
```

### Semantic Text Similarity (iscc-sct)

```python
import iscc_sct as sct

def compute_text_similarity(text_a, text_b):
    # type: (str, str) -> float
    """Compute semantic similarity between two texts."""
    code_a = sct.gen_text_code_semantic(text_a)
    code_b = sct.gen_text_code_semantic(text_b)
    return sct.similarity(code_a, code_b)
```

## Resources

- **[references/iscc-overview.md](references/iscc-overview.md)** - ISCC concepts, terminology, and architecture
- **[references/repository-guide.md](references/repository-guide.md)** - Detailed repository descriptions and use cases
- **[references/python-guidelines.md](references/python-guidelines.md)** - Python code style, uv commands, and testing

## Code Generation Guidelines

1. Use `uv add` for dependencies, `uv run` to execute code
2. Use PEP 484 type comments (first line below function def), not inline annotations
3. Use `pathlib.Path` for cross-platform file paths
4. Import libraries with standard aliases: `iscc_sdk as idk`, `iscc_core as ic`, `iscc_sct as sct`
5. Write short, pure functions with minimal arguments
6. Use absolute, module-level imports only
7. Query DeepWiki for specific API methods before implementing
