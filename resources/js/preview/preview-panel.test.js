import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PreviewPanel } from './preview-panel.js';
import * as fc from 'fast-check';

describe('PreviewPanel', () => {
    let container;
    let previewPanel;
    const defaultViewport = { width: 8.5, height: 11 };

    beforeEach(() => {
        // Create a container element for testing
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        previewPanel = new PreviewPanel(container, defaultViewport);
    });

    afterEach(() => {
        // Clean up
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    describe('constructor', () => {
        it('should initialize with container and viewport size', () => {
            expect(previewPanel.container).toBe(container);
            expect(previewPanel.viewportSize).toEqual(defaultViewport);
        });

        it('should set DPI to 96', () => {
            expect(previewPanel.DPI).toBe(96);
        });

        it('should create SVG container', () => {
            const svgContainer = container.querySelector('.preview-svg-container');
            expect(svgContainer).not.toBeNull();
        });

        it('should create error container', () => {
            const errorContainer = container.querySelector('.preview-error-container');
            expect(errorContainer).not.toBeNull();
        });

        it('should hide error container by default', () => {
            const errorContainer = container.querySelector('.preview-error-container');
            expect(errorContainer.classList.contains('hidden')).toBe(true);
        });
    });

    describe('render', () => {
        it('should render SVG content', () => {
            const svgContent = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>';
            
            previewPanel.render(svgContent);

            const svgElement = container.querySelector('svg');
            expect(svgElement).not.toBeNull();
            expect(svgElement.querySelector('circle')).not.toBeNull();
        });

        it('should clear previous content before rendering', () => {
            const svgContent1 = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>';
            const svgContent2 = '<svg width="100" height="100"><rect x="10" y="10" width="80" height="80" /></svg>';

            previewPanel.render(svgContent1);
            expect(container.querySelectorAll('circle').length).toBe(1);

            previewPanel.render(svgContent2);
            expect(container.querySelectorAll('circle').length).toBe(0);
            expect(container.querySelectorAll('rect').length).toBe(1);
        });

        it('should clear errors when rendering', () => {
            previewPanel.showError('Test error');
            expect(previewPanel.errorContainer.classList.contains('block')).toBe(true);

            const svgContent = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>';
            previewPanel.render(svgContent);

            expect(previewPanel.errorContainer.classList.contains('hidden')).toBe(true);
        });

        it('should show error for invalid SVG content', () => {
            const invalidContent = '<div>Not an SVG</div>';
            
            previewPanel.render(invalidContent);

            expect(previewPanel.errorContainer.classList.contains('block')).toBe(true);
            expect(previewPanel.errorContainer.textContent).toContain('Invalid SVG content');
        });

        it('should apply scaling to SVG element', () => {
            const svgContent = '<svg width="816" height="1056"><circle cx="50" cy="50" r="40" /></svg>';
            
            previewPanel.render(svgContent);

            const svgElement = container.querySelector('svg');
            expect(svgElement.style.width).not.toBe('');
            expect(svgElement.style.height).not.toBe('');
        });
    });

    describe('clear', () => {
        it('should clear SVG content', () => {
            const svgContent = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" /></svg>';
            previewPanel.render(svgContent);

            expect(container.querySelector('svg')).not.toBeNull();

            previewPanel.clear();

            expect(container.querySelector('svg')).toBeNull();
        });

        it('should clear error messages', () => {
            previewPanel.showError('Test error');
            expect(previewPanel.errorContainer.classList.contains('block')).toBe(true);

            previewPanel.clear();

            expect(previewPanel.errorContainer.classList.contains('hidden')).toBe(true);
            expect(previewPanel.errorContainer.textContent).toBe('');
        });
    });

    describe('setViewportSize', () => {
        it('should update viewport dimensions', () => {
            previewPanel.setViewportSize(11, 8.5);
            
            expect(previewPanel.viewportSize).toEqual({ width: 11, height: 8.5 });
        });

        it('should re-scale existing SVG when viewport changes', () => {
            const svgContent = '<svg width="816" height="1056"><circle cx="50" cy="50" r="40" /></svg>';
            previewPanel.render(svgContent);

            const svgElement = container.querySelector('svg');
            const originalWidth = svgElement.style.width;

            previewPanel.setViewportSize(6, 6);

            // Width should change due to different aspect ratio
            expect(svgElement.style.width).not.toBe(originalWidth);
        });

        it('should not throw error when no SVG is rendered', () => {
            expect(() => {
                previewPanel.setViewportSize(6, 6);
            }).not.toThrow();
        });
    });

    describe('showError', () => {
        it('should display error message', () => {
            const errorMessage = 'Test error message';
            
            previewPanel.showError(errorMessage);

            expect(previewPanel.errorContainer.classList.contains('block')).toBe(true);
            expect(previewPanel.errorContainer.textContent).toBe(errorMessage);
        });

        it('should replace previous error message', () => {
            previewPanel.showError('First error');
            previewPanel.showError('Second error');

            expect(previewPanel.errorContainer.textContent).toBe('Second error');
        });
    });

    describe('clearError', () => {
        it('should hide error container', () => {
            previewPanel.showError('Test error');
            expect(previewPanel.errorContainer.classList.contains('block')).toBe(true);

            previewPanel.clearError();

            expect(previewPanel.errorContainer.classList.contains('hidden')).toBe(true);
        });

        it('should clear error text', () => {
            previewPanel.showError('Test error');
            expect(previewPanel.errorContainer.textContent).toBe('Test error');

            previewPanel.clearError();

            expect(previewPanel.errorContainer.textContent).toBe('');
        });
    });

    describe('getViewportSize', () => {
        it('should return current viewport size', () => {
            const viewport = previewPanel.getViewportSize();
            
            expect(viewport).toEqual(defaultViewport);
        });

        it('should return a copy of viewport size', () => {
            const viewport = previewPanel.getViewportSize();
            viewport.width = 999;

            expect(previewPanel.viewportSize.width).toBe(8.5);
        });
    });

    describe('aspect ratio preservation', () => {
        it('should maintain aspect ratio when scaling', () => {
            const svgContent = '<svg width="816" height="1056"><rect x="0" y="0" width="816" height="1056" /></svg>';
            
            previewPanel.render(svgContent);

            const svgElement = container.querySelector('svg');
            const width = parseFloat(svgElement.style.width);
            const height = parseFloat(svgElement.style.height);

            // Calculate aspect ratios
            const svgAspectRatio = width / height;
            const viewportAspectRatio = defaultViewport.width / defaultViewport.height;

            // Should be approximately equal (allowing for rounding)
            expect(Math.abs(svgAspectRatio - viewportAspectRatio)).toBeLessThan(0.01);
        });

        it('should apply scaling based on viewport dimensions', () => {
            const svgContent = '<svg width="816" height="1056"><rect x="0" y="0" width="816" height="1056" /></svg>';
            
            previewPanel.render(svgContent);

            const svgElement = container.querySelector('svg');
            const width = parseFloat(svgElement.style.width);
            const height = parseFloat(svgElement.style.height);

            // SVG should have dimensions set (not 0)
            expect(width).toBeGreaterThan(0);
            expect(height).toBeGreaterThan(0);
            
            // Should have max-width and max-height set for responsiveness
            expect(svgElement.style.maxWidth).toBe('100%');
            expect(svgElement.style.maxHeight).toBe('100%');
        });
    });

    describe('viewport synchronization', () => {
        it('should update display when viewport size changes', () => {
            const svgContent = '<svg width="816" height="1056"><circle cx="50" cy="50" r="40" /></svg>';
            previewPanel.render(svgContent);

            const svgElement = container.querySelector('svg');
            const originalWidth = parseFloat(svgElement.style.width);
            const originalHeight = parseFloat(svgElement.style.height);
            const originalAspectRatio = originalWidth / originalHeight;

            // Change to square viewport (different aspect ratio)
            previewPanel.setViewportSize(8.5, 8.5);

            const newWidth = parseFloat(svgElement.style.width);
            const newHeight = parseFloat(svgElement.style.height);
            const newAspectRatio = newWidth / newHeight;

            // Aspect ratio should change to match new viewport
            expect(Math.abs(newAspectRatio - 1.0)).toBeLessThan(0.01); // Square aspect ratio
            expect(Math.abs(newAspectRatio - originalAspectRatio)).toBeGreaterThan(0.1); // Should be different
        });
    });

    describe('Property-Based Tests', () => {
        /**
         * **Feature: svg-plotter-editor, Property 8: Aspect ratio preservation**
         * **Validates: Requirements 2.5**
         * 
         * For any viewport size, the Preview Panel should display the SVG with an 
         * aspect ratio that matches the configured viewport dimensions.
         */
        it('Property 8: should preserve aspect ratio for any viewport size', () => {
            fc.assert(
                fc.property(
                    // Generate viewport dimensions (width and height in inches)
                    // Reasonable range: 1 to 24 inches (common plotter sizes)
                    fc.double({ min: 1, max: 24, noNaN: true }),
                    fc.double({ min: 1, max: 24, noNaN: true }),
                    (viewportWidth, viewportHeight) => {
                        // Create a new PreviewPanel with the generated viewport size
                        const testContainer = document.createElement('div');
                        testContainer.style.width = '800px';
                        testContainer.style.height = '600px';
                        document.body.appendChild(testContainer);

                        const testPanel = new PreviewPanel(testContainer, {
                            width: viewportWidth,
                            height: viewportHeight
                        });

                        // Create SVG content with dimensions matching the viewport
                        const DPI = 96;
                        const pixelWidth = viewportWidth * DPI;
                        const pixelHeight = viewportHeight * DPI;
                        const svgContent = `<svg width="${pixelWidth}" height="${pixelHeight}"><rect x="0" y="0" width="${pixelWidth}" height="${pixelHeight}" /></svg>`;

                        // Render the SVG
                        testPanel.render(svgContent);

                        // Get the rendered SVG element
                        const svgElement = testContainer.querySelector('svg');

                        // Extract the rendered dimensions
                        const renderedWidth = parseFloat(svgElement.style.width);
                        const renderedHeight = parseFloat(svgElement.style.height);

                        // Calculate aspect ratios
                        const viewportAspectRatio = viewportWidth / viewportHeight;
                        const renderedAspectRatio = renderedWidth / renderedHeight;

                        // Clean up
                        document.body.removeChild(testContainer);

                        // The rendered aspect ratio should match the viewport aspect ratio
                        // Allow for small floating point errors (0.01 tolerance)
                        const aspectRatioDifference = Math.abs(renderedAspectRatio - viewportAspectRatio);
                        
                        return aspectRatioDifference < 0.01;
                    }
                ),
                { numRuns: 100 }
            );
        });

        /**
         * **Feature: svg-plotter-editor, Property 10: Canvas viewport synchronization**
         * **Validates: Requirements 3.6**
         * 
         * For any new project creation, the SVG canvas dimensions should match the 
         * selected viewport size.
         */
        it('Property 10: should synchronize canvas dimensions with viewport size', () => {
            fc.assert(
                fc.property(
                    // Generate initial viewport dimensions
                    fc.double({ min: 1, max: 24, noNaN: true }),
                    fc.double({ min: 1, max: 24, noNaN: true }),
                    // Generate new viewport dimensions (simulating new project creation)
                    fc.double({ min: 1, max: 24, noNaN: true }),
                    fc.double({ min: 1, max: 24, noNaN: true }),
                    (initialWidth, initialHeight, newWidth, newHeight) => {
                        // Create a PreviewPanel with initial viewport size
                        const testContainer = document.createElement('div');
                        testContainer.style.width = '800px';
                        testContainer.style.height = '600px';
                        document.body.appendChild(testContainer);

                        const testPanel = new PreviewPanel(testContainer, {
                            width: initialWidth,
                            height: initialHeight
                        });

                        // Verify initial viewport is set correctly
                        const initialViewport = testPanel.getViewportSize();
                        const initialMatch = 
                            Math.abs(initialViewport.width - initialWidth) < 0.0001 &&
                            Math.abs(initialViewport.height - initialHeight) < 0.0001;

                        // Simulate new project creation by setting new viewport size
                        testPanel.setViewportSize(newWidth, newHeight);

                        // Verify the canvas dimensions match the new viewport size
                        const updatedViewport = testPanel.getViewportSize();
                        const updatedMatch = 
                            Math.abs(updatedViewport.width - newWidth) < 0.0001 &&
                            Math.abs(updatedViewport.height - newHeight) < 0.0001;

                        // Clean up
                        document.body.removeChild(testContainer);

                        // Both initial and updated viewport should match their respective sizes
                        return initialMatch && updatedMatch;
                    }
                ),
                { numRuns: 100 }
            );
        });
    });
});
