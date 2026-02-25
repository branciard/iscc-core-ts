---
name: iscc-standards-expert
description: Expert knowledge about ISO 24138:2024 - International Standard Content Code (ISCC). Use this skill when answering questions about ISCC specifications, ISCC-CODEs, content identification, similarity hashing, or the ISCC Enhancement Proposals (IEPs).
---

# ISCC Standards Expert

## Overview

This skill provides expert knowledge about the **ISO 24138:2024 - International Standard Content Code (ISCC)**.

**Keywords**: ISCC, ISO 24138, content identification, similarity hash, content code, ISCC-CODE, ISCC-ID, Meta-Code, Text-Code, Image-Code, Audio-Code, Video-Code, Data-Code, Instance-Code, Mixed-Code, content fingerprint, perceptual hash, decentralized registry, DID method

## When to Use This Skill

Activate this skill when users ask about:

- ISCC specifications and how ISCC works
- ISO 24138:2024 standard details
- ISCC-CODE generation and composition
- Individual ISCC-UNIT types (Meta, Semantic, Content, Data, Instance)
- Content similarity detection and matching
- ISCC metadata and JSON-LD schemas
- Decentralized content registry (ISCC-ID)
- DID method for ISCC (did:iscc)
- ISCC Enhancement Proposals (IEPs)

## How to Answer ISCC Questions

### Step 1: Check for DeepWiki MCP Tools

First, check if the DeepWiki MCP tools are available (`mcp__deepwiki__ask_question`, `mcp__deepwiki__read_wiki_structure`, `mcp__deepwiki__read_wiki_contents`).

### Step 2a: If DeepWiki IS Available

Query the official ISCC specifications repository:

- **Repository**: `iscc/iscc-ieps`
- **Contents**: Official ISCC Enhancement Proposals defining ISO 24138:2024

**Tools:**

1. **`mcp__deepwiki__ask_question`** - Ask specific questions about ISCC
   - Example: `{"repoName": "iscc/iscc-ieps", "question": "How is the Text-Code generated?"}`

2. **`mcp__deepwiki__read_wiki_structure`** - Get overview of available topics

3. **`mcp__deepwiki__read_wiki_contents`** - Get comprehensive documentation

**Query Strategy:**

1. For specific technical questions, use `ask_question` with the exact user question
2. For overview questions, first check `read_wiki_structure` to understand available topics
3. Always cite the relevant IEP number when providing information

### Step 2b: If DeepWiki is NOT Available

Use the embedded knowledge in this skill document (see below) and inform the user:

> "For more detailed and up-to-date information, consider installing the DeepWiki MCP server which provides direct access to the official ISCC specifications. Setup instructions: https://docs.devin.ai/work-with-devin/deepwiki-mcp"

Also point users to these resources:

- **IEPs Repository**: https://github.com/iscc/iscc-ieps
- **ISCC Website**: https://iscc.io
- **Reference Implementation**: https://github.com/iscc/iscc-core

---

## ISCC Technical Reference

The following sections provide baseline knowledge for answering ISCC questions when DeepWiki is unavailable.

### What is ISCC?

The **International Standard Content Code (ISCC)** is a content-derived identifier system standardized as **ISO 24138:2024**. It generates similarity-preserving hashes from digital content that:

- Identify content based on what it is, not where it is stored
- Detect similar or near-duplicate content across format conversions
- Enable decentralized content registration and discovery
- Work with any digital media type (text, images, audio, video, data)

### ISCC Structure

Every ISCC consists of two parts:

1. **ISCC-HEADER**: Variable-length metadata (MainType, SubType, Version, Length)
2. **ISCC-BODY**: Fixed-length similarity hash (32-320 bits)

**Canonical Format**: `ISCC:` prefix followed by Base32-encoded identifier

- Example: `ISCC:KEC43HJLPUSHVAZT66YLPUWNVACWYPIV533TRQMWF2IUQYSP5LA4CTY`

### ISCC-UNIT Types

