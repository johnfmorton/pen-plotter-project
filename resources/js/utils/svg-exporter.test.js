/**
 * Tests for SVG Exporter Utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportSVG, extractSVGFromPreview } from './svg-exporter.js';

describe('SVG Exporter', () => {
    let mockLink;
    let createObjectURLSpy;
    let revokeObjectURLSpy;
    let originalCreateElement;
    let capturedBlob;

    beforeEach(() => {
        // Store original createElement
        originalCreateElement = document.createElement.bind(document);

        // Mock document.createElement for 'a' element
        mockLink = {
            href: '',
            download: '',
            click: vi.fn(),
        };

        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag === 'a') {
                return mockLink;
            }
            return originalCreateElement(tag);
        });

        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        // Mock URL methods and capture blob
        createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
            capturedBlob = blob;
            return 'blob:mock-url';
        });
        revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        capturedBlob = null;
    });

    // Helper to read blob content
    async function readBlobAsText(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(blob);
        });
    }

    describe('exportSVG', () => {
        it('should export SVG with XML declaration', () => {
            const svgMarkup = '<svg><circle cx="50" cy="50" r="40"/></svg>';
            const filename = 'test-export';
            const viewportSize = { width: 8.5, height: 11 };

            exportSVG(svgMarkup, filename, viewportSize);

            // Verify blob was created with correct content
            expect(createObjectURLSpy).toHaveBeenCalled();
            const blobArg = createObjectURLSpy.mock.calls[0][0];
            expect(blobArg).toBeInstanceOf(Blob);
            expect(blobArg.type).toBe('image/svg+xml');
        });

        it('should add proper XML namespaces to SVG', async () => {
            const svgMarkup = '<svg><rect width="100" height="100"/></svg>';
            const filename = 'namespace-test';
            const viewportSize = { width: 10, height: 10 };

            exportSVG(svgMarkup, filename, viewportSize);

            // Get the blob content
            const text = await readBlobAsText(capturedBlob);

            expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
            expect(text).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
        });

        it('should set viewBox to match viewport dimensions', async () => {
            const svgMarkup = '<svg><line x1="0" y1="0" x2="100" y2="100"/></svg>';
            const filename = 'viewbox-test';
            const viewportSize = { width: 8.5, height: 11 };

            exportSVG(svgMarkup, filename, viewportSize);

            const text = await readBlobAsText(capturedBlob);

            expect(text).toContain('viewBox="0 0 8.5 11"');
        });

        it('should trigger download with .svg extension', () => {
            const svgMarkup = '<svg><path d="M 0 0 L 100 100"/></svg>';
            const filename = 'download-test';
            const viewportSize = { width: 6, height: 6 };

            exportSVG(svgMarkup, filename, viewportSize);

            expect(mockLink.download).toBe('download-test.svg');
            expect(mockLink.click).toHaveBeenCalled();
        });

        it('should preserve all SVG attributes and elements', async () => {
            const svgMarkup = `<svg>
                <path d="M 10 10 L 90 90" stroke="black" stroke-width="2" fill="none"/>
                <circle cx="50" cy="50" r="30" fill="red" opacity="0.5"/>
            </svg>`;
            const filename = 'preserve-test';
            const viewportSize = { width: 4, height: 5 };

            exportSVG(svgMarkup, filename, viewportSize);

            const text = await readBlobAsText(capturedBlob);

            // Verify all elements and attributes are preserved
            expect(text).toContain('<path');
            expect(text).toContain('d="M 10 10 L 90 90"');
            expect(text).toContain('stroke="black"');
            expect(text).toContain('stroke-width="2"');
            expect(text).toContain('<circle');
            expect(text).toContain('cx="50"');
            expect(text).toContain('cy="50"');
            expect(text).toContain('r="30"');
            expect(text).toContain('fill="red"');
            expect(text).toContain('opacity="0.5"');
        });

        it('should include XML declaration at the start', async () => {
            const svgMarkup = '<svg><text x="10" y="10">Hello</text></svg>';
            const filename = 'declaration-test';
            const viewportSize = { width: 11, height: 8.5 };

            exportSVG(svgMarkup, filename, viewportSize);

            const text = await readBlobAsText(capturedBlob);

            expect(text).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n/);
        });

        it('should cleanup resources after download', () => {
            const svgMarkup = '<svg><ellipse cx="50" cy="50" rx="40" ry="20"/></svg>';
            const filename = 'cleanup-test';
            const viewportSize = { width: 8.5, height: 11 };

            exportSVG(svgMarkup, filename, viewportSize);

            expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
            expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
        });

        it('should throw error for invalid SVG markup', () => {
            expect(() => {
                exportSVG('', 'test', { width: 10, height: 10 });
            }).toThrow('Invalid SVG markup');

            expect(() => {
                exportSVG(null, 'test', { width: 10, height: 10 });
            }).toThrow('Invalid SVG markup');

            expect(() => {
                exportSVG(123, 'test', { width: 10, height: 10 });
            }).toThrow('Invalid SVG markup');
        });

        it('should throw error for invalid filename', () => {
            const svgMarkup = '<svg></svg>';

            expect(() => {
                exportSVG(svgMarkup, '', { width: 10, height: 10 });
            }).toThrow('Invalid filename');

            expect(() => {
                exportSVG(svgMarkup, null, { width: 10, height: 10 });
            }).toThrow('Invalid filename');
        });

        it('should throw error for invalid viewport size', () => {
            const svgMarkup = '<svg></svg>';

            expect(() => {
                exportSVG(svgMarkup, 'test', null);
            }).toThrow('Invalid viewport size');

            expect(() => {
                exportSVG(svgMarkup, 'test', { width: 'invalid', height: 10 });
            }).toThrow('Invalid viewport size');

            expect(() => {
                exportSVG(svgMarkup, 'test', { width: 10 });
            }).toThrow('Invalid viewport size');
        });

        it('should throw error when no SVG element found', () => {
            const invalidMarkup = '<div>Not an SVG</div>';

            expect(() => {
                exportSVG(invalidMarkup, 'test', { width: 10, height: 10 });
            }).toThrow('No SVG element found');
        });

        it('should handle complex SVG with nested elements', async () => {
            const svgMarkup = `<svg>
                <g transform="translate(50, 50)">
                    <rect x="0" y="0" width="100" height="100" fill="blue"/>
                    <g transform="rotate(45)">
                        <circle cx="50" cy="50" r="25" fill="yellow"/>
                    </g>
                </g>
            </svg>`;
            const filename = 'complex-test';
            const viewportSize = { width: 8.5, height: 11 };

            exportSVG(svgMarkup, filename, viewportSize);

            const text = await readBlobAsText(capturedBlob);

            // Verify nested structure is preserved
            expect(text).toContain('<g');
            expect(text).toContain('transform="translate(50, 50)"');
            expect(text).toContain('transform="rotate(45)"');
            expect(text).toContain('<rect');
            expect(text).toContain('<circle');
        });
    });

    describe('extractSVGFromPreview', () => {
        it('should extract SVG from preview container', () => {
            const container = originalCreateElement('div');
            container.innerHTML = '<svg><circle cx="50" cy="50" r="40"/></svg>';

            const result = extractSVGFromPreview(container);

            expect(result).toContain('<svg');
            expect(result).toContain('<circle');
            expect(result).toContain('cx="50"');
        });

        it('should throw error if no SVG element found', () => {
            const container = originalCreateElement('div');
            container.innerHTML = '<div>No SVG here</div>';

            expect(() => {
                extractSVGFromPreview(container);
            }).toThrow('No SVG element found in preview');
        });

        it('should throw error for invalid container', () => {
            expect(() => {
                extractSVGFromPreview(null);
            }).toThrow('Invalid preview container');
        });
    });
});
