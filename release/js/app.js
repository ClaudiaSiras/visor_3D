/**
 * Main application logic
 * Handles model fetching, carousel population, and initialization
 */

const App = (function() {
    let models = [];
    let selectedModel = null;
    let isLoading = false;

    /**
     * Initialize the application
     */
    function init() {
        // Initialize viewer
        Viewer.init('viewer-container');

        // Initialize controls
        Controls.init();

        // Fetch models and populate carousel
        fetchModels();

        // Handle window resize
        window.addEventListener('resize', function() {
            // Viewer handles its own resize
        });
    }

    /**
     * Fetch models from API
     */
    function fetchModels() {
        fetch('api/models.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch models');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    models = data.models;
                    populateCarousel(models);

                    // Auto-select first model (FR-001a)
                    if (models.length > 0) {
                        selectModel(models[0].filename);
                    } else {
                        showEmptyState();
                    }
                } else {
                    showError(data.error || 'Failed to load models');
                }
            })
            .catch(error => {
                console.error('Error fetching models:', error);
                showError('Failed to load models');
            });
    }

    /**
     * Populate carousel with model thumbnails
     */
    function populateCarousel(modelList) {
        const track = document.getElementById('carousel-track');
        if (!track) return;

        track.innerHTML = '';

        modelList.forEach(model => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.dataset.filename = model.filename;

            // Placeholder until thumbnail loads
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder';
            placeholder.textContent = model.displayName;
            item.appendChild(placeholder);

            // Click handler
            item.addEventListener('click', function() {
                selectModel(model.filename);
            });

            track.appendChild(item);

            // Lazy load thumbnail when visible
            loadThumbnailWhenVisible(item, model.filename);
        });
    }

    /**
     * Load thumbnail when carousel item becomes visible
     */
    function loadThumbnailWhenVisible(item, filename) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observer.unobserve(item);
                    Viewer.generateThumbnail(filename)
                        .then(dataUrl => {
                            const img = document.createElement('img');
                            img.src = dataUrl;
                            img.alt = filename;
                            item.innerHTML = '';
                            item.appendChild(img);
                        })
                        .catch(error => {
                            console.error('Failed to generate thumbnail:', error);
                            // Keep placeholder on error
                        });
                }
            });
        }, { threshold: 0.1 });

        observer.observe(item);
    }

    /**
     * Select a model to display
     */
    function selectModel(filename) {
        if (isLoading) return;

        // Update selection UI
        document.querySelectorAll('.carousel-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.filename === filename);
        });

        selectedModel = filename;
        isLoading = true;

        // Load model
        Viewer.loadModel(filename)
            .then(() => {
                isLoading = false;
            })
            .catch(error => {
                isLoading = false;
                Viewer.showError('Failed to load model: ' + filename);
            });
    }

    /**
     * Show empty state when no models available
     */
    function showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        const carousel = document.getElementById('carousel');
        if (carousel) {
            carousel.classList.add('hidden');
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        Viewer.showError(message);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        init
    };
})();
