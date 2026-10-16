# Feature Specification: Visor 3D Viewer v1

**Feature Branch**: `001-visor-3d-viewer`
**Created**: 2026-10-16
**Status**: Draft
**Input**: User description: Visor_3D web app — select from preloaded 3D models, visualize in 3D space, rotate all directions, toggle wireframe, global light, texture on/off (gray color), emissive mode, reset, sliders for light position/intensity/zoom, carousel thumbnails.

## Clarifications

### Session 2026-10-16

- Q: When the page first loads, should a model be automatically selected and displayed in the viewer, or should the viewer remain empty until the user clicks a thumbnail? → A: Auto-select and display the first model in the carousel on page load.
- Q: If the `modelos/` folder contains many models (e.g., 20+), should all thumbnails be generated at once when the page loads, or should they be generated lazily as the user scrolls the carousel? → A: Generate thumbnails lazily as they become visible in the carousel.
- Q: When the user zooms using the mouse wheel or pinch gesture, should the zoom slider automatically update to reflect the current zoom level? → A: Yes, the zoom slider always reflects the current zoom level regardless of input method.
- Q: The original specification uses the term "emisive" for the emissive mode button. What label should be displayed on the button in the user interface? → A: "emissive" (correct English spelling).
- Q: Is there a maximum file size limit for `.glb` model files in the `modelos/` folder to ensure the 3-second load target is met? → A: 10MB maximum per model file.

## User Scenarios & Testing

### User Story 1 - Select and view a 3D model (Priority: P1)

Visitor opens the page, the first model in the carousel is automatically selected and displayed centered in the 3D panel within 3 seconds. The user can then click a different thumbnail to switch models, seeing a "Loading" indicator before the new model appears.

**Why this priority**: Core value — without it nothing else is usable.

**Independent Test**: Load page with ≥1 model, click a thumbnail, verify loading indicator then model visible centered.

**Acceptance Scenarios**:

1. **Given** models exist, **When** page loads, **Then** the first model is automatically selected and renders centered within 3 seconds.
2. **Given** a model is displayed, **When** user clicks a different thumbnail, **Then** loading indicator appears and the new model renders centered within 3 seconds.
3. **Given** `modelos/` folder is empty, **When** page loads, **Then** a notice "no models available" is shown instead of the carousel.
4. **Given** a model is displayed, **When** user clicks another thumbnail, **Then** only the new model is visible (RN1).

---

### User Story 2 - Rotate, zoom and pan the model (Priority: P1)

User drags with left mouse (touch-drag on mobile) to rotate in all directions, uses mouse wheel / pinch / zoom slider to zoom within limits, and right-drag (double-tap+drag on mobile) to pan.

**Why this priority**: Essential inspection interactions.

**Independent Test**: Load a model and verify rotate with drag, zoom in/out with wheel and slider, pan with right-drag.

**Acceptance Scenarios**:

1. **Given** a model is displayed, **When** user drags on the panel, **Then** the model rotates following the drag direction.
2. **Given** a model is displayed, **When** user scrolls wheel up, **Then** zoom in; wheel down → zoom out, clamped to min/max so model never disappears.
3. **Given** a model is displayed, **When** user moves the zoom slider, **Then** zoom changes proportionally within the same limits.
4. **Given** a model is displayed, **When** user right-drags (or double-tap+drags on mobile), **Then** the model pans.
5. **Given** mobile viewport, **When** user does pinch gesture, **Then** zoom in/out works.

---

### User Story 3 - Toggle display modes (wireframe, texture, emissive) (Priority: P2)

User presses "wireframe" to overlay black triangulated mesh, "texture" to switch between textured and flat gray, and "emissive" to switch material to emissive (unlit) mode which disables the global parallel light.

**Why this priority**: Key visualization modes requested; independent of lighting controls.

**Independent Test**: Toggle each button and observe visual change; wireframe coexists with texture modes; emissive ignores global light.

**Acceptance Scenarios**:

1. **Given** a model displayed, **When** wireframe pressed, **Then** black mesh outline overlays the model; pressing again removes it.
2. **Given** a model displayed, **When** texture pressed, **Then** model switches between original texture and flat gray.
3. **Given** light is on, **When** emissive pressed, **Then** global parallel light no longer affects the model (RN4); pressing again restores lit rendering.

---

### User Story 4 - Control global light and reset view (Priority: P2)

User toggles a "light" button (on → model lit; off → model dark), adjusts light position sliders (horizontal and vertical parallel light direction) and intensity slider (0–100%), and presses "reset" to restore original position/rotation/zoom.

**Why this priority**: Lighting inspection plus safe recovery via reset.

**Independent Test**: Toggle light off → model dark; move sliders → visible change; press reset → original centered view.

**Acceptance Scenarios**:

1. **Given** light on, **When** light button pressed, **Then** model goes dark; pressing again restores illumination.
2. **Given** light on, **When** intensity slider moved 0→100%, **Then** brightness changes accordingly.
3. **Given** light on, **When** light position sliders moved, **Then** parallel light direction changes visibly.
4. **Given** model rotated/zoomed/panned, **When** reset pressed, **Then** model returns to centered original rotation and zoom.

