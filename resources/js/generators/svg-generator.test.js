import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SVGGenerator } from './svg-generator.js';
import * as fc from 'fast-check';

describe('SVGGenerator', () => {
    let generator;
    const defaultViewport = { width: 8.5, height: 11 };

    beforeEach(() => {
        generator = new SVGGenerator(defaultViewport);
    });

    describe('constructor', () => {
        it('should initialize with viewport size', () => {
            expect(generator.viewportSize).toEqual(defaultViewport);
        });

        it('should set DPI to 96', () => {
            expect(generator.DPI).toBe(96);
        });

        it('should set timeout to 5000ms', () => {
            expect(generator.TIMEOUT_MS).toBe(5000);
        });

        it('should initialize lastError to null', () => {
            expect(generator.lastError).toBeNull();
        });
    });

    describe('setViewportSize', () => {
        it('should update viewport dimensions', () => {
            generator.setViewportSize(11, 8.5);
            expect(generator.viewportSize).toEqual({ width: 11, height: 8.5 });
        });
    });

    describe('execute', () => {
        it('should execute valid code and return SVG markup', async () => {
            const code = `
                draw.circle(100).fill('#f06');
            `;

            const result = await generator.execute(code);

            expect(result).toContain('<svg');
            expect(result).toContain('</svg>');
            expect(result).toContain('circle');
        });

        it('should initialize SVG.js with correct viewport dimensions', async () => {
            const code = `
                draw.rect(100, 100);
            `;

            const result = await generator.execute(code);

            // Check that SVG has correct size attributes
            expect(result).toContain('width="816"'); // 8.5 * 96
            expect(result).toContain('height="1056"'); // 11 * 96
            expect(result).toContain('viewBox="0 0 8.5 11"');
        });

        it('should provide draw instance to user code', async () => {
            const code = `
                if (!draw || typeof draw.circle !== 'function') {
                    throw new Error('draw instance not available');
                }
                draw.circle(50);
            `;

            const result = await generator.execute(code);
            expect(result).toContain('circle');
        });

        it('should capture syntax errors', async () => {
            const code = `
                draw.circle(100
            `;

            await expect(generator.execute(code)).rejects.toThrow();
            expect(generator.getLastError()).not.toBeNull();
            expect(generator.getLastError().type).toBe('syntax');
        });

        it('should capture runtime errors', async () => {
            const code = `
                throw new Error('Test runtime error');
            `;

            await expect(generator.execute(code)).rejects.toThrow('Test runtime error');
            expect(generator.getLastError()).not.toBeNull();
            expect(generator.getLastError().type).toBe('runtime');
        });

        // Note: JavaScript setTimeout cannot interrupt synchronous infinite loops
        // This is a known limitation - the timeout protection works for async operations
        // but cannot stop synchronous blocking code

        it('should clean up container on success', async () => {
            const code = `draw.circle(100);`;
            
            const initialChildCount = document.body.children.length;
            await generator.execute(code);
            const finalChildCount = document.body.children.length;

            expect(finalChildCount).toBe(initialChildCount);
        });

        it('should clean up container on error', async () => {
            const code = `throw new Error('test');`;
            
            const initialChildCount = document.body.children.length;
            
            try {
                await generator.execute(code);
            } catch (e) {
                // Expected error
            }
            
            const finalChildCount = document.body.children.length;
            expect(finalChildCount).toBe(initialChildCount);
        });

        it('should reset lastError on successful execution', async () => {
            // First, cause an error
            const badCode = `throw new Error('test');`;
            try {
                await generator.execute(badCode);
            } catch (e) {
                // Expected
            }

            expect(generator.getLastError()).not.toBeNull();

            // Now execute valid code
            const goodCode = `draw.circle(100);`;
            await generator.execute(goodCode);

            expect(generator.getLastError()).toBeNull();
        });
    });

    describe('getLastError', () => {
        it('should return null when no error has occurred', () => {
            expect(generator.getLastError()).toBeNull();
        });

        it('should return error object after execution failure', async () => {
            const code = `throw new Error('Test error');`;

            try {
                await generator.execute(code);
            } catch (e) {
                // Expected
            }

            const error = generator.getLastError();
            expect(error).not.toBeNull();
            expect(error.message).toContain('Test error');
            expect(error.type).toBe('runtime');
        });

        it('should include error type', async () => {
            const code = `invalid syntax here(`;

            try {
                await generator.execute(code);
            } catch (e) {
                // Expected
            }

            const error = generator.getLastError();
            expect(error.type).toBe('syntax');
        });
    });

    describe('error formatting', () => {
        it('should format syntax errors correctly', async () => {
            const code = `draw.circle(`;

            try {
                await generator.execute(code);
            } catch (e) {
                // Expected
            }

            const error = generator.getLastError();
            expect(error.type).toBe('syntax');
            expect(error.message).toBeTruthy();
        });

        it('should format runtime errors correctly', async () => {
            const code = `
                draw.circle(100);
                throw new Error('Runtime error');
            `;

            try {
                await generator.execute(code);
            } catch (e) {
                // Expected
            }

            const error = generator.getLastError();
            expect(error.type).toBe('runtime');
            expect(error.message).toBe('Runtime error');
        });
    });

    describe('viewport size changes', () => {
        it('should use updated viewport size in subsequent executions', async () => {
            generator.setViewportSize(6, 6);

            const code = `draw.rect(100, 100);`;
            const result = await generator.execute(code);

            expect(result).toContain('width="576"'); // 6 * 96
            expect(result).toContain('height="576"'); // 6 * 96
            expect(result).toContain('viewBox="0 0 6 6"');
        });
    });

    /**
     * Feature: svg-plotter-editor, Property 2: SVG.js instance availability
     * 
     * Property: For any code execution, an initialized SVG.js drawing instance 
     * should be accessible to the Plotter Code.
     * 
     * Validates: Requirements 1.2
     */
    describe('Property 2: SVG.js instance availability', () => {
        it('should provide an initialized SVG.js draw instance for any viewport size', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate arbitrary viewport dimensions (positive numbers between 1 and 100 inches)
                    fc.record({
                        width: fc.double({ min: 1, max: 100, noNaN: true }),
                        height: fc.double({ min: 1, max: 100, noNaN: true })
                    }),
                    // Generate arbitrary SVG.js method names to test
                    fc.constantFrom('circle', 'rect', 'ellipse', 'polygon', 'group'),
                    async (viewport, methodName) => {
                        // Create generator with arbitrary viewport
                        const testGenerator = new SVGGenerator(viewport);

                        // Code that checks if draw instance exists and has expected methods
                        const code = `
                            // Verify draw instance exists
                            if (typeof draw === 'undefined') {
                                throw new Error('draw instance is not defined');
                            }

                            // Verify draw is an object
                            if (typeof draw !== 'object' || draw === null) {
                                throw new Error('draw is not an object');
                            }

                            // Verify draw has the expected SVG.js method
                            if (typeof draw.${methodName} !== 'function') {
                                throw new Error('draw.${methodName} is not a function');
                            }

                            // Verify draw has core SVG.js methods
                            const requiredMethods = ['size', 'viewbox', 'clear', 'svg'];
                            for (const method of requiredMethods) {
                                if (typeof draw[method] !== 'function') {
                                    throw new Error('draw.' + method + ' is not a function');
                                }
                            }

                            // Actually use the method to ensure it works
                            // Use appropriate parameters for each method
                            if ('${methodName}' === 'circle' || '${methodName}' === 'ellipse') {
                                draw.${methodName}(50);
                            } else if ('${methodName}' === 'rect') {
                                draw.${methodName}(50, 50);
                            } else if ('${methodName}' === 'polygon') {
                                draw.${methodName}('0,0 50,0 25,50');
                            } else if ('${methodName}' === 'group') {
                                draw.${methodName}();
                            }
                        `;

                        // Execute the code - should not throw
                        const result = await testGenerator.execute(code);

                        // Verify SVG markup was generated
                        expect(result).toContain('<svg');
                        expect(result).toContain('</svg>');
                    }
                ),
                { numRuns: 100 } // Run 100 iterations as specified in design doc
            );
        });
    });
});
