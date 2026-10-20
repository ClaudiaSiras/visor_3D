# Tasks: Realistic Lighting, Shadows & Material Rendering

**Input**: Design documents from `/specs/002-lighting-shadows-materials/`

**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (user stories), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui-contract.md](contracts/ui-contract.md), [quickstart.md](quickstart.md)

**Tests**: NOT included — not requested by the spec, and the constitution prohibits JS test frameworks/build tooling (no Node runtime). Manual validation tasks map to quickstart.md scenarios instead.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Per [plan.md](plan.md) "Source Code" section — single web app under `release/`:

```text
release/
├── index.php        # control panel markup + CDN scripts (MODIFY)
├── css/style.css    # control styles (MODIFY, minimal)
├── js/viewer.js     # Three.js scene module (MODIFY, main work)
├── js/controls.js   # UI bindings (MODIFY)
├── js/app.js        # UNCHANGED
├── api/models.php   # UNCHANGED
└── modelos/         # user-supplied .glb models for validation
```

**Cross-story file note**: US1 and US2 both add markup to `release/index.php`; if stories are worked in parallel, coordinate edits to that file (or run the two markup tasks sequentially).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the local validation loop and shared CDN dependency

- [ ] T001 Run the app baseline locally with `php -S localhost:8000 -t release`, load the first model, and note the current (dark, shadow-less, flat-material) appearance plus working controls — this is the SC-005 no-regression reference
- [ ] T002 [P] Add the verified RoomEnvironment CDN script `<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js"></script>` after the existing three.js scripts in release/index.php (research R3; consumed by US3, harmless until then)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared `LightingSettings` session state (data-model.md) that US1 and US2 both build on

**?? CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Add the `LightingSettings` module-state block to release/js/viewer.js: `ambientIntensity = 50` and `shadowsEnabled = true` module variables (page-load defaults per data-model.md). CRITICAL semantics (FR-004): these are applied once at `init` and `loadModel` MUST NOT reset them (settings persist across model switches; page reload resets)

**Checkpoint**: Shared lighting state exists — US1, US2 and US3 can now proceed

---

## Phase 3: User Story 1 - Ambient light control (Priority: P1) ?? MVP

**Goal**: User brightens/darkens the whole model live with a new "Ambient Light" slider (0-100, default 50) so a dark model becomes clearly visible

**Independent Test**: Load any model, drag the Ambient Light slider 0→100→0 — overall brightness (including areas facing away from the main light) changes while dragging, no reload; value displays live; setting persists across model switches and resets to 50 on page reload (quickstart V1, V2, V7)

### Implementation for User Story 1

- [ ] T004 [P] [US1] Add the Ambient Light slider markup to the Lighting control group in release/index.php per contracts/ui-contract.md: label `Ambient Light: <span id="light-ambient-val">50</span>%` + `<input type="range" id="light-ambient" min="0" max="100" value="50">`, placed directly after the existing Intensity slider (English label only, FR-009)
- [ ] T005 [US1] Convert the fixed `AmbientLight(0x404040, 0.3)` in release/js/viewer.js to a state-driven white ambient light (`0xffffff`, intensity = `ambientIntensity / 100`) and implement `Viewer.setAmbientIntensity(value)` per research R1: clamp to 0-100, update scene intensity live, never reload page or model (FR-001, FR-002, FR-003; uses `ambientIntensity` from T003)
- [ ] T006 [US1] Bind the ambient slider in release/js/controls.js per the existing `light-intensity` pattern: `input` event updates `#light-ambient-val` text and calls `Viewer.setAmbientIntensity(value)` (depends on T004, T005)
- [ ] T007 [US1] Validate quickstart scenarios V1, V2 and V7 in the browser (real-time brightness, extremes 0 and 100, ambient-0 + light-off silhouette edge case, persistence across model switch, reset on reload)

**Checkpoint**: User Story 1 fully functional — dark models are fixable with one slider (deliverable MVP)

---

## Phase 4: User Story 2 - Shadows cast by the main light (Priority: P2)

