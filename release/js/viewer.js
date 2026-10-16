/**
 * 3D Viewer module using Three.js
 * Handles scene setup, model loading, lighting, and rendering
 */

const Viewer = (function() {
    let scene, camera, renderer, controls;
    let currentModel = null;
    let wireframeMesh = null;
    let directionalLight;
    let originalMaterials = new Map();
    let isWireframeEnabled = false;
    let isEmissiveMode = false;
    let isLightEnabled = true;
    let lightIntensity = 1.0;
    let lightAzimuth = 45;
    let lightElevation = 45;
    let originalCameraPosition = null;
    let originalCameraTarget = null;

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 5.0;

    /**
     * Initialize the 3D scene
     */
    function init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Viewer container not found:', containerId);
            return;
        }

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Camera
        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(0, 0, 5);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity);
        updateLightPosition();
        scene.add(directionalLight);

        // Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = MIN_ZOOM;
            controls.maxDistance = MAX_ZOOM * 10;
            controls.enablePan = true;
        }

        // Handle window resize
        window.addEventListener('resize', onWindowResize);

        // Start render loop
        animate();
    }

    /**
     * Update light position based on azimuth and elevation
     */
    function updateLightPosition() {
        const azimuthRad = THREE.MathUtils.degToRad(lightAzimuth);
        const elevationRad = THREE.MathUtils.degToRad(lightElevation);

        const x = Math.cos(elevationRad) * Math.sin(azimuthRad);
        const y = Math.sin(elevationRad);
        const z = Math.cos(elevationRad) * Math.cos(azimuthRad);

        directionalLight.position.set(x * 10, y * 10, z * 10);
    }

    /**
     * Load a .glb model
     */
    function loadModel(filename) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            const url = 'modelos/' + filename;

            // Show loading indicator
            showLoading(true);

            loader.load(
                url,
                function(gltf) {
                    // Remove current model
                    if (currentModel) {
                        scene.remove(currentModel);
                        disposeObject(currentModel);
                    }

                    // Reset state
                    isWireframeEnabled = false;
                    isEmissiveMode = false;
                    originalMaterials.clear();
                    wireframeMesh = null;

                    // Add new model
                    currentModel = gltf.scene;

                    // Ignore embedded lights (RN6)
                    currentModel.traverse(function(child) {
                        if (child.isLight) {
                            child.intensity = 0;
                            child.visible = false;
                        }
                    });

                    // Center and scale model
                    const box = new THREE.Box3().setFromObject(currentModel);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 3 / maxDim;

                    currentModel.position.sub(center);
                    currentModel.scale.set(scale, scale, scale);

                    // Store original materials
                    currentModel.traverse(function(child) {
                        if (child.isMesh) {
                            originalMaterials.set(child.uuid, child.material);
                        }
                    });

                    scene.add(currentModel);

                    // Store original camera position
                    if (!originalCameraPosition) {
                        originalCameraPosition = camera.position.clone();
                        originalCameraTarget = controls ? controls.target.clone() : new THREE.Vector3();
                    }

                    // Reset camera
                    resetCamera();

                    showLoading(false);
                    resolve(currentModel);
                },
                function(progress) {
                    // Loading progress
                    if (progress.total > 0) {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        console.log('Loading:', percent + '%');
                    }
                },
                function(error) {
                    showLoading(false);
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Dispose of an object and its resources
     */
    function disposeObject(object) {
        object.traverse(function(child) {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }

    /**
     * Toggle wireframe overlay
     */
    function toggleWireframe() {
        if (!currentModel) return;

        isWireframeEnabled = !isWireframeEnabled;

        if (isWireframeEnabled) {
            // Create wireframe overlay
            currentModel.traverse(function(child) {
                if (child.isMesh && child.geometry) {
                    const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
                    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
                    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
                    wireframe.position.copy(child.position);
                    wireframe.rotation.copy(child.rotation);
                    wireframe.scale.copy(child.scale);
                    child.parent.add(wireframe);
                    if (!wireframeMesh) wireframeMesh = [];
                    wireframeMesh.push(wireframe);
                }
            });
        } else {
            // Remove wireframe overlay
            if (wireframeMesh) {
                wireframeMesh.forEach(wf => {
                    if (wf.parent) wf.parent.remove(wf);
                    wf.geometry.dispose();
                    wf.material.dispose();
                });
                wireframeMesh = null;
            }
        }
    }

    /**
     * Toggle texture/gray mode
     */
    function toggleTexture() {
        if (!currentModel) return;

        currentModel.traverse(function(child) {
            if (child.isMesh) {
                const originalMat = originalMaterials.get(child.uuid);
                if (!originalMat) return;

                if (originalMat.map) {
                    // Has texture - switch to gray
                    const grayMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
                    child.material = grayMat;
                } else {
                    // No texture - restore original
                    child.material = originalMat;
                }
            }
        });
    }

    /**
     * Toggle emissive mode
     */
    function toggleEmissive() {
        if (!currentModel) return;

        isEmissiveMode = !isEmissiveMode;

        currentModel.traverse(function(child) {
            if (child.isMesh) {
                const originalMat = originalMaterials.get(child.uuid);
                if (!originalMat) return;

                if (isEmissiveMode) {
                    // Switch to emissive (unlit)
                    const emissiveMat = new THREE.MeshBasicMaterial({
                        color: originalMat.color || 0xffffff,
                        map: originalMat.map || null
                    });
                    child.material = emissiveMat;
                } else {
                    // Restore original material
                    child.material = originalMat;
                }
            }
        });
    }

    /**
     * Toggle light on/off
     */
    function toggleLight() {
        isLightEnabled = !isLightEnabled;
        directionalLight.intensity = isLightEnabled ? lightIntensity : 0;
    }

    /**
     * Set light intensity (0-100%)
     */
    function setLightIntensity(value) {
        lightIntensity = value / 100;
        if (isLightEnabled) {
            directionalLight.intensity = lightIntensity;
        }
    }

    /**
     * Set light position
     */
    function setLightPosition(azimuth, elevation) {
        lightAzimuth = azimuth;
        lightElevation = elevation;
        updateLightPosition();
    }

    /**
     * Reset camera to original position
     */
    function resetCamera() {
        if (originalCameraPosition) {
            camera.position.copy(originalCameraPosition);
        } else {
            camera.position.set(0, 0, 5);
        }

        if (controls) {
            if (originalCameraTarget) {
                controls.target.copy(originalCameraTarget);
            } else {
                controls.target.set(0, 0, 0);
            }
            controls.update();
        }
    }

    /**
     * Get current zoom level
     */
    function getZoomLevel() {
        if (!controls) return 1.0;
        const distance = camera.position.distanceTo(controls.target);
        return 5.0 / distance; // Normalize to 1.0 at default distance
    }

    /**
     * Set zoom level
     */
    function setZoomLevel(level) {
        if (!controls) return;
        const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        const distance = 5.0 / clamped;
        camera.position.copy(controls.target).add(direction.multiplyScalar(-distance));
        controls.update();
    }

    /**
     * Generate thumbnail for a model
     */
    function generateThumbnail(filename) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            const url = 'modelos/' + filename;

            loader.load(
                url,
                function(gltf) {
                    // Create offscreen renderer
                    const thumbRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
                    thumbRenderer.setSize(200, 150);
                    thumbRenderer.setPixelRatio(1);

                    const thumbScene = new THREE.Scene();
                    thumbScene.background = new THREE.Color(0x0f3460);

                    const thumbCamera = new THREE.PerspectiveCamera(75, 200 / 150, 0.1, 1000);
                    thumbCamera.position.set(0, 0, 5);

                    // Add lights
                    const ambient = new THREE.AmbientLight(0x404040, 0.5);
                    thumbScene.add(ambient);
                    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
                    dirLight.position.set(1, 1, 1);
                    thumbScene.add(dirLight);

                    // Add model
                    const model = gltf.scene;
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 3 / maxDim;

                    model.position.sub(center);
                    model.scale.set(scale, scale, scale);
                    thumbScene.add(model);

                    // Render
                    thumbRenderer.render(thumbScene, thumbCamera);
                    const dataUrl = thumbRenderer.domElement.toDataURL('image/jpeg', 0.8);

                    // Cleanup
                    thumbRenderer.dispose();
                    disposeObject(model);

                    resolve(dataUrl);
                },
                undefined,
                function(error) {
                    reject(error);
                }
            );
        });
    }

    /**
     * Show/hide loading indicator
     */
    function showLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.toggle('hidden', !show);
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        }
    }

    /**
     * Handle window resize
     */
    function onWindowResize() {
        const container = document.getElementById('viewer-container');
        if (!container || !camera || !renderer) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    /**
     * Animation loop
     */
    function animate() {
        requestAnimationFrame(animate);
        if (controls) {
            controls.update();
        }
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    // Public API
    return {
        init,
        loadModel,
        toggleWireframe,
        toggleTexture,
        toggleEmissive,
        toggleLight,
        setLightIntensity,
        setLightPosition,
        resetCamera,
        getZoomLevel,
        setZoomLevel,
        generateThumbnail,
        showLoading,
        showError
    };
})();
