# Phase 0 Research: Realistic Lighting, Shadows & Material Rendering

**Feature**: 002-lighting-shadows-materials | **Date**: 2026-10-20 | **Stack**: Three.js r128 (CDN, no build) on plain PHP/HTML/CSS/JS

All technical unknowns extracted from the plan's Technical Context are resolved below. Each decision uses: Decision / Rationale / Alternatives considered.

---

## R1. Ambient light implementation and slider mapping

**Decision**: Keep the existing `THREE.AmbientLight` and convert it to state-driven: color `0xffffff`, `intensity = sliderValue / 100` (range 0.0–1.0), default slider value **50** → intensity 0.5. Expose `Viewer.setAmbientIntensity(value)` (0-100 integer). The light object persists across model loads (session state lives in the `Viewer` module closure, not in localStorage — v1 is session-only per spec).

**Rationale**: The current scene already contains `AmbientLight(0x404040, 0.3)` — a fixed dim gray that is a root cause of the "model too dark" complaint. White color at scaled intensity avoids a double-darkening (gray color × low intensity) and any color cast; `/100` mapping is identical to the existing "Intensity" slider convention (`value / 100` already used in `setLightIntensity`), keeping the UI predictable and consistent (FR-002).

**Alternatives considered**:
- *Gamma/perceptual curve mapping (e.g., pow(value/100, 2.2))*: rejected — inconsistent with the existing intensity slider, and "uniformly brighter at 100" (US1-A3) is easier to verify linearly by non-technical testers.
- *Keeping color 0x404040 and only varying intensity*: rejected — caps effective brightness at ~20% of a white equivalent, making the 0-100 range mostly useless.
- *Recreating the ambient light per slider change*: rejected — allocating lights per input event risks leaks; mutating intensity is sufficient and cheap.

## R2. Shadow pipeline (main directional light → model's own surfaces only)

**Decision**:
- `renderer.shadowMap.enabled = true`, `renderer.shadowMap.type = THREE.PCFSoftShadowMap` (set once in `init`).
- `directionalLight.castShadow = true` with shadow camera sized to the normalized model: model is always scaled to fit a 3-unit bounding box (existing behavior), so an orthographic shadow frustum of **±4 units** with `near 0.1 / far 40` (light at radius 10) covers it from any azimuth/elevation. `shadow.mapSize` = **1024×1024** desktop, **512×512** when `window.innerWidth < 768` (mobile heuristic, decided at init).
- Anti-acne tuning: `shadow.bias = -0.0005`, `shadow.normalBias = 0.02` (both exist in r128).
- Per-model traversal in `loadModel`: every `child.isMesh` gets `castShadow = true` and `receiveShadow = true` (self-shadowing of protrusions onto other model surfaces — exactly the "model's own surfaces, no floor" clarification of 2026-10-20). Embedded lights stay disabled (existing RN6 behavior).
- **Toggle** (`FR-011`): shadows off = `directionalLight.castShadow = false` (the global `renderer.shadowMap.enabled` stays true). If toggling per-light does not visually remove shadows on the first click in r128, the documented fallback is to also toggle `renderer.shadowMap.enabled` and force `material.needsUpdate = true` on every model material (verified-safe full recompile path). Validation scenario V4 in quickstart.md covers this on the first implementation pass.

**Rationale**: PCFSoft is the softest shadow filter available without extra passes — shadows on a product viewer should not have hard aliased edges, and the cost is a single extra render per frame of the directional light only. ±4 frustum with a normalized model means **no per-model shadow camera recalculation** is ever needed. `castShadow` per-light is the cheapest live toggle because light-count changes invalidate Three.js's program cache key automatically.

**Alternatives considered**:
- *Shadow-catching ground plane (THREE.ShadowMaterial)*: rejected — explicitly ruled out by the 2026-10-20 clarification (no floor added).
- *VSM (Variance) shadow maps*: rejected — larger GPU cost and light-bleeding artifacts on thin geometry (spec edge case: thin/overlapping geometry must not be distracting).
- *2048 shadow map*: rejected for v1 — halves mobile fill-rate headroom; 1024 + PCFSoft is proportionate for a 3-unit normalized model and honors SC-004 (fluid rotation on mobile). Revisit only if V-scenarios show blur beyond SC-002's "visible shadow" bar.
- *Blob/fake shadows (darkened decal)*: rejected — cannot respond to light position (FR-006).

## R3. Fixing "flat metal": environment map + color pipeline

**Decision** (three coordinated parts, all in `init`):
1. **Environment map**: build once — `const pmrem = new THREE.PMREMGenerator(renderer)` (r128), `const envRT = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04)`, then `scene.environment = envRT.texture`. `RoomEnvironment` comes from the same pinned CDN: `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js` (verified live: exposes `THREE.RoomEnvironment`, no module system). Call `pmrem.dispose()` after prefiltering. `scene.environment` applies to every `MeshStandardMaterial` automatically — including the gray-mode material created in `toggleTexture` — so authored `roughness`/`metalness` from the GLB finally produce correct glossy/matte response (FR-007).
2. **Color pipeline**: `renderer.outputEncoding = THREE.sRGBEncoding` and `renderer.toneMapping = THREE.ACESFilmicToneMapping`, `renderer.toneMappingExposure = 1.0` (both exist in r128). This matches Blender's filmic-ish display transform — the second cause of "flat/washed" look (linear output + no tone curve).
3. **No material rewriting**: GLB materials keep their authored color/texture/roughness/metalness untouched (FR-007 "renders faithfully and never modifies the files"). Models without finish data fall back to the GLB-specified defaults, satisfying the US3-A3 edge case.

