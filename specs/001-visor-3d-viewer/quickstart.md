# Quickstart Validation: Visor 3D Viewer v1

**Date**: 2026-10-16
**Feature**: 3D model viewer with carousel, wireframe, lighting, and responsive layout

## Prerequisites

- Web server with PHP 7.4+ (e.g., Apache, Nginx)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- At least one `.glb` model file in the `modelos/` folder (≤10MB)

## Setup

1. **Clone or copy the project** to your web server's document root
2. **Add a test model**: Place a `.glb` file in the `modelos/` folder
3. **Ensure permissions**: `modelos/` folder must be readable by the web server
4. **Open in browser**: Navigate to `http://your-domain/visor_3D/`

## Validation Scenarios

### Scenario 1: Page Load with Auto-Select (FR-001a, SC-001)

**Steps**:
1. Open the application in a browser
2. Observe the 3D panel and carousel

**Expected**:
- First model in carousel is automatically selected
- Model appears centered in the 3D panel within 3 seconds
- Carousel shows thumbnail(s) below the 3D panel
- No console errors

### Scenario 2: Model Selection via Carousel (FR-001, FR-002)

**Steps**:
1. Click on a different thumbnail in the carousel
2. Wait for loading to complete

**Expected**:
- "Loading" indicator appears briefly
- New model replaces the previous one in the 3D panel
- Only one model is visible at a time
- Selected thumbnail is visually highlighted

### Scenario 3: Rotate, Zoom, Pan (FR-004)

**Steps**:
1. Click and drag on the 3D panel (left mouse button)
2. Scroll mouse wheel up and down
3. Right-click and drag on the 3D panel
4. Move the zoom slider

**Expected**:
- Left-drag rotates the model in all directions
- Wheel up zooms in, wheel down zooms out
- Right-drag pans the model
- Zoom slider reflects current zoom level and can be dragged to zoom
- Zoom is clamped (model never disappears or becomes too large)

### Scenario 4: Wireframe Toggle (FR-006)

**Steps**:
1. Click the "wireframe" button
2. Click the "wireframe" button again

**Expected**:
- First click: black wireframe overlay appears on the model
- Second click: wireframe overlay is removed
- Wireframe works in combination with texture/gray/emissive modes

### Scenario 5: Texture Toggle (FR-006)

**Steps**:
1. Click the "texture" button
2. Click the "texture" button again

**Expected**:
- First click: model switches from textured to flat gray
- Second click: model switches back to original texture
- Works in combination with wireframe and emissive modes

### Scenario 6: Light Control (FR-007, FR-008)

**Steps**:
1. Click the "light" button to turn light off
2. Click the "light" button again to turn light on
3. Move the light intensity slider from 0% to 100%
4. Move the light position sliders (horizontal and vertical)

**Expected**:
- Light off: model appears dark
- Light on: model is illuminated
- Intensity slider: brightness changes proportionally (0-100%)
- Position sliders: light direction changes visibly on the model

### Scenario 7: Emissive Mode (FR-008, RN4)

**Steps**:
1. Ensure light is on
2. Click the "emissive" button
3. Move light intensity slider
4. Click the "emissive" button again

**Expected**:
- Emissive on: model appears self-illuminated, light changes have no effect
- Light slider moves but model appearance doesn't change
- Emissive off: model returns to lit rendering, light affects model again

### Scenario 8: Reset View (FR-009)

**Steps**:
1. Rotate, zoom, and pan the model to a non-default position
2. Click the "reset" button

**Expected**:
- Model returns to centered position
- Rotation returns to original orientation
- Zoom returns to default level
- Pan offset is cleared

### Scenario 9: Responsive Layout (FR-010)

**Steps**:
1. Open browser developer tools
2. Toggle device toolbar to mobile viewport (e.g., 375px width)
3. Reload the page

**Expected**:
- 3D panel appears first (top of page)
- Carousel appears below the 3D panel
- Control buttons are hidden behind a menu button
- Clicking the menu button expands/collapses the controls

### Scenario 10: Empty Model Folder (CL2, SC-005)

**Steps**:
1. Remove all `.glb` files from the `modelos/` folder
2. Reload the page

**Expected**:
- A clear "no models available" message is displayed
- Carousel is not shown
- 3D panel shows a placeholder or empty state

### Scenario 11: Loading Indicator (FR-005, CL1)

**Steps**:
1. Add a large `.glb` file (close to 10MB) to `modelos/`
2. Click on its thumbnail
3. Observe the loading state

**Expected**:
- "Loading" text appears
- Animated cursor or spinner is shown
- Model appears within 3 seconds

### Scenario 12: Mobile Touch Controls (FR-004, FR-010)

**Steps**:
1. Open the application on a mobile device or emulator
2. Touch and drag on the 3D panel
3. Pinch with two fingers
4. Double-tap and drag

**Expected**:
- Single touch drag rotates the model
- Pinch gesture zooms in/out
- Double-tap and drag pans the model
- All gestures work smoothly without page scrolling

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Model doesn't load | File >10MB or invalid .glb | Check file size and format |
| Thumbnails not showing | Lazy loading not triggered | Scroll carousel to trigger loading |
| Light not affecting model | Emissive mode is active | Turn off emissive mode |
| Controls not visible on mobile | Menu button not clicked | Click the menu button to expand controls |
| Slow loading | Large file or slow connection | Use smaller .glb files (<5MB recommended) |
