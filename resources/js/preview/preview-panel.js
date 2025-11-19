/**
 * PreviewPanel class
 * 
 * Manages the SVG preview display with proper scaling and aspect ratio preservation.
 * Handles rendering of generated SVG content and error display.
 */
export class PreviewPanel {
    /**
     * Create a new PreviewPanel instance
     * 
     * @param {HTMLElement} containerElement - The DOM element to contain the preview
     * @param {Object} viewportSize - The viewport dimensions
     * @param {number} viewportSize.width - Width in inches
     * @param {number} viewportSize.height - Height in inches
     */
    constructor(containerElement, viewportSize) {
        this.container = containerElement;
        this.viewportSize = viewportSize;
        this.DPI = 96; // Web standard DPI
        
        this._initializeContainer();
    }

    /**
     * Initialize the container structure with SVG and error display areas
     * 
     * @private
     */
    _initializeContainer() {
        // Clear any existing content
        this.container.innerHTML = '';
        
        // Create SVG container
        this.svgContainer = document.createElement('div');
        this.svgContainer.className = 'preview-svg-container w-full h-full flex items-center justify-center overflow-auto';
        
        // Create error display area
        this.errorContainer = document.createElement('div');
        this.errorContainer.className = 'preview-error-container hidden p-4 m-4 bg-red-50 border border-red-300 rounded-lg text-red-800 font-mono whitespace-pre-wrap break-words';
        
        // Add both to container
        this.container.appendChild(this.svgContainer);
        this.container.appendChild(this.errorContainer);
    }

    /**
     * Render SVG content in the preview panel
     * 
     * @param {string} svgContent - The SVG markup to display
     */
    render(svgContent) {
        // Clear any existing errors
        this.clearError();
        
        // Clear existing SVG content
        this.svgContainer.innerHTML = '';
        
        // Create a wrapper div for the SVG
        const svgWrapper = document.createElement('div');
        svgWrapper.innerHTML = svgContent;
        
        // Get the SVG element
        const svgElement = svgWrapper.querySelector('svg');
        
        if (!svgElement) {
            this.showError('Invalid SVG content: No SVG element found');
            return;
        }
        
        // Apply scaling to fit the container while maintaining aspect ratio
        this._applyScaling(svgElement);
        
        // Add the SVG to the container
        this.svgContainer.appendChild(svgElement);
    }

    /**
     * Apply appropriate scaling to the SVG element
     * Maintains aspect ratio based on viewport dimensions
     * 
     * @private
     * @param {SVGElement} svgElement - The SVG element to scale
     */
    _applyScaling(svgElement) {
        // Get container dimensions
        const containerWidth = this.container.clientWidth || 800;
        const containerHeight = this.container.clientHeight || 600;
        
        // Calculate pixel dimensions based on viewport size
        const viewportPixelWidth = this.viewportSize.width * this.DPI;
        const viewportPixelHeight = this.viewportSize.height * this.DPI;
        
        // Calculate aspect ratio
        const viewportAspectRatio = this.viewportSize.width / this.viewportSize.height;
        const containerAspectRatio = containerWidth / containerHeight;
        
        // Calculate scale to fit container while maintaining aspect ratio
        let scale;
        if (containerAspectRatio > viewportAspectRatio) {
            // Container is wider than viewport - fit to height
            scale = (containerHeight * 0.9) / viewportPixelHeight;
        } else {
            // Container is taller than viewport - fit to width
            scale = (containerWidth * 0.9) / viewportPixelWidth;
        }
        
        // Apply scaling
        const scaledWidth = viewportPixelWidth * scale;
        const scaledHeight = viewportPixelHeight * scale;
        
        svgElement.style.width = `${scaledWidth}px`;
        svgElement.style.height = `${scaledHeight}px`;
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '100%';
    }

    /**
     * Clear the preview panel
     */
    clear() {
        this.svgContainer.innerHTML = '';
        this.clearError();
    }

    /**
     * Set the viewport size and update the display
     * 
     * @param {number} width - Width in inches
     * @param {number} height - Height in inches
     */
    setViewportSize(width, height) {
        this.viewportSize = { width, height };
        
        // If there's currently rendered content, re-render it with new dimensions
        const currentSvg = this.svgContainer.querySelector('svg');
        if (currentSvg) {
            this._applyScaling(currentSvg);
        }
    }

    /**
     * Display an error message in the preview panel
     * 
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.errorContainer.textContent = message;
        this.errorContainer.classList.remove('hidden');
        this.errorContainer.classList.add('block');
    }

    /**
     * Clear any displayed error message
     */
    clearError() {
        this.errorContainer.textContent = '';
        this.errorContainer.classList.add('hidden');
        this.errorContainer.classList.remove('block');
    }

    /**
     * Get the current viewport size
     * 
     * @returns {Object} The current viewport size
     */
    getViewportSize() {
        return { ...this.viewportSize };
    }
}