**Goal**: Main directional light casts soft shadows on the model's own surfaces (no floor), with a Shadows on/off switch (default ON) that changes only shadow rendering

**Independent Test**: Load a model with protrusions, angle the light (H/V) — shadows appear on the model's surfaces and shift with light position; the Shadows button removes/restores shadows without altering brightness; main-light off removes shadows (quickstart V3, V4)

### Implementation for User Story 2

- [ ] T008 [P] [US2] Add the Shadows toggle button to the Lighting control group in release/index.php per contracts/ui-contract.md: `<button id="btn-shadows" class="control-btn active" aria-pressed="true">Shadows</button>` (label "Shadows", default ON state visible)
- [ ] T009 [P] [US2] Confirm the existing `.control-btn`, `.control-btn.active` and `:focus` styles in release/css/style.css render #btn-shadows correctly on desktop and mobile; add only missing styles if a gap is found (research R7 — reuse existing patterns, minimal CSS)
- [ ] T010 [US2] Enable the shadow pipeline in `Viewer.init` in release/js/viewer.js per research R2: `renderer.shadowMap.enabled = true`, `type = PCFSoftShadowMap`, `directionalLight.castShadow = true`, orthographic shadow frustum ±4 units (model normalized to 3), `mapSize` 1024x1024 desktop / 512x512 when `window.innerWidth < 768`, `bias = -0.0005`, `normalBias = 0.02`
- [ ] T011 [US2] Extend the model-load traversal in release/js/viewer.js `loadModel` so every mesh gets `castShadow = true` and `receiveShadow = true` (FR-005: model's own surfaces only, no floor added; keep embedded GLB lights disabled as today)
- [ ] T012 [US2] Implement `Viewer.setShadowsEnabled(enabled)` in release/js/viewer.js per FR-011 and research R2: toggle `directionalLight.castShadow` only (store `shadowsEnabled` from T003); MUST NOT modify ambient, intensity, position or main-light on/off; documented fallback if per-light toggle leaves artifacts on first click: also toggle `renderer.shadowMap.enabled` and set `material.needsUpdate = true` on model materials
- [ ] T013 [US2] Bind the Shadows button in release/js/controls.js: click toggles `Viewer.setShadowsEnabled(...)`, syncs `.active` class and `aria-pressed` attribute (US2-A4), following the existing `btn-light` pattern (depends on T008, T012)
- [ ] T014 [US2] Validate quickstart scenarios V3 and V4 in the browser (shadows on protrusions following H/V, light-off removes shadows, toggle semantics with lighting untouched, state preserved across model switches)

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Faithful material appearance (Priority: P3)

**Goal**: Rough metal looks rough and polished metal reflects (Blender-like) via scene environment + proper color pipeline; authored material data untouched

**Independent Test**: Side-by-side against the model's own finishes (no external reference) — rough/matte metal shows a rough finish, polished metal shows moving highlights/reflections; a model without finish data renders sensibly (quickstart V5)

### Implementation for User Story 3

- [ ] T015 [US3] Build the scene environment exactly once in `Viewer.init` in release/js/viewer.js per research R3: `PMREMGenerator` + `new THREE.RoomEnvironment()` (guarded — if the CDN script from T002 is unavailable, log a warning and continue without environment), `scene.environment = prefiltered texture`, then dispose the PMREM generator
- [ ] T016 [US3] Configure the color pipeline in `Viewer.init` in release/js/viewer.js per research R3: `renderer.outputEncoding = THREE.sRGBEncoding`, `renderer.toneMapping = THREE.ACESFilmicToneMapping`, `renderer.toneMappingExposure = 1.0` (r128 API). Do NOT modify any GLB material — authored roughness/metalness must render as-is (FR-007); thumbnails in `generateThumbnail` stay unchanged (research R5)
- [ ] T017 [US3] Validate quickstart scenario V5 plus the display-mode compatibility slice of V6 (rough vs polished metal judged by direct visual inspection per revised SC-003 — no Blender reference required; no-finish-data model OK, gray/emissive/wireframe modes still behave, emissive remains unlit)

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and constitution compliance sweeps

- [ ] T018 [P] Run the complete quickstart.md validation matrix V1-V7 on desktop and mobile/responsive mode (php dev server), fix any regressions found, and confirm the 5-second model-load budget with a stopwatch (SC-004)
- [ ] T019 [P] Sweep every new user-visible string in release/index.php and release/js/ for English-only compliance (FR-009): "Ambient Light", "Shadows" and any value units
- [ ] T020 [P] Re-verify the constitution gates on the final result: no build/Node/DB introduced, UI responsive, models still load only from release/modelos/, and each SC-001..SC-005 demonstrable without reading code
- [ ] T021 [P] Perform an FR-001..FR-014 conformance pass against the implemented behavior using quickstart.md as the script and record results for the reviewer (who owns checklists/requirements.md and checklists/quality.md checkbox state)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — starts immediately (T001 and T002 parallel)
- **Foundational (Phase 2)**: Depends on nothing from Phase 1 code-wise, but should follow T001 baseline; BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (T003)
  - Recommended order: US1 (P1, MVP) → US2 (P2) → US3 (P3)
  - US2 and US3 are independent of US1 in behavior but share `release/js/viewer.js` and `release/index.php` with it — coordinate or run sequentially
- **Polish (Phase 6)**: Depends on all desired stories complete (T018-T021 need the implemented behavior)

### User Story Dependencies

- **User Story 1 (P1)**: Needs T003 only — no dependencies on US2/US3
- **User Story 2 (P2)**: Needs T003 only — shadows work with or without US1/US3
- **User Story 3 (P3)**: Needs T002 (CDN script) and T003 — env map is orthogonal to US1/US2

### Within Each User Story

- Markup (index.php) and scene logic (viewer.js) can be built in parallel where marked
- Bindings (controls.js) come after both markup and API exist
- Validation task always last in the story

### Parallel Opportunities

- **Phase 1**: T001 + T002 (independent)
- **US1**: T004 (index.php) + T005 (viewer.js) in parallel; T006 after both
- **US2**: T008 (index.php) + T009 (style.css) + T010/T011/T012 (viewer.js, sequential among themselves) — the three tracks parallel; T013 after T008+T012; T014 last
- **Polish**: T018-T021 all independent of each other (different focus areas)
- **Cross-story**: with multiple implementers, US2 and US3 can proceed simultaneously after US1 (different primary files: US2 centers on shadow config, US3 on env/color pipeline — both in viewer.js, so serialize edits there)

---

## Parallel Example: User Story 2

```text
# Launch together (different files):
Task T008: "Add Shadows toggle button to Lighting group in release/index.php"
Task T009: "Confirm/add .control-btn styles in release/css/style.css"

# Then the viewer.js track (sequential, same file):
Task T010: "Enable shadow pipeline in Viewer.init (release/js/viewer.js)"
Task T011: "Per-mesh shadow flags in loadModel traversal (release/js/viewer.js)"
Task T012: "Viewer.setShadowsEnabled in release/js/viewer.js"

# Then:
Task T013: "Bind Shadows button in release/js/controls.js"
Task T014: "Validate quickstart V3/V4"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (baseline + CDN tag)
2. Phase 2: Foundational (T003 — CRITICAL, blocks all stories)
3. Phase 3: User Story 1 (ambient slider)
4. **STOP and VALIDATE**: quickstart V1/V2/V7 — dark models now fixable with one slider
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add US1 → validate V1/V2/V7 → deliver (MVP!)
3. Add US2 → validate V3/V4 → deliver (shadows + switch)
4. Add US3 → validate V5/V6 → deliver (Blender-like materials)
5. Polish → full V1-V7 + constitution sweep → release

### Notes

- [P] tasks = different files, no dependencies; same-file edits in `viewer.js` are always serialized
- Commit after each story phase or logical group on branch `002-lighting-shadows-materials`
- Stop at any checkpoint to validate that story independently
- The shadow-toggle fallback (T012) exists precisely so the implementer does not get stuck debugging r128 light-shadow toggling — try the cheap toggle first, escalate only if artifacts remain
