# Feature Specification: Realistic Lighting, Shadows & Material Rendering

**Feature Branch**: `002-lighting-shadows-materials`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "bien, haremos unos cambios al visualizador. Primero agrega una luz ambiente dado que el modelo se ve demasiado oscuro. Esta luz ambiente debe tener tambien un slider para que vaya de 0 a 100. Por otro lado, la luz deberia proyectar sombra en los objetos. Ademas los materiales se ven planos, en blender por ejemplo al material de metal se ve rugoso, lo que no sucede con este visualizador y deberia."

## Clarifications

### Session 2026-10-20

- Q: Should the main light's shadows also appear on a floor surface beneath the model, or only on the model's own surfaces? → A: Only on the model's own surfaces; no floor is added.
- Q: Should users get an on/off switch for shadows, or should shadows always be on whenever the main light is on? → A: Add an on/off switch for shadows in the control panel.

### Session 2026-10-20 (spec-quality pass)

- Q: What do the lighting controls do when no model is loaded (empty state)? → A: They remain visible but disabled until a model is loaded; once a model is loaded, they become operable and apply the session settings.
- Q: When do lighting settings reset? → A: Only on page reload. The chosen level and switch states persist when switching models within the same session (confirms FR-004).
- Q: What do the ambient slider extremes mean exactly? → A: 0 = the ambient light contributes nothing (only the main light illuminates the model); 100 = full practical ambient intensity, making the model uniformly and clearly lit without washing it out. Intermediate values scale proportionally between those two points.
- Q: Does the provisional default ambient value of 50 stand? → A: Confirmed as an official requirement (no longer provisional).
- Q: What is the exact visible label of the shadow switch? → A: "Shadows".
- Q: How is "immediately" in the shadow-switch requirement bounded? → A: The shadow change is visible on the very next rendered frame after the toggle; there is no transition animation.
- Q: What happens to shadows while the emissive (unlit) display mode is active? → A: Shadows are not visible in emissive mode. This is expected behavior (emissive ignores all lighting), and shadows return when the user leaves emissive mode.
- Q: Is a recovery mechanism required when ambient is 0 and the main light is off (model invisible)? → A: No special mechanism. Self-recovery — moving the ambient slider or turning the main light back on — is sufficient; this combination is expected behavior, not an error state.
- Q: What accessibility requirements apply to the new controls beyond English labeling? → A: The new controls must be operable by keyboard alone, and the shadow switch's current state must be programmatically exposed so assistive technologies can announce it.
- Q: Who provides the Blender reference render for the material-realism criterion? → A: No external reference render is required. Material realism is judged by direct visual inspection (revised SC-003), removing the external dependency.
- Q: What is required of a model that carries no surface-finish data? → A: It must render with its authored material as-is and must not look worse than before this feature. No invented default finish is applied (confirms the existing fallback).
- Q: Both the main-light switch and the shadow switch can make shadows disappear — is that a conflict? → A: No. They are distinct documented behaviors: the main light off removes the shadow source (and changes all lighting); the "Shadows" switch off removes only shadow rendering, leaving all lighting untouched (FR-011).
- Q: The spec says no Blender reference render is required, but quickstart.md, tasks.md, plan.md and contracts/ui-contract.md still treat it as a REQUIRED validation prerequisite — which is the source of truth? → A: The spec is authoritative. Supporting validation documents MUST be aligned to remove the Blender-reference prerequisite; SC-003 is validated by direct visual inspection.
- Q: US3 acceptance scenario 3 says a model with no finish data "renders with a sensible default appearance", conflicting with the clarification that no default finish may be invented — which requirement stands? → A: Option A: rewrite scenario 3 to require the authored material as-is (no invented finish), no worse than before, no errors — consistent with FR-007.
- Q: SC-004 requires an FPS meter, which conflicts with the constitution's ban on success criteria needing dev tools — how should performance be verified? → A: Option A (split): SC-004 stays non-technical (stopwatch for the 5 s load + eye-judged "no visible stutter/freezing" during ~15 s of rotation); FR-010 keeps the ≥60/≥30 FPS numbers as technical targets measured with a standard FPS meter.
- Q: FR-013 (keyboard + assistive-technology operation) has no acceptance scenario or quickstart step — should formal coverage be added? → A: Option A: add acceptance scenarios in the spec (keyboard-adjusted ambient slider; keyboard-toggled "Shadows" with announced state) plus matching quickstart validation steps.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ambient light control (Priority: P1)

