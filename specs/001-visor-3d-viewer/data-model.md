# Data Model: Visor 3D Viewer v1

**Date**: 2026-10-16
**Feature**: 3D model viewer with carousel, wireframe, lighting, and responsive layout

## Overview

The Visor 3D Viewer is a client-side web application with minimal server-side state. The primary data entities are 3D models (files) and transient viewer state (not persisted).

## Entities

### 3D Model

A preloaded `.glb` model file in the `modelos/` folder.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| filename | string | File name with extension | Must end in `.glb`, ≤10MB |
| displayName | string | Human-readable name derived from filename | Auto-generated, English |
| fileSize | number | File size in bytes | ≤10MB (10,485,760 bytes) |
| loadState | enum | Current loading state | `loading` \| `ready` \| `error` |
| thumbnailData | string | Base64-encoded preview image | Generated lazily |

**Relationships**:
- Each 3D Model has zero or one Thumbnail (generated on demand)
- Each 3D Model is independently selectable in the carousel

**State Transitions**:
```
[File on disk] → loading → ready
                     ↓
                   error
```

### Thumbnail

A carousel entry representing a 3D Model.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| modelFilename | string | Reference to parent 3D Model | Foreign key to 3D Model |
| imageData | string | Base64-encoded preview image | Generated lazily on first view |
| isSelected | boolean | Whether this thumbnail is currently selected | Only one can be `true` at a time |
| isVisible | boolean | Whether thumbnail is in viewport | Used for lazy loading |

**Relationships**:
- Belongs to exactly one 3D Model
- Selection state is mutually exclusive across all Thumbnails (RN1)

### Viewer State (Transient)

Current state of the 3D viewer. **Not persisted** — resets on page reload.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| selectedModel | string | Filename of currently displayed model | Must reference existing 3D Model |
| cameraRotation | object | Euler angles (x, y, z) | Free rotation |
| cameraZoom | number | Zoom level | Clamped to min/max limits |
| cameraPan | object | Pan offset (x, y) | Free pan |
| wireframeEnabled | boolean | Wireframe overlay on/off | Non-exclusive with other modes |
| textureMode | enum | Texture display mode | `textured` \| `gray` |
| emissiveEnabled | boolean | Emissive mode on/off | Excludes global light (RN4) |
| lightEnabled | boolean | Global light on/off | Disabled when emissive is active |
| lightPosition | object | Light direction (azimuth, elevation) | Azimuth: 0-360°, Elevation: 0-90° |
| lightIntensity | number | Light brightness | 0-100% (RN3) |

**State Transitions**:
```
Initial State (page load):
  selectedModel = first model in carousel
  cameraRotation = {x: 0, y: 0, z: 0}
  cameraZoom = default
  cameraPan = {x: 0, y: 0}
  wireframeEnabled = false
  textureMode = "textured"
  emissiveEnabled = false
  lightEnabled = true
  lightPosition = {azimuth: 45, elevation: 45}
  lightIntensity = 100

Reset Action:
  → Returns all attributes to Initial State values
```

## Validation Rules

1. **Model File Validation**:
   - File must exist in `modelos/` folder
   - File extension must be `.glb`
   - File size must be ≤10MB
   - File must be valid binary glTF format

2. **Selection Validation**:
   - Only one model can be selected at a time (RN1)
   - Selected model must exist in `modelos/` folder

3. **Light Validation**:
   - Intensity must be 0-100% (RN3)
   - Azimuth must be 0-360°
   - Elevation must be 0-90°
   - Light is disabled when emissive mode is active (RN4)

4. **Zoom Validation**:
   - Zoom must be clamped to min/max limits (RN5)
   - Min zoom: model fills at least 10% of viewport
   - Max zoom: model does not exceed 5x original size

## Data Flow

```
[Page Load]
    ↓
[PHP scans modelos/ folder] → returns list of .glb files
    ↓
[JavaScript receives model list] → populates carousel
    ↓
[First model auto-selected] → triggers model load
    ↓
[Three.js loads .glb file] → displays in viewer
    ↓
[User interacts] → updates Viewer State (transient)
    ↓
[Page close/refresh] → Viewer State discarded (CL3)
```
