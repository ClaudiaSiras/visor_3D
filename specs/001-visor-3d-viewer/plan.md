# Implementation Plan: Visor 3D Viewer v1

**Branch**: `001-visor-3d-viewer` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-visor-3d-viewer/spec.md`

## Summary

A web application that allows users to select from preloaded 3D models (`.glb` format) in a carousel and visualize them in an interactive 3D viewer. Users can rotate, zoom, pan, toggle wireframe/texture/emissive modes, control a global parallel light, and reset the view. The application is responsive for desktop and mobile, built with PHP + plain HTML/CSS/JS, compatible with shared hosting.

## Technical Context

**Language/Version**: PHP 7.4+ (backend), HTML5/CSS3/ES6+ (frontend)

**Primary Dependencies**: Three.js (3D rendering library, loaded via CDN or local copy)

**Storage**: File system — `.glb` model files in `modelos/` folder

**Testing**: Manual testing with browser developer tools; basic PHP unit tests for model listing API

**Target Platform**: Web browser (desktop Chrome/Firefox/Safari/Edge, mobile Safari/Chrome)

**Project Type**: Web application (frontend + minimal backend)

**Performance Goals**: Model load ≤3 seconds, 60fps rendering, responsive layout <100ms reflow

**Constraints**: No build step, no Node.js runtime, shared-hosting compatible (InfinityFree), 10MB max model file size, no file uploads

**Scale/Scope**: Single page application, 1-50 models in carousel, single concurrent user (anonymous visitor)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. English-Only UI | PASS | All labels: "wireframe", "texture", "light", "emissive", "reset", "Loading" |
| II. Spec-Defined Scope Only | PASS | No uploads, no editing, no persistence — matches spec |
| III. Non-Technical Verifiable Success | PASS | All success criteria verifiable by non-technical user |
| IV. Simplicity and Clarity | PASS | Single page, minimal dependencies |
| V. GLB Web 3D Viewer | PASS | `.glb` format only, `modelos/` folder, no uploads |
| Technology: PHP + HTML/CSS/JS | PASS | No build step, no Node.js, shared-hosting compatible |
| Responsive | PASS | Desktop + mobile layout per spec |
| Load ≤5 seconds | PASS | Spec requires ≤3 seconds; 10MB limit ensures this |

**Result**: All gates PASS. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-visor-3d-viewer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
visor_3D/
├── index.php                 # Main page (HTML + PHP)
├── css/
│   └── style.css             # All styles (responsive)
├── js/
│   ├── app.js                # Main application logic
│   ├── viewer.js             # 3D viewer (Three.js)
│   └── controls.js           # UI controls (buttons, sliders)
├── api/
│   └── models.php            # Model listing endpoint
├── modelos/                  # 3D model files (.glb)
│   └── .gitkeep
├── vendor/
│   └── three.min.js          # Three.js library (local copy)
└── tests/
    └── test_models.php       # Basic PHP tests
```

**Structure Decision**: Simple flat structure suitable for shared hosting. PHP serves the main page and provides a model listing API. Frontend uses Three.js for 3D rendering. No framework or build step required.

## Complexity Tracking

No violations. All constitution gates pass.
