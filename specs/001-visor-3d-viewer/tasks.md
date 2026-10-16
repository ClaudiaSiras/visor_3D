# Tasks: Visor 3D Viewer v1

**Input**: Design documents from `/specs/001-visor-3d-viewer/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure per implementation plan (css/, js/, api/, modelos/, vendor/, tests/)
- [x] T002 [P] Download and install Three.js library (r150+) to vendor/three.min.js
- [x] T003 [P] Create .gitkeep file in modelos/ folder
- [x] T004 Create index.php with basic HTML structure and script tags for Three.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement model listing API endpoint in api/models.php (returns JSON list of .glb files from modelos/, max 10MB, sorted alphabetically)
- [x] T006 [P] Create base CSS styles in css/style.css (reset, layout grid, responsive breakpoints at 768px)
- [x] T007 [P] Create base JavaScript structure in js/app.js (initialization, API fetch, error handling)
- [x] T008 Implement Three.js scene setup in js/viewer.js (renderer, camera, lighting, render loop)
- [x] T009 Implement GLTFLoader integration in js/viewer.js (load .glb files, handle loading state, ignore embedded lights per RN6)
- [x] T010 Implement OrbitControls in js/viewer.js (rotate, zoom, pan with mouse and touch, zoom clamped to min/max per RN5)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Select and view a 3D model (Priority: P1) — MVP

**Goal**: Visitor opens the page, first model auto-selects and displays centered in 3D panel within 3 seconds; user can click thumbnails to switch models

**Independent Test**: Load page with ≥1 model, verify first model auto-loads and displays; click different thumbnail, verify model switches

### Implementation for User Story 1

- [x] T011 [US1] Implement carousel HTML structure in index.php (horizontal thumbnail container below 3D panel)
- [x] T012 [US1] Implement thumbnail generation in js/viewer.js (render model to offscreen canvas at 200x150px, capture as JPEG data URL quality 0.8, lazy generation as thumbnails become visible)
- [x] T013 [US1] Implement carousel population in js/app.js (fetch models from api/models.php, create thumbnail elements, handle click events)
- [x] T014 [US1] Implement auto-select first model in js/app.js (on page load, select first model, trigger load, display centered within 3 seconds)
- [x] T015 [US1] Implement loading indicator in index.php and css/style.css (show "Loading" text with animated cursor while model loads)
- [x] T016 [US1] Implement empty state handling in js/app.js (show "no models available" notice when modelos/ folder is empty)
- [x] T017 [US1] Implement model switching in js/app.js (click thumbnail → load new model → replace in viewer, only one visible at a time per RN1)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Rotate, zoom and pan the model (Priority: P1)

**Goal**: User can rotate (left-drag/touch-drag), zoom (wheel/pinch/slider, clamped), and pan (right-drag/double-tap+drag) the model

**Independent Test**: Load a model, verify rotate with drag, zoom in/out with wheel and slider, pan with right-drag

### Implementation for User Story 2

- [x] T018 [US2] Implement zoom slider in index.php and css/style.css (range input, synchronized with wheel/pinch zoom level)
- [x] T019 [US2] Implement zoom slider synchronization in js/controls.js (slider reflects current zoom level regardless of input method)
- [x] T020 [US2] Configure OrbitControls in js/viewer.js (enableDamping=true, dampingFactor=0.05, minDistance/maxDistance for zoom limits, left-drag rotate, wheel zoom, right-drag pan, touch: single-drag rotate, pinch zoom, double-tap+drag pan)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Toggle display modes (Priority: P2)

**Goal**: User can toggle wireframe overlay, texture/gray mode, and emissive mode

**Independent Test**: Toggle each button and observe visual change; wireframe coexists with texture modes; emissive ignores global light

### Implementation for User Story 3

- [x] T021 [P] [US3] Implement wireframe button in index.php and css/style.css (toggle button labeled "wireframe")
- [x] T022 [US3] Implement wireframe overlay in js/viewer.js (create WireframeGeometry from model, LineSegments with black material, toggle visible/invisible)
- [x] T023 [P] [US3] Implement texture button in index.php and css/style.css (toggle button labeled "texture")
- [x] T024 [US3] Implement texture/gray toggle in js/viewer.js (swap between original material and flat gray material)
- [x] T025 [P] [US3] Implement emissive button in index.php and css/style.css (toggle button labeled "emissive")
- [x] T026 [US3] Implement emissive mode in js/viewer.js (swap to MeshBasicMaterial, disable global light effect per RN4, toggle back to lit rendering)

**Checkpoint**: All display mode toggles should now be independently functional

---

## Phase 6: User Story 4 - Control global light and reset view (Priority: P2)

**Goal**: User can toggle light on/off, adjust light position (two axes) and intensity (0-100%), and reset view to original

**Independent Test**: Toggle light off → model dark; move sliders → visible change; press reset → original centered view

### Implementation for User Story 4

- [x] T027 [P] [US4] Implement light button in index.php and css/style.css (toggle button labeled "light")
- [x] T028 [US4] Implement light toggle in js/viewer.js (DirectionalLight on/off, model dark when off per CA4)
- [x] T029 [P] [US4] Implement light intensity slider in index.php and css/style.css (range 0-100%)
- [x] T030 [US4] Implement light intensity control in js/viewer.js (map 0-100% to light.intensity 0-1 per RN3)
- [x] T031 [P] [US4] Implement light position sliders in index.php and css/style.css (two range inputs: horizontal azimuth 0-360°, vertical elevation 0-90°)
- [x] T032 [US4] Implement light position control in js/viewer.js (map azimuth/elevation to DirectionalLight position)
- [x] T033 [P] [US4] Implement reset button in index.php and css/style.css (button labeled "reset")
- [x] T034 [US4] Implement reset functionality in js/viewer.js (restore camera position, rotation, zoom to original centered framing)

**Checkpoint**: All light controls and reset should now be independently functional

---

## Phase 7: User Story 5 - Responsive mobile layout (Priority: P3)

**Goal**: On mobile, 3D panel appears first, carousel below, controls hidden behind collapsible menu button

**Independent Test**: Resize to mobile width; verify stacking order and hamburger-style menu

### Implementation for User Story 5

- [x] T035 [US5] Implement responsive layout in css/style.css (CSS Grid, media queries at 768px breakpoint, panel first then carousel on mobile)
- [x] T036 [US5] Implement mobile menu button in index.php and css/style.css (hamburger button, hidden on desktop, visible on mobile)
- [x] T037 [US5] Implement collapsible menu in js/controls.js (toggle control panel visibility on mobile, expand/collapse on button click)
- [x] T038 [US5] Verify touch controls on mobile in js/viewer.js (single touch drag rotate, pinch zoom, double-tap+drag pan)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T039 [P] Add error handling for corrupt/unsupported model files in js/viewer.js (show error notice in viewer panel, keep carousel usable)
- [x] T040 [P] Add window resize handling in js/viewer.js (viewer resizes, model stays framed, layout switches breakpoint)
- [x] T041 [P] Add performance optimization in js/viewer.js (dispose old models when switching, limit pixel ratio to 2)
- [x] T042 Run quickstart.md validation scenarios and fix any issues
- [x] T043 [P] Add final documentation comments in all source files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Builds on US1 (model loading)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 (model loading)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 (model loading)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Builds on all previous stories

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all independent tasks for User Story 1 together:
Task: "Implement carousel HTML structure in index.php"
Task: "Implement thumbnail generation in js/viewer.js"
Task: "Implement loading indicator in index.php and css/style.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
