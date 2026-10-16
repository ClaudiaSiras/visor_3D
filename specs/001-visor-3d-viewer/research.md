# Research: Visor 3D Viewer v1

**Date**: 2026-10-16
**Feature**: 3D model viewer with carousel, wireframe, lighting, and responsive layout

## R1: 3D Rendering Library Selection

**Decision**: Use Three.js (r150+) loaded via local copy in `vendor/three.min.js`

**Rationale**:
- Most widely used WebGL library with excellent GLTF/GLB support
- Built-in GLTFLoader for `.glb` files
- OrbitControls for rotate/zoom/pan out of the box
- No build step required — can be loaded as a simple script tag
- Works on shared hosting (just a static JS file)
- Large community and documentation

**Alternatives Considered**:
- Babylon.js: Heavier, more complex API, overkill for this use case
- Pure WebGL: Too low-level, would require significant custom code
- CSS 3D: Not suitable for complex 3D model rendering

## R2: Model Loading Strategy

**Decision**: Load `.glb` files via Three.js GLTFLoader with fetch API

**Rationale**:
- GLTFLoader handles binary glTF format natively
- Supports progress events for loading indicator
- Can ignore embedded lights (RN6) by traversing the loaded scene
- Works with local file paths (no CORS issues when served from same domain)

**Alternatives Considered**:
- Pre-converting to JSON: Adds build step, violates constitution
- Using Draco compression: Adds complexity, not needed for ≤10MB files

## R3: Thumbnail Generation Approach

**Decision**: Render each model to an offscreen canvas using Three.js, capture as data URL

**Rationale**:
- Uses the same Three.js renderer as the main viewer
- No server-side rendering required (PHP can't do this easily)
- Lazy generation keeps initial page load fast
- Can reuse the same scene setup with a separate small renderer

**Alternatives Considered**:
- Server-side rendering with headless browser: Requires Node.js, violates constitution
- Static image files: Requires manual creation, not dynamic
- CSS placeholders: Not actual model previews

## R4: Light Control Implementation

**Decision**: Use Three.js DirectionalLight with azimuth/elevation angles

**Rationale**:
- DirectionalLight represents parallel light (like sunlight)
- Azimuth (0-360°) and elevation (0-90°) map naturally to two sliders
- Intensity 0-100% maps to light.intensity 0-1
- Easy to toggle on/off by setting intensity to 0 or removing light

**Alternatives Considered**:
- PointLight: Not parallel, doesn't match "parallel light" requirement
- SpotLight: Has direction but also position, more complex
- AmbientLight: Not directional, doesn't match requirement

## R5: Wireframe Overlay Implementation

**Decision**: Create a wireframe mesh using WireframeGeometry and LineSegments

**Rationale**:
- WireframeGeometry extracts edges from any geometry
- LineSegments with black material creates clean overlay
- Can be toggled visible/invisible without affecting original mesh
- Works with any model geometry

**Alternatives Considered**:
- Material.wireframe = true: Changes entire material, not just overlay
- EdgesGeometry: Only shows hard edges, not full triangulation
- Custom shader: Overly complex for this use case

## R6: Emissive Mode Implementation

**Decision**: Swap material to MeshBasicMaterial with emissive color

**Rationale**:
- MeshBasicMaterial is unlit (ignores all lights)
- Can use original texture or flat color
- Simple to toggle by swapping material reference
- Matches "emissive" concept (self-illuminated)

**Alternatives Considered**:
- MeshStandardMaterial with emissive property: Still affected by lights
- Custom shader: Overly complex
- Post-processing bloom: Requires EffectComposer, adds complexity

## Responsive Design Approach

**Decision**: CSS Grid + media queries, mobile-first

**Rationale**:
- CSS Grid for layout (panel + carousel + controls)
- Media queries at 768px breakpoint for mobile/desktop
- Flexbox for carousel horizontal scrolling
- Touch events handled by Three.js OrbitControls automatically

**Alternatives Considered**:
- Bootstrap: Adds dependency, not needed for simple layout
- CSS Framework: Violates simplicity principle