**Rationale**: The "flat, plastic-like metal vs Blender" gap has two known root causes in a WebGL viewer without env lighting: (a) metallic materials have no diffuse term — without an environment to reflect they render near-black/flat; (b) linear output encoding + no tone mapping flattens highlights. Fixing both closes SC-003 (side-by-side Blender comparison). One-time PMREM prefilter costs ~tens of ms at startup — well inside the 5 s budget (SC-004).

**Alternatives considered**:
- *Increase number/intensity of direct lights*: rejected — adds no specular environment for metals; blows out with ambient slider.
- *Hand-authored equirect HDR texture asset*: rejected — new binary asset in repo and an extra network fetch; RoomEnvironment is procedurally generated, zero assets, same CDN pin as existing scripts.
- *Custom procedural room (hand-rolled emissive boxes)*: retained as **fallback** if the CDN script ever 404s (it does not today, verified 2026-10-20) — ~30 lines reusing `PMREMGenerator.fromScene`; documented here so no new research is needed.
- *`THREE.MeshPhysicalMaterial` conversion*: rejected — rewrites authored materials (violates FR-007) and r128 clearcoat is expensive.

## R4. Compatibility with existing display modes (FR-008)

**Decision**: No changes needed beyond what R2/R3 already provide — verified against `viewer.js` behavior:
- *Gray/texture mode*: its `MeshStandardMaterial` inherits `roughness`/`metalness` from the original and picks up `scene.environment` automatically → consistent.
- *Emissive mode*: `MeshBasicMaterial` is unlit → intentionally unaffected by lights/shadows (spec edge case).
- *Wireframe overlay*: `LineBasicMaterial` on `LineSegments` — lines do not receive shadow lookups; the underlying lit mesh still shows shadows. No special handling.
- *Reset camera / zoom / light position*: untouched code paths.

**Rationale**: The spec's FR-008 and SC-005 forbid regressions; the env-map approach was partly chosen because it is scene-global instead of per-material, which by construction cannot break the toggle/restore logic that swaps materials by `originalMaterials` map.

## R5. Thumbnails (out of scope, decision recorded)

**Decision**: `generateThumbnail` keeps its own minimal lighting (ambient + one directional, no shadows, no env map). No changes.

**Rationale**: The spec is silent on thumbnails and SC-001…SC-005 never reference them; the constitution forbids out-of-spec work (YAGNI). Consequence: carousel thumbnails may look slightly darker than the main view — decorative only, accepted trade-off.

## R6. Session persistence semantics (FR-004, spec clarification)

**Decision**: All lighting state (`ambient 0-100`, `shadows on/off`, existing light intensity/position) lives in `Viewer` module-level variables. Defaults are applied once at `init` (page load); `loadModel` explicitly does **not** reset them (per US1-A4 — persist across model switches); a page reload naturally resets everything (Assumption: session-only, no localStorage).

**Rationale**: Matches the clarified FR-004 exactly ("when the viewer starts … preserved when switching models within the same session"); localStorage would violate the v1 out-of-scope list (no persistent user settings).

## R7. UI placement and accessibility

**Decision**: Inside the existing "Lighting" control group in `index.php`: the Ambient Light slider reuses the established `.slider-group` pattern (`label` + live value `<span>` + `input[type=range]`, id `light-ambient`, min 0 / max 100 / value 50, placed directly after the existing Intensity slider); the Shadows control reuses the `.control-btn` pattern as a toggle button (id `btn-shadows`, label "Shadows", `aria-pressed` reflecting state, `.active` class by default since it starts ON). Mobile: the panel already collapses via the existing hamburger mechanism — no new responsive work.

**Rationale**: Reusing two existing, proven control patterns keeps CSS additions to a few lines in `style.css` (Simplicity gate) and inherits desktop/mobile behavior for free. `aria-pressed` on the toggle exceeds the current baseline without new scope (no new a11y surface).

## R8. Performance budget validation (SC-004, ≤5 s load)

**Decision**: Bounded GPU costs only — one-time PMREM prefilter at startup (~10-50 ms typical); one shadow-map render pass per frame of a single directional light at ≤1024²; existing `pixelRatio ≤ 2` cap retained; no per-frame allocations added (shadow camera is static). `renderer.info` sanity check available during validation.

**Rationale**: Constitution hard-requires ≤5 s model load verifiable with a stopwatch; the additions scale with resolution caps, not model size, and the model itself is already normalized to 3 units so the shadow frustum is constant-cost.

**Alternatives considered**: dynamic shadow-map resizing per model — rejected as unnecessary complexity (constant frustum already covers every normalized model).