---

### User Story 5 - Responsive mobile layout (Priority: P3)

On mobile the 3D panel appears first, carousel below, and display buttons hide behind a collapsible menu button.

**Why this priority**: Required responsiveness; usable without it on desktop.

**Independent Test**: Resize to mobile width; verify stacking order and hamburger-style menu.

**Acceptance Scenarios**:

1. **Given** mobile viewport, **When** page loads, **Then** 3D panel is shown first, carousel with thumbnails below.
2. **Given** mobile viewport, **When** menu button pressed, **Then** control buttons/sliders expand; pressing again collapses.

### Edge Cases

- Model still loading when another thumbnail clicked: show "Loading" + animated cursor; last click wins, only one model visible.
- `modelos/` empty or unreadable: show empty-state notice; viewer panel shows placeholder, controls disabled except harmless.
- Corrupt/unsupported model file: show error notice in viewer panel, keep carousel usable.
- Window resized mid-session: viewer resizes, model stays framed (clamped zoom), layout switches desktop/mobile breakpoint.
- App closed: no data persisted (no preferences saved).

## Requirements

### Functional Requirements

- **FR-001**: System MUST show a 3D view panel displaying exactly one selected model at a time.
- **FR-001a**: System MUST auto-select and display the first model in the carousel on page load.
- **FR-002**: System MUST show a horizontal thumbnail carousel below the 3D panel; thumbnails generated dynamically from files in the `modelos/` folder.
- **FR-003**: System MUST show a control menu (vertical on desktop, collapsible via menu button on mobile) with buttons: wireframe, texture, light, emissive, reset — plus sliders: light position horizontal, light position vertical, light intensity, zoom.
- **FR-004**: System MUST support rotate (left-drag / touch-drag), zoom (wheel / pinch / slider, clamped min/max), pan (right-drag / double-tap+drag). The zoom slider MUST always reflect the current zoom level regardless of input method.
- **FR-005**: System MUST show a "Loading" indicator with animated cursor while a model loads.
- **FR-006**: System MUST allow wireframe overlay coexisting with texture/gray/emissive modes (non-exclusive).
- **FR-007**: System MUST implement light intensity range 0%–100% and a single global parallel (directional) light; embedded lights in model files MUST be ignored.
- **FR-008**: System MUST make emissive mode exclude global lighting (when emissive active, parallel light has no effect).
- **FR-009**: System MUST reset position, rotation and zoom to the original centered framing when reset is pressed.
- **FR-010**: System MUST be responsive: desktop shows side menu + panel + carousel; mobile stacks panel first, carousel below, controls behind a menu button.
- **FR-011**: System MUST load models in `.glb` (binary glTF) format from the `modelos/` folder. Model files MUST NOT exceed 10MB.
- **FR-012**: Thumbnails MUST be dynamically generated rendered snapshot previews of each 3D model, generated lazily as they become visible in the carousel.
- **FR-013**: Light-position control MUST provide two sliders/axes: horizontal (azimuth/orbit) and vertical (elevation) direction of the parallel light.

### Key Entities

- **3D Model**: A preloaded model file in `modelos/`; attributes: filename, display name (derived from filename), load state (loading/ready/error).
- **Thumbnail**: Carousel entry per model; attributes: image/label, selected state; selects the visible model on click.
- **Viewer State** (transient, not persisted): selected model, camera (rotation/zoom/pan), toggles (wireframe, textured/gray, emissive, light on/off), light (position, intensity 0–100%).

## Success Criteria

### Measurable Outcomes

- **SC-001**: On page load, the first model is automatically displayed centered within 3 seconds; users can select any other listed model and see it rendered within 3 seconds of clicking its thumbnail.
- **SC-002**: 90% of first-time users can rotate, zoom and pan the model without instructions.
- **SC-003**: All display controls (wireframe, texture/gray, emissive, light on/off, reset, 4 sliders) produce a visible change within 1 second of use.
- **SC-004**: On a mobile-width viewport, panel appears above carousel and controls are reachable via one menu button tap.
- **SC-005**: With an empty `modelos/` folder, users see a clear "no models" notice instead of a broken carousel.

## Assumptions

- Single anonymous visitor; no accounts, no uploads, no model/mesh editing, no persistence (closing app loses state).
- Desktop: mouse with left/right buttons + wheel; mobile: touch, double-tap, pinch.
- Model files are small enough to load within 3–5 s under normal conditions; constitution requires ≤5 s.
- All UI text in English per constitution; control labels: "wireframe", "texture", "light", "emissive", "reset".
- Stack: PHP + plain HTML/CSS/JS, shared-hosting compatible, models from local `modelos/` folder, no build step (per constitution).
- Wireframe overlay renders in black over the model.
- Light off = model appears dark (minimal ambient), per CA4.
