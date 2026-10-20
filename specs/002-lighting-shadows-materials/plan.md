# Implementation Plan: Realistic Lighting, Shadows & Material Rendering

**Branch**: `002-lighting-shadows-materials` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-lighting-shadows-materials/spec.md`

## Summary

Extend the GLB web viewer with three lighting/rendering capabilities: (1) an "Ambient Light" slider (0-100, default 50) that brightens the whole model in real time, (2) soft shadows cast by the main directional light onto the model's own surfaces, with an on/off switch (default on), and (3) faithful PBR material rendering so rough metals look rough (not flat/plastic) — judged by direct visual inspection per revised SC-003 (no Blender reference required). The technical approach reuses the existing Three.js r128 (CDN, no-build) stack: expose the already-present ambient light through state + UI, enable the renderer shadow pipeline (PCF soft shadow maps, self-shadowing traversal on model load), and fix flat metal by adding an environment map (PMREM + RoomEnvironment from the same r128 CDN) plus a proper sRGB/ACES tone color pipeline. All changes are additive to the three existing IIFE modules (`viewer.js`, `controls.js`) and `index.php`.

## Technical Context

**Language/Version**: JavaScript (ES5-style IIFE modules, plain browser JS — no transpilation); PHP (model listing API only); HTML/CSS. Three.js **r128** loaded as global `THREE` via CDN (non-module scripts).

**Primary Dependencies**: `three@0.128.0` + `examples/js/controls/OrbitControls.js` + `examples/js/loaders/GLTFLoader.js` (existing CDN scripts). New addition: `examples/js/environments/RoomEnvironment.js` from the same `three@0.128.0` CDN pin (verified available, exposes `THREE.RoomEnvironment`).

**Storage**: N/A — models are static `.glb` files in `release/modelos/`; no database, no persistence (lighting settings are session-only per spec).

**Testing**: Manual browser validation per [quickstart.md](quickstart.md) scenarios (constitution requires non-technical verification); existing `release/tests/test_models.php` smoke test. No JS test framework — a build/test toolchain is prohibited by the constitution (no Node runtime, no build step).

**Target Platform**: Modern desktop and mobile browsers; deployed to shared hosting (infinityfree.com) via existing GitHub Actions workflow; no server-side rendering involved.

**Project Type**: Single web application (static frontend + small PHP listing API) under `release/`.

**Performance Goals**: Model load → viewable within 5 s (existing budget); rotation/zoom fluid (no visible freezing) with shadows active; environment map prefiltered exactly once at startup.

**Constraints**: No build step, no Node runtime, no bundler; only CDN `<script>` additions; all UI labels in English; responsive layout preserved; shadow map resolution capped (1024, 512 on small screens) and pixel ratio already capped at 2.

**Scale/Scope**: 11 functional requirements; ~4 files modified (`index.php`, `css/style.css`, `js/viewer.js`, `js/controls.js`); `js/app.js`, `api/models.php` unchanged. Single-user client-side feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| I | English-only user interface | ✅ PASS | New labels "Ambient Light" and "Shadows" are English (FR-009); no other user-visible strings added. |
| II | Spec-defined scope only (NON-NEGOTIABLE) | ✅ PASS | Every planned change maps to FR-001…FR-011; out-of-scope list respected (no floor plane, no persistence, no tone-mapping controls, no new formats). |
| III | Non-technical verifiable success | ✅ PASS | All SC-001…SC-005 are observable in the running app (brightness, visible shadows, side-by-side material look, stopwatch load time). |
| IV | Simplicity and Clarity | ✅ PASS | Additive changes to existing modules; no new frameworks, patterns, or abstraction layers; single new CDN script. |
| V | GLB Web 3D Viewer purpose | ✅ PASS | GLB-only visualization improvements; thumbnails and model listing untouched. |
| Tech | PHP + plain HTML/CSS/JS, InfinityFree-compatible, models from `modelos/`, responsive, ≤5 s load | ✅ PASS | CDN scripts are the existing established pattern (r128 pinned); no build/Node/DB introduced; new GPU costs bounded (one-time PMREM prefilter + capped shadow map) — see [research.md](research.md) decision R3. |
| Workflow | Spec-first, constitution supersedes | ✅ PASS | Plan derives entirely from the clarified spec (2 clarifications recorded 2026-10-20). |

**Gate result**: PASS — no violations, nothing to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-lighting-shadows-materials/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-contract.md   # Phase 1 output — DOM + Viewer API contract
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
release/
├── index.php                    # MODIFY: + Ambient Light slider, + Shadows toggle (Lighting group); + RoomEnvironment CDN script
├── css/
│   └── style.css                # MODIFY: styles for the shadow toggle (reuse .control-btn/.slider-group patterns)
├── js/
│   ├── viewer.js                # MODIFY: ambient state + API, shadow pipeline, env map + color pipeline, model-load shadow traversal
│   ├── controls.js              # MODIFY: bindings for ambient slider + shadow toggle
│   └── app.js                   # UNCHANGED
├── api/
│   └── models.php               # UNCHANGED
├── modelos/                     # UNCHANGED (user-supplied .glb files)
└── tests/
    └── test_models.php          # UNCHANGED
```

**Structure Decision**: Keep the existing single-project layout — the feature is purely frontend rendering inside the established IIFE module pattern (`Viewer` public API + `Controls` bindings). No new directories, files-in-JS, or server-side code are introduced; `app.js` needs no changes because model loading already funnels through `Viewer.loadModel` (where per-mesh shadow flags are applied) and controls already funnel through `Viewer`'s public API.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_ | — | Constitution Check passed with zero violations. |
