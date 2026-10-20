/**
 * UI Controls module
 * Handles button clicks, slider changes, and mobile menu
 */

const Controls = (function() {
    /**
     * Initialize all controls
     */
    function init() {
        // Display mode buttons
        document.getElementById('btn-wireframe').addEventListener('click', function() {
            Viewer.toggleWireframe();
            this.classList.toggle('active');
        });

        document.getElementById('btn-texture').addEventListener('click', function() {
            Viewer.toggleTexture();
            this.classList.toggle('active');
        });

        document.getElementById('btn-emissive').addEventListener('click', function() {
            Viewer.toggleEmissive();
            this.classList.toggle('active');
        });

        // Light controls
        var btnLight = document.getElementById('btn-light');
        if (btnLight) {
            btnLight.addEventListener('click', function() {
                Viewer.toggleLight();
                this.classList.toggle('active');
            });
        }

        var lightIntensitySlider = document.getElementById('light-intensity');
        if (lightIntensitySlider) {
            lightIntensitySlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                var lightIntensityVal = document.getElementById('light-intensity-val');
                if (lightIntensityVal) lightIntensityVal.textContent = value;
                Viewer.setLightIntensity(value);
            });
        }

        var lightAmbientSlider = document.getElementById('light-ambient');
        if (lightAmbientSlider) {
            lightAmbientSlider.addEventListener('input', function() {
                const value = parseInt(this.value);
                var lightAmbientVal = document.getElementById('light-ambient-val');
                if (lightAmbientVal) lightAmbientVal.textContent = value;
                Viewer.setAmbientIntensity(value);
            });
        }

        var btnShadows = document.getElementById('btn-shadows');
        if (btnShadows) {
            btnShadows.addEventListener('click', function() {
                var isActive = this.classList.contains('active');
                if (isActive) {
                    this.classList.remove('active');
                    this.setAttribute('aria-pressed', 'false');
                    Viewer.setShadowsEnabled(false);
                } else {
                    this.classList.add('active');
                    this.setAttribute('aria-pressed', 'true');
                    Viewer.setShadowsEnabled(true);
                }
            });
        }

        document.getElementById('light-position-h').addEventListener('input', function() {
            const value = parseInt(this.value);
            document.getElementById('light-position-h-val').textContent = value;
            const elevation = parseInt(document.getElementById('light-position-v').value);
            Viewer.setLightPosition(value, elevation);
        });

        document.getElementById('light-position-v').addEventListener('input', function() {
            const value = parseInt(this.value);
            document.getElementById('light-position-v-val').textContent = value;
            const azimuth = parseInt(document.getElementById('light-position-h').value);
            Viewer.setLightPosition(azimuth, value);
        });

        // Camera controls
        document.getElementById('zoom-slider').addEventListener('input', function() {
            const value = parseFloat(this.value);
            document.getElementById('zoom-val').textContent = value.toFixed(1);
            Viewer.setZoomLevel(value);
        });

        document.getElementById('btn-reset').addEventListener('click', function() {
            Viewer.resetCamera();
            // Reset zoom slider
            document.getElementById('zoom-slider').value = 1.0;
            document.getElementById('zoom-val').textContent = '1.0';
        });

        // Mobile menu button
        const menuBtn = document.getElementById('mobile-menu-btn');
        const controlPanel = document.getElementById('control-panel');
        if (menuBtn && controlPanel) {
            menuBtn.addEventListener('click', function() {
                controlPanel.classList.toggle('open');
            });
        }

        // Sync zoom slider with OrbitControls
        syncZoomSlider();
    }

    /**
     * Sync zoom slider with actual camera zoom
     */
    function syncZoomSlider() {
        setInterval(function() {
            const zoom = Viewer.getZoomLevel();
            const slider = document.getElementById('zoom-slider');
            const zoomVal = document.getElementById('zoom-val');
            if (slider && zoomVal) {
                // Only update if not being dragged
                if (document.activeElement !== slider) {
                    slider.value = zoom;
                    zoomVal.textContent = zoom.toFixed(1);
                }
            }
        }, 100);
    }

    // Public API
    return {
        init
    };
})();
