---
name: iscc-brand-guidelines
description: Applies ISCC official brand colors and typography to any artifact that may benefit from having the ISCC look-and-feel. Use it when brand colors or style guidelines, visual formatting, or design standards apply.
---

# ISCC Brand Styling

## Overview

To access the official ISCC (International Standard Content Code) brand identity and style resources, use this skill.

**Keywords**: branding, corporate identity, visual identity, post-processing, styling, brand colors, typography, ISCC brand, visual formatting, visual design, content identification

## Brand Guidelines

### Colors

**Primary Palette:**

- ISCC Blue: `#0054b2` - Primary brand color for headers, links, and CTAs
- Deep Navy: `#123663` - Secondary color for backgrounds and emphasis
- Bright Yellow: `#ffc300` - Accent color for highlights and warnings
- Coral Red: `#f56169` - Error states and critical alerts
- Lime Green: `#a6db50` - Success states and confirmations

**Extended Blues:**

- Sky Blue: `#4596f5` - Light variant for secondary actions
- Light Cyan: `#7ac2f7` - Tertiary blue for subtle accents

**Neutral Colors:**

- Pure White: `#ffffff` - Primary background
- Off White: `#f8f9fa` - Secondary background
- Light Gray: `#e9ecef` - Borders and dividers
- Medium Gray: `#6c757d` - Secondary text
- Dark Gray: `#343a40` - Primary text
- Near Black: `#212529` - Headers and emphasis

### Typography

- **Headings & Body**: Readex Pro (with Arial fallback)
- **Code & ISCC-IDs**: JetBrains Mono (with Consolas fallback)
- **Note**: Fonts should be pre-installed in your environment for best results

### Logo

The ISCC logo consists of a geometric mark (circle and square with gap) plus wordmark.

**Available Assets:**

- `assets/favicon.png` - Icon/symbol only, for favicons and small contexts
- `assets/logo_light.png` - Dark logo for light backgrounds
- `assets/logo_dark.png` - White logo for dark backgrounds

**Usage Guidelines:**

- Minimum clear space: Equal to the height of the "I" in ISCC
- Minimum width: 120px
- Use `logo_light.png` (dark version) on light backgrounds
- Use `logo_dark.png` (white version) on dark backgrounds
- Use `favicon.png` for icons, favicons, and small UI elements

## Features

### Smart Font Application

- Applies Readex Pro font to headings and body text
- Applies JetBrains Mono to code blocks and ISCC-ID displays
- Automatically falls back to Arial/Consolas if custom fonts unavailable
- Preserves readability across all systems

### Text Styling

- Headings: Readex Pro, bold weights (500-700)
- Body text: Readex Pro, regular weight (400)
- Technical text: JetBrains Mono with letter-spacing
- Smart color selection based on background

### ISCC Component Colors

ISCC uses a hexagonal color system to represent different code components:

- **Meta-Code**: Sky Blue `#4596f5` - Metadata similarity
- **Semantic-Code**: Medium Gray `#6c757d` - Semantic similarity
- **Content-Code**: ISCC Blue `#0054b2` - Syntactic similarity
- **Data-Code**: Light Cyan `#7ac2f7` - Data similarity
- **Instance-Code**: Deep Navy `#123663` - Data integrity

### Status Indicators

- Success: Lime Green `#a6db50` with checkmark icon
- Warning: Bright Yellow `#ffc300` with exclamation icon
- Error: Coral Red `#f56169` with X icon
- Info: Sky Blue `#4596f5` with info icon

## Technical Details

### Font Management

- Uses system-installed Readex Pro and JetBrains Mono when available
- Provides automatic fallback to Arial (text) and Consolas (code)
- No font installation required - works with existing system fonts
- For best results, pre-install Readex Pro and JetBrains Mono fonts

### Color Application

- Uses RGB color values for precise brand matching
- Applied via python-pptx's RGBColor class
- Maintains color fidelity across different systems

### ISCC-ID Display

- Font: JetBrains Mono, 16px
- Letter-spacing: 0.05em
- Color: Deep Navy `#123663`
- Background: Off White `#f8f9fa`
- Word-break: break-all for long codes
