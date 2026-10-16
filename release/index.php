<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visor 3D</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="app-container">
        <!-- Mobile menu button -->
        <button id="mobile-menu-btn" class="mobile-menu-btn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <!-- Control panel -->
        <div id="control-panel" class="control-panel">
            <h2>Controls</h2>

            <div class="control-group">
                <h3>Display Modes</h3>
                <button id="btn-wireframe" class="control-btn">wireframe</button>
                <button id="btn-texture" class="control-btn">texture</button>
                <button id="btn-emissive" class="control-btn">emissive</button>
            </div>

            <div class="control-group">
                <h3>Lighting</h3>
                <button id="btn-light" class="control-btn">light</button>
                <div class="slider-group">
                    <label for="light-intensity">Intensity: <span id="light-intensity-val">100</span>%</label>
                    <input type="range" id="light-intensity" min="0" max="100" value="100">
                </div>
                <div class="slider-group">
                    <label for="light-position-h">Position H: <span id="light-position-h-val">45</span>°</label>
                    <input type="range" id="light-position-h" min="0" max="360" value="45">
                </div>
                <div class="slider-group">
                    <label for="light-position-v">Position V: <span id="light-position-v-val">45</span>°</label>
                    <input type="range" id="light-position-v" min="0" max="90" value="45">
                </div>
            </div>

            <div class="control-group">
                <h3>Camera</h3>
                <div class="slider-group">
                    <label for="zoom-slider">Zoom: <span id="zoom-val">1.0</span>x</label>
                    <input type="range" id="zoom-slider" min="0.5" max="5" step="0.1" value="1">
                </div>
                <button id="btn-reset" class="control-btn">reset</button>
            </div>
        </div>

        <!-- 3D Viewer panel -->
        <div id="viewer-container" class="viewer-container">
            <div id="loading-indicator" class="loading-indicator hidden">
                <span class="loading-text">Loading</span>
                <span class="loading-cursor"></span>
            </div>
            <div id="error-message" class="error-message hidden"></div>
            <div id="empty-state" class="empty-state hidden">
                <p>No models available</p>
            </div>
        </div>

        <!-- Carousel -->
        <div id="carousel" class="carousel">
            <div id="carousel-track" class="carousel-track"></div>
        </div>
    </div>

    <!-- Three.js from CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

    <!-- Application scripts -->
    <script src="js/viewer.js"></script>
    <script src="js/controls.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