| MainType | ID  | IEP                          | Purpose                     | Algorithm                     |
| -------- | --- | ---------------------------- | --------------------------- | ----------------------------- |
| META     | 0   | IEP-0002                     | Metadata similarity         | Interleaved similarity hashes |
| SEMANTIC | 1   | -                            | Semantic content similarity | NLP-based                     |
| CONTENT  | 2   | IEP-0003/0004/0005/0006/0007 | Perceptual similarity       | Media-specific                |
| DATA     | 3   | IEP-0008                     | Data similarity             | CDC + MinHash                 |
| INSTANCE | 4   | IEP-0009                     | Data identity               | BLAKE3 hash                   |
| ISCC     | 5   | IEP-0010                     | Composite code              | Combination                   |

### Content-Code Subtypes

| SubType | ID  | IEP      | Input       | Algorithm           |
| ------- | --- | -------- | ----------- | ------------------- |
| TEXT    | 0   | IEP-0003 | Plain text  | N-gram + MinHash    |
| IMAGE   | 1   | IEP-0004 | Image files | DCT perceptual hash |
| AUDIO   | 2   | IEP-0005 | Audio files | Chromaprint         |
| VIDEO   | 3   | IEP-0006 | Video files | MPEG-7 signatures   |
| MIXED   | 4   | IEP-0007 | Multi-modal | Combined hashes     |

### ISCC-CODE Composition (IEP-0010)

An ISCC-CODE combines multiple ISCC-UNITs from the same digital asset:

**Required Components:**

- Data-Code (64-bit) - data similarity
- Instance-Code (64-bit) - file identity

**Optional Components:**

- Meta-Code (64-bit) - metadata similarity
- Semantic-Code (64-bit) - semantic similarity
- Content-Code (64-bit) - perceptual similarity

**Composition Order**: META → SEMANTIC → CONTENT → DATA → INSTANCE

**Body Length**: 128-320 bits depending on included components

### Similarity Comparison

ISCC uses **Hamming distance** to measure similarity between codes:

- Distance 0 = identical content
- Lower distance = higher similarity
- Compare only codes of the same MainType/SubType

### Key Processing Algorithms

**Text-Code (IEP-0003)**:

1. Unicode normalization (NFD → lowercase → NFKC)
2. Remove whitespace, punctuation, marks
3. Generate 13-character n-grams
4. Hash with XXH32
5. Apply MinHash256

**Image-Code (IEP-0004)**:

1. Transpose by orientation, add white background
2. Crop borders, convert to grayscale
3. Resize to 32x32 pixels
4. Apply DCT transform
5. Extract bits via median comparison

**Data-Code (IEP-0008)**:

1. Content-Defined Chunking (avg 1024 bytes)
2. XXH32 hash per chunk
3. Apply MinHash

**Instance-Code (IEP-0009)**:

- BLAKE3 cryptographic hash of file data

### Registry and Identity (IEP-0011, IEP-0013, IEP-0015)

- **ISCC-ID**: Globally unique identifier for registered content
- **Decentralized Registry**: Blockchain-based content registration
- **DID Method**: `did:iscc:` W3C Decentralized Identifier

### IEP Index

| IEP      | Title                          | Status |
| -------- | ------------------------------ | ------ |
| IEP-0000 | Purpose and Guidelines         | Draft  |
| IEP-0001 | ISCC Structure and Format      | Draft  |
| IEP-0002 | Meta-Code                      | Draft  |
| IEP-0003 | Text-Code                      | Draft  |
| IEP-0004 | Image-Code                     | Draft  |
| IEP-0005 | Audio-Code                     | Draft  |
| IEP-0006 | Video-Code                     | Draft  |
| IEP-0007 | Mixed-Code                     | Draft  |
| IEP-0008 | Data-Code                      | Draft  |
| IEP-0009 | Instance-Code                  | Draft  |
| IEP-0010 | ISCC-CODE                      | Draft  |
| IEP-0012 | ISCC Metadata                  | Draft  |