A user opens the 3D viewer and loads a model that currently looks too dark. Using a new "Ambient Light" slider in the control panel (ranging from 0 to 100), the user raises the ambient light and the whole model becomes visibly brighter — including areas that the main directional light does not reach. Dragging the slider down darkens the scene again, and the current value is shown next to the slider.

**Why this priority**: The darkness of the model is the primary complaint and blocks basic inspection of the model. A controllable ambient light is the most direct fix and is independently valuable on its own.

**Independent Test**: Can be fully tested by loading any model and dragging the new Ambient Light slider from 0 to 100 — the model's overall brightness must change in real time, without reloading the page or the model.

**Acceptance Scenarios**:

1. **Given** a model is loaded in the viewer, **When** the user drags the Ambient Light slider from its default to a higher value, **Then** the entire model (including shadowed/back-facing areas) becomes visibly brighter while the slider is being dragged.
2. **Given** a model is loaded, **When** the user sets the Ambient Light slider to 0, **Then** the scene is lit only by the existing main light, producing strong light/shadow contrast.
3. **Given** a model is loaded, **When** the user sets the Ambient Light slider to 100, **Then** the model is uniformly and clearly lit with no part of it lost in darkness.
4. **Given** the user has moved the Ambient Light slider, **When** the user loads a different model, **Then** the chosen ambient light level persists for the new model within the same session.
5. **Given** no model is loaded, **When** the user looks at the control panel, **Then** the lighting controls are visible but disabled, and **when a model is loaded** they become operable.
6. **Given** a model is loaded with all lighting controls untouched (ambient 50, Shadows ON, main light at defaults), **When** the user inspects the model without touching any new control, **Then** the model is clearly visible and the scene looks sensible out of the box.
7. **Given** a model is loaded, **When** the user focuses the Ambient Light slider with the keyboard and adjusts it (arrow keys), **Then** the brightness changes live exactly as when dragging, and the displayed value updates accordingly.

---

### User Story 2 - Shadows cast by the main light (Priority: P2)

A user inspecting a model wants depth cues: parts of the model that stick out (handles, protrusions, overlapping geometry) should cast visible shadows onto other parts of the model, so the shape reads correctly. Shadows respond to the existing light position controls.

**Why this priority**: Shadows greatly improve spatial understanding of the model, but they build on the lighting controls and are secondary to making the model visible at all.

**Independent Test**: Can be fully tested by loading a model with protruding or overlapping parts, positioning the main light at an angle, and observing that shadowed regions appear on the model's own surfaces and move when the light position changes.

**Acceptance Scenarios**:

1. **Given** a model with protruding or overlapping parts is loaded, **When** the main light is positioned at an angle to those parts, **Then** those parts cast a visible shadow onto the surfaces behind/below them.
2. **Given** shadows are visible on the model, **When** the user moves the light position controls (horizontal/vertical), **Then** the shadows shift in the corresponding direction on the model.
3. **Given** shadows are visible on the model, **When** the user turns the main light off, **Then** the cast shadows disappear (no shadows without a directional light), and they reappear when the light is turned back on.
4. **Given** shadows are visible on the model, **When** the user turns the shadow on/off switch off, **Then** the shadows disappear on the next rendered frame while the model's lighting (ambient and main light) stays unchanged, and the shadows reappear when the switch is turned back on.
5. **Given** shadows are visible with the main light on, **When** the user turns the main light off (leaving the "Shadows" switch on), **Then** the shadows disappear because their source is gone — distinct from using the "Shadows" switch, which only stops rendering shadows while lighting stays untouched.
6. **Given** a model is loaded, **When** a keyboard-only user focuses the "Shadows" button and activates it (Enter/Space), **Then** shadow rendering toggles exactly as with a pointer click, the pressed state flips in a way assistive technologies can announce, and all lighting settings (ambient, intensity, position, main light) remain unchanged.

---

### User Story 3 - Faithful material appearance (Priority: P3)

