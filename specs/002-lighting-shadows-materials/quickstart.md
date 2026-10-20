# Quickstart Validation Guide: Realistic Lighting, Shadows & Material Rendering

**Feature**: 002-lighting-shadows-materials | **Date**: 2026-10-20

Run-and-verify guide proving the feature works end-to-end. Contract details live in [contracts/ui-contract.md](contracts/ui-contract.md); state rules in [data-model.md](data-model.md). No implementation code here — this is the validation/run script for the implementation and review phases.

---

## Prerequisites

- PHP CLI available locally (the app is PHP + static files; hosting is shared — no Node/build allowed by constitution).
- At least one `.glb` model in `release/modelos/` with (ideally) rough/metallic materials; the app auto-selects the first model.
- A modern desktop browser; a phone or responsive mode (DevTools) for the mobile checks.

## Setup

```powershell
# from repository root
php -S localhost:8000 -t release
```

Open `http://localhost:8000`. The first model in the carousel loads automatically.

## Validation scenarios

Each scenario maps to spec acceptance criteria. All UI labels below are the English strings the app must show.

### V1 — Ambient light brightens a dark model in real time (FR-001…FR-003, SC-001)

1. Locate the **Ambient Light** slider in the Lighting group (shows `50`).
2. Drag it up to `100` and back down to `0`.
- **PASS**: the whole model — including areas facing away from the main light — visibly brightens/darkens *while dragging*; no reload spinner appears; the value updates live next to the slider.
- **PASS (FR-013 keyboard)**: focus the slider with `Tab` and adjust with arrow keys → same live brightness change and value update as with the mouse.
- **SC-001 stopwatch check**: from a "too dark" impression to "clearly visible" takes under 10 seconds of user action.

### V2 — Ambient extremes (US1-A2, US1-A3, edge cases)

1. Set Ambient Light to `0` → **PASS**: scene lit only by the main light, strong light/shadow contrast (model still visible).
2. Set Ambient Light to `100` → **PASS**: model uniformly and clearly lit, no part lost in darkness.
3. With ambient `0`, toggle the main **light** button off → **PASS**: model appears as a dark silhouette, but all controls remain clickable; turning the light back on restores visibility (edge case satisfied).

### V3 — Shadows on the model's own surfaces, following the light (FR-005, FR-006, SC-002)

1. Load a model with protrusions/overlapping parts; keep Shadows on (default).
2. Set Position H to `45`, Position V to `45`; then try other H values (e.g. `180`, `300`).
- **PASS**: protruding parts visibly darken surfaces behind/below them (**no floor plane exists or receives shadows** — clarification 2026-10-20).
- **PASS (SC-002)**: each of 3 testers can point at ≥1 clear shadow, and the shadow shifts when H/V change; toggling the main light off removes shadows, on restores them.

### V4 — Shadow on/off switch semantics (FR-011, US2-A4)

1. With shadows visible, click the **Shadows** button (starts active/ON).
- **PASS**: shadows disappear immediately; ambient value, intensity, position and light on/off state are all untouched (lighting brightness does not change).
- **PASS**: clicking **Shadows** again restores the shadows.
- **PASS**: the button visibly reflects state (active styling + `aria-pressed`).
- **PASS (FR-013 keyboard/AT)**: focus **Shadows** with `Tab`, activate with `Enter`/`Space` → toggles exactly like a click; `aria-pressed` flips so a screen reader announces the new state; lighting settings remain unchanged.

### V5 — Faithful materials: rough metal looks rough (FR-007, US3-A1/A2, SC-003)

1. Load the model with metallic/rough surfaces (no external reference render needed).
2. Rotate the view around a metal part and/or move the light; compare rough and polished surfaces against each other.
- **PASS**: rough/matte metal shows shading variation and a rough finish (not flat uniform paint); polished metal shows highlights/reflections that move with view/light.
- **SC-003**: 3 of 3 testers, judging by direct inspection (no reference render), agree rough metal reads as rough (no sharp mirror-like reflections) and polished metal shows moving highlights — "real metal", not "flat/plastic".
- **PASS (US3-A3)**: a model *without* finish data renders with its authored material as-is (no invented finish), does not look worse than before, and shows no errors.

### V6 — Performance and no regressions (FR-008, FR-010, SC-004, SC-005)

1. Hard-reload the page with a stopwatch: model viewable in ≤5 s.
2. Rotate/zoom continuously for ~15 s (desktop and mobile/responsive mode) with a stopwatch running: **PASS (SC-004)**: no visible stutter or freezing (eye judgment — no dev tools needed).
   - Optional technical check for FR-010's FPS budget: with a standard FPS meter, ≥60 FPS desktop / ≥30 FPS mobile during the rotation.
3. Toggle every existing feature once: wireframe, texture (gray), emissive, light on/off, Intensity, Position H/V, Zoom, reset — then switch models via the carousel twice.
- **PASS**: all existing features work as before; ambient level and shadow switch state are **preserved** across model switches (FR-004); emissive mode is unaffected by lighting (edge case).
4. Mobile (window < 768px): open the hamburger menu, adjust Ambient Light, toggle **Shadows** — **PASS**: panel usable and fluid; **Shadows** touch target is comfortably tappable (≥44×44px); the control panel scrolls vertically only — **no horizontal scrolling** (FR-014).

### V7 — Session persistence semantics (FR-004)

1. Change Ambient Light to e.g. `80` and switch models → **PASS**: new model keeps `80`.
2. Reload the page → **PASS**: Ambient Light is back to `50`, Shadows ON (v1 session-only, no storage).

## Existing project test

```powershell
php -S localhost:8000 -t release
# then open in browser:
http://localhost:8000/tests/test_models.php
```

**PASS**: model-listing API reports the `.glb` files in `modelos/` (unchanged behavior).

## Expected outcome

All scenarios V1–V7 pass ⇒ every functional requirement FR-001…FR-014 and success criteria SC-001…SC-005 are demonstrably satisfied in the running app, verifiable by a non-technical reviewer with no code inspection.
