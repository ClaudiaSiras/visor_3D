# UI Contract: Realistic Lighting, Shadows & Material Rendering

**Feature**: 002-lighting-shadows-materials | **Date**: 2026-10-20

This project has no external network APIs of its own beyond the existing `api/models.php` (unchanged). The interfaces this feature exposes are: (1) the **DOM contract** between `index.php` and `controls.js`, and (2) the **`Viewer` public API** between `controls.js`/`app.js` and `viewer.js`. Both must remain stable for existing consumers (SC-005: no regressions).

---

## 1. DOM contract (`index.php` ↔ `controls.js`)

All new elements live in the existing `Lighting` control group. All labels in English (FR-009).

### New elements

| Element | id | Type | Attributes | Initial state |
|---------|----|------|------------|---------------|
| Ambient light slider | `light-ambient` | `input[type=range]` | `min="0" max="100" value="50"` | value `50` (FR-004) |
| Ambient live value | `light-ambient-val` | `span` | — | text `50` |
| Ambient label | — | `label` | `for="light-ambient"` | text: `Ambient Light: <span …>50</span>%` |
| Shadows toggle | `btn-shadows` | `button.control-btn` | `aria-pressed="true"` | text `Shadows`; class `control-btn active` (default ON, FR-011) |

### Placement rule

Ambient slider goes directly **after** the existing `Intensity` slider; the Shadows button goes directly **after** the existing `light` button (or after the V-position slider — final order chosen at implementation for visual grouping, contract only requires "inside the Lighting group").

### Existing elements — MUST remain unchanged (SC-005)

`btn-light`, `light-intensity`/`light-intensity-val`, `light-position-h`/`-v` (+vals), `btn-wireframe`, `btn-texture`, `btn-emissive`, `zoom-slider`/`zoom-val`, `btn-reset`, `mobile-menu-btn`, `control-panel`, `viewer-container`, `loading-indicator`, `error-message`, `empty-state`, `carousel`, `carousel-track`.

## 2. `Viewer` public API (`controls.js` → `viewer.js`)

### Added methods

```text
Viewer.setAmbientIntensity(value: integer 0–100)  → void
    Updates ambient light intensity live (scene intensity = value/100).
    Out-of-range values are clamped to 0–100. No reload of page or model (FR-003).

Viewer.setShadowsEnabled(enabled: boolean)        → void
    Turns cast shadows on/off immediately. MUST NOT change any light setting
    (ambient, intensity, position, main light on/off) — shadow rendering only (FR-011).
```

### Existing methods — MUST keep signature and behavior (SC-005)

```text
init(containerId), loadModel(filename) → Promise, toggleWireframe(), toggleTexture(),
toggleEmissive(), toggleLight(), setLightIntensity(v), setLightPosition(az, el),
resetCamera(), getZoomLevel(), setZoomLevel(level), generateThumbnail(filename) → Promise,
showLoading(show), showError(message)
```

### Behavioral addendum to `loadModel` (not a signature change)

After a model loads, the Viewer MUST apply `castShadow = true` and `receiveShadow = true` to every mesh (FR-005) and MUST preserve all current lighting settings (FR-004). Embedded GLB lights stay disabled (existing behavior).

## 3. Scene/renderer invariants (internal contract, observable via behavior)

| Invariant | Expected observable behavior |
|-----------|------------------------------|
| `scene.environment` set once at init | Rough/metal surfaces show reflections/highlights that move when rotating the view (US3-A2) — no visible pop-in after load |
| Output pipeline: sRGB + ACES tone mapping | Colors/highlights read as real metal — rough surfaces look rough, polished surfaces show moving highlights/reflections (SC-003, direct visual inspection) |
| Shadow frustum ±4 units, model normalized to 3 units | Shadows visible for every model at every light position without per-model tuning (US2-A1/A2) |
| PCFSoft shadow map, ≤1024² | Soft-edged shadows, no distracting noise on thin geometry (spec edge case); rotation stays fluid on mobile (SC-004) |
| Thumbnails (`generateThumbnail`) | Deliberately unchanged lighting (out of scope — R5); decorative only |

## 4. Contract tests (manual, mapped to quickstart scenarios)

| Contract surface | Verified by quickstart scenario |
|------------------|--------------------------------|
| `light-ambient` DOM + live update | V1, V2 |
| `btn-shadows` DOM + toggle semantics | V4 |
| `setAmbientIntensity` / `setShadowsEnabled` API | V1, V2, V4 |
| `loadModel` shadow traversal + settings preservation | V3, V5 |
| Scene environment + color pipeline | V5 |
| No regressions on existing contract | V6 |