A user comparing the viewer with a reference render from Blender notices that surfaces (especially metal) look flat and plastic-like in the viewer. The viewer should render each surface with its authored roughness, so a rough/matte metal looks rough and textured — not like flat uniform paint.

**Why this priority**: Correct material appearance improves realism and trust in the viewer, but it is an enhancement on top of being able to see and light the model properly.

**Independent Test**: Can be fully tested by loading a model with metallic/rough materials and inspecting it directly in the viewer (no external reference render required): rough/matte metal must read as rough, polished metal must show reflections, judged side-by-side against the model's own rough and polished surfaces while rotating the view.

**Acceptance Scenarios**:

1. **Given** a model whose materials define rough/metallic surfaces, **When** the model is viewed under the main light, **Then** metallic surfaces show light variation across the surface (a rough, matte-metallic finish with visible shading detail) instead of a flat, uniform color.
2. **Given** a model with a polished/low-roughness metal material, **When** the user rotates the view or moves the light, **Then** highlights and reflections move across the surface consistent with a shiny metal finish.
3. **Given** a model whose materials carry no surface-finish information, **When** it is loaded, **Then** it renders with its authored material as-is (no invented default finish), must not look worse than before this feature, and shows no errors or visual glitches.

---

### Edge Cases

- **Ambient light at 0 with main light off**: The model may appear as a dark silhouette; the UI (controls, model list) must remain fully usable and the user must be able to restore lighting by moving either slider or toggling the light back on. This is expected behavior — no automatic recovery mechanism or warning is required.
- **Very high ambient light (near 100)**: Overall bright light naturally reduces shadow contrast; shadows may become softer but must remain discernible at default and moderate ambient levels (up to 50). This reduced contrast at high ambient is expected behavior, not a defect.
- **Models without shadow-casting geometry** (e.g., a single flat surface): No shadow change is visible; the viewer must not display errors or artifacts.
- **Thin or overlapping geometry**: Shadow artifacts (e.g., noisy self-shadowing on tiny features) must not be visually distracting. Acceptable threshold: no visible self-shadowing stripes ("acne") on flat surfaces at normal viewing distance, minor shadow loss on very thin features is tolerated, and no shadow flicker while rotating.
- **Combination with existing display modes**: Wireframe, gray/texture, and emissive modes keep working; emissive mode is intentionally unaffected by lighting changes and shadows are not visible while it is active (expected behavior).
- **Low-power mobile devices**: Enabling shadows must not make rotation/zoom fall below 30 FPS; if performance degrades, interaction must still complete without freezing.
- **No model loaded (empty state)**: Lighting controls are visible but disabled; they become operable when a model is loaded.
- **Ambient and shadow switch vs. main-light switch**: Both switches can make shadows disappear, for different reasons — the main light off removes the shadow source (and the main lighting), while the "Shadows" switch off removes only shadow rendering. Both behaviors are intentional and documented.
- **Model with embedded lights**: Embedded lights remain disabled (existing behavior); only the viewer's own lights illuminate the scene.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an ambient (all-direction) light that evenly brightens the loaded model, complementing the existing main directional light.
- **FR-002**: System MUST provide a control labeled "Ambient Light" that adjusts the ambient light level from 0 to 100, displaying the current value to the user, consistent with the existing light controls. The scale MUST mean: 0 = ambient contributes no light (only the main light illuminates), 100 = full practical ambient intensity (model uniformly and clearly lit without washing out), with intermediate values scaling proportionally.
- **FR-003**: Ambient light changes MUST take effect immediately while the control is being dragged, without reloading the page or the model.
- **FR-004**: When the viewer starts (page load), every lighting control MUST start at its documented default: ambient light level 50, "Shadows" switch ON, main light and position controls at their existing defaults. The user's chosen values MUST be preserved when switching models within the same session, and MUST reset to these defaults only on page reload.
- **FR-012**: While no model is loaded, the lighting controls MUST remain visible but disabled, and MUST become operable as soon as a model is loaded.
- **FR-013**: The new controls MUST be operable by keyboard alone, and the "Shadows" switch state MUST be programmatically exposed so assistive technologies can announce it.
- **FR-005**: The main directional light MUST cast shadows on the model's own surfaces only — protruding or overlapping parts visibly darken the surfaces behind/below them. No floor or backdrop surface is added to the scene for shadows to fall on.
- **FR-006**: Shadows MUST respond to the existing light position and light on/off controls: moving the light moves the shadows; turning the light off removes its shadows.
- **FR-007**: System MUST render each surface's authored roughness/metallic character faithfully, so rough metals appear rough/matte and polished metals appear reflective; authored finish data MUST be used as-is and MUST NOT be modified.
- **FR-008**: All new lighting and shadow behavior MUST remain compatible with the existing display modes (wireframe, gray/texture, emissive) and existing controls (zoom, reset camera). In emissive (unlit) mode shadows are not visible; this is expected and MUST NOT produce errors or visual glitches.
- **FR-009**: All new user-visible labels MUST be in English.
- **FR-010**: A model MUST still load and become viewable within 5 seconds under normal conditions (measured from triggering the model load to the model appearing on screen), and rotation/zoom MUST continue without visible freezing with shadows active. Technical FPS budget (measured with a standard FPS meter, supporting SC-004's eye-judged fluidity): at least 60 FPS on desktop and at least 30 FPS on mobile/responsive viewports.
- **FR-011**: System MUST provide a switch labeled exactly "Shadows" in the control panel, defaulting to ON. Switching it off MUST remove cast shadows on the next rendered frame without changing any light settings (ambient or main light), and switching it back on MUST restore them. The switch's current state MUST be visible to the user (active styling and pressed-state attribute).
- **FR-014**: On small screens (below 768px), the new controls MUST remain usable: touch targets of at least 44×44px for the switch, and the control panel MUST NOT require horizontal scrolling.

### Key Entities

- **Lighting Settings**: The viewer's session-scoped lighting state — ambient light level (0-100), main light intensity, main light position, light on/off, and the shadow on/off switch state (defaults to on). Not persisted between page reloads (v1).
- **Material Appearance**: The visual properties carried by each surface of the loaded model (color, texture, roughness, metallic character). Defined by the model file itself; the viewer renders them faithfully and never modifies the files.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A non-technical user can make a dark model clearly visible in under 10 seconds (stopwatch) by adjusting a single slider, without help or documentation.
- **SC-002**: In a side-by-side check, 3 out of 3 testers can point to at least one visible shadow on a model with protruding parts when the light is angled, and confirm the shadow moves when the light position changes.
- **SC-003**: In a direct visual inspection (no external reference render required), 3 out of 3 non-technical testers judge, while rotating the model, that rough/matte metal surfaces read as rough (no sharp mirror-like reflections) and that polished metal surfaces show highlights/reflections that move with the rotation — i.e., metal surfaces look like real metal rather than flat plastic.
- **SC-004**: Models load and become viewable within 5 seconds (stopwatch, from triggering the load to the model appearing on screen), and rotating/zooming continuously for ~15 seconds with shadows enabled shows no visible stutter or freezing, judged by eye by a non-technical person, on both desktop and mobile/responsive viewports.
- **SC-005**: No existing viewer feature (wireframe, gray/texture, emissive, zoom, reset, light position) regresses or becomes unusable after this change.

## Assumptions

- The "Ambient Light" slider replaces nothing; it is added alongside the existing light controls and covers the full 0-100 range with a confirmed default (50).
- Shadows are cast only by the viewer's main directional light; the shadow on/off switch controls only shadow rendering, not the lights themselves (clarified 2026-10-20).
- Shadows fall on the model's own surfaces; no artificial floor or backdrop is added to the scene (this would alter the viewer's current clean appearance).
- Material-finish improvements apply to surfaces whose model files define roughness/metallic character; models without such data keep their authored appearance unchanged (no invented default finish) and must not look worse than before this feature.
- Lighting settings last for the browsing session only; they are not saved between page reloads in v1 (reset on reload only).
- No Blender reference render is required to validate material realism; SC-003 is judged by direct visual inspection, and all supporting validation documents (quickstart, tasks, plan, contracts) must reflect this.
- The change stays within the existing platform constraints (plain web app on shared hosting, no build step) and the 5-second model-load budget.
- Out of scope: new file formats, model uploads, HDR/environment presets, tone-mapping controls, persistent user accounts or settings.
