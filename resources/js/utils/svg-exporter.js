/**
 * SVG Exporter Utility
 * 
 * Handles exporting generated SVG with proper XML declarations,
 * namespaces, and viewBox attributes for pen plotter compatibility.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.6
 */

/**
 * Export SVG markup to a downloadable file
 * 
 * @param {string} svgMarkup - Raw SVG markup from generator
 * @param {string} filename - Desired filename (without extension)
 * @param {Object} viewportSize - Viewport dimensions
 * @param {number} viewportSize.width - Width in inches
 * @param {number} viewportSize.height - Height in inches
 * @returns {void}
 * @throws {Error} If SVG markup is invalid or export fails
 * 
 * Requirements:
 * - 9.1: Provide raw SVG markup for download
 * - 9.2: Include proper XML declarations and namespaces
 * - 9.3: Set viewBox attribute to match viewport
 * - 9.4: Trigger file download with .svg extension
 * - 9.6: Preserve all paths, strokes, and attributes
 */
export function exportSVG(svgMarkup, filename, viewportSize) {
    if (!svgMarkup || typeof svgMarkup !== 'string') {
        throw new Error('Invalid SVG markup: must be a non-empty string');
    }

    if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename: must be a non-empty string');
    }

    if (!viewportSize || typeof viewportSize.width !== 'number' || typeof viewportSize.height !== 'number') {
        throw new Error('Invalid viewport size: must have numeric width and height');
    }

    try {
        // Parse the SVG markup
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
        
        // Check for parsing errors
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Failed to parse SVG markup: invalid XML');
        }
        
        // Extract the SVG element
        const svgElement = doc.querySelector('svg');
        
        if (!svgElement) {
            throw new Error('No SVG element found in markup');
        }

        // Add proper XML namespaces (Requirement 9.2)
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        // Set viewBox to match viewport dimensions (Requirement 9.3)
        const viewBox = `0 0 ${viewportSize.width} ${viewportSize.height}`;
        svgElement.setAttribute('viewBox', viewBox);

        // Serialize the SVG element (Requirement 9.6: preserves all paths, strokes, attributes)
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        // Add XML declaration (Requirement 9.2)
        const svgWithDeclaration = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

        // Create blob and trigger download (Requirements 9.1, 9.4)
        const blob = new Blob([svgWithDeclaration], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.svg`; // Requirement 9.4: .svg extension
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        if (error.message.startsWith('Invalid') || error.message.startsWith('No SVG') || error.message.startsWith('Failed to parse')) {
            throw error;
        }
        throw new Error(`Failed to export SVG: ${error.message}`);
    }
}

/**
 * Extract SVG markup from a preview container
 * 
 * @param {HTMLElement} previewContainer - Container element with SVG
 * @returns {string} SVG markup
 * @throws {Error} If no SVG element is found
 */
export function extractSVGFromPreview(previewContainer) {
    if (!previewContainer) {
        throw new Error('Invalid preview container');
    }

    const svgElement = previewContainer.querySelector('svg');
    
    if (!svgElement) {
        throw new Error('No SVG element found in preview');
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
}
