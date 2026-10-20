# Phase 1 Data Model: Realistic Lighting, Shadows & Material Rendering

**Feature**: 002-lighting-shadows-materials | **Date**: 2026-10-20

The feature introduces no server-side or persisted data. The "data model" is the **session-scoped client state** held in the `Viewer` module closure plus the **read-only material data** carried by GLB files. Validation rules below come directly from the spec's FRs.

---

## Entity: LightingSettings (session state, in-memory)

Held in `js/viewer.js` module closure. Defaults applied once at viewer start (page load); preserved across model switches within the session (FR-004); reset by page reload (spec Assumption: v1 is session-only, no storage).

| Field | Type | Range | Default | Validation / Rules | Source FR |
|-------|------|-------|---------|--------------------|-----------|
| `ambientIntensity` | integer (UI) → float (scene) | UI 0–100, mapped `/100` to scene 0.0–1.0 | `50` (scene 0.5) | Changes apply live while dragging; no page/model reload (FR-003). White light color — no color cast (R1). | FR-001…FR-004 |
| `isLightEnabled` | boolean | `true` / `false` | `true` | Main light off ⇒ its shadows are gone (no shadows without directional light) (US2-A3). | FR-006 |
| `lightIntensity` | integer (UI percent) | 0–100 → scene 0.0–1.0 | `100` | Existing field — unchanged behavior. | existing |
| `lightAzimuth` | integer (degrees) | 0–360 | `45` | Existing field — moving light moves shadows (FR-006). | existing |
| `lightElevation` | integer (degrees) | 0–90 | `45` | Existing field — moving light moves shadows (FR-006). | existing |
| `shadowsEnabled` | boolean | `true` / `false` | `true` | Toggle affects **shadow rendering only** — never modifies ambient/main light values (clarified 2026-10-20, US2-A4). | FR-011 |
| `shadowMapSize` | integer | `1024` desktop / `512` when `window.innerWidth < 768` | decided at init | Constant for the session (no dynamic resizing — R2/R8). | SC-004 |

### State transitions (LightingSettings)

```text
PAGE LOAD ──► defaults applied (ambient 50, shadows ON, main light ON @ 100%, H45/V45)
   │
   ├─ user drags ambient slider ──► ambientIntensity updates live (0…100)
   ├─ user toggles Shadows ───────► shadowsEnabled flips; lights unchanged
   ├─ user toggles main light ────► isLightEnabled flips; shadows follow light (FR-006)
   ├─ user moves H/V sliders ─────► lightAzimuth/Elevation update; shadows shift (FR-006)
   │
   ├─ MODEL SWITCH (carousel click) ──► settings PRESERVED (US1-A4 / FR-004)
   │        └─ per-mesh castShadow/receiveShadow flags re-applied to new model (R2)
   │
   └─ PAGE RELOAD ──► back to defaults (v1: no persistence)
```

## Entity: ShadowBinding (per-mesh derived state, on model load)

Applied by traversal inside `loadModel` to every mesh of the loaded GLB. Derived, not stored separately — lives on the Three.js mesh objects for the model's lifetime.

| Attribute | Value | Rule | Source FR |
|-----------|-------|------|-----------|
| `mesh.castShadow` | `true` | Every mesh of the model — protrusions cast onto other model surfaces (model's own surfaces only; **no floor exists** — clarification 2026-10-20) | FR-005 |
| `mesh.receiveShadow` | `true` | Every mesh of the model — surfaces receive shadows from other parts | FR-005 |
| (lights embedded in GLB) | `intensity = 0`, `visible = false` | Existing RN6 behavior — unchanged | existing |

Global shadow params (constant, decided in `init`): `shadowMap.type = PCFSoftShadowMap`, shadow camera ortho ±4 units (model normalized to 3 units), `bias = -0.0005`, `normalBias = 0.02`.

## Entity: MaterialAppearance (read-only, from GLB)

Defined by the model file itself; the viewer renders it faithfully and never modifies files (spec Key Entities).

| Attribute | Type | Viewer behavior | Source FR |
|-----------|------|-----------------|-----------|
| `color` | color | Rendered as authored; affects derived gray/emissive materials as today | FR-007, FR-008 |
| `map` (texture) | image | Rendered as authored; sRGB-encoded (part of color pipeline, R3) | FR-007 |
| `roughness` | float 0–1 | **Rendered faithfully against the scene environment** — rough ⇒ matte, polished ⇒ reflective highlights that move with view/light (US3-A1/A2). Missing in file ⇒ GLB/Three.js default applies (US3-A3 edge case) | FR-007 |
| `metalness` | float 0–1 | **Rendered faithfully against the scene environment** — metallic surfaces reflect the environment instead of appearing flat/black (root-cause fix, R3) | FR-007 |

Derived display-mode materials (existing code paths, unchanged rules):
- *Gray mode* `MeshStandardMaterial`: inherits `roughness`/`metalness` from original; picks up `scene.environment` automatically.
- *Emissive mode* `MeshBasicMaterial`: unlit — intentionally unaffected by lights and shadows (spec edge case).
- *Wireframe overlay* `LineBasicMaterial`: lines are not shadow receivers; underlying lit mesh still shows shadows.

## Entity: SceneEnvironment (derived cache, built once at init)

| Attribute | Value | Rule | Source FR |
|-----------|-------|------|-----------|
| `scene.environment` | prefiltered PMREM texture of `RoomEnvironment` | Built exactly once at startup (one-time ~10-50 ms cost); applied scene-wide so every `MeshStandardMaterial` gets correct PBR response | FR-007, SC-004 |
| `renderer.outputEncoding` | sRGB | Constant — matches Blender-style display transform | FR-007 |
| `renderer.toneMapping` | ACES Filmic, exposure 1.0 | Constant — no user control (tone-mapping controls are out of scope per spec Assumptions) | FR-007 |
