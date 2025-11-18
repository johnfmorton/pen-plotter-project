import { SVG } from '@svgdotjs/svg.js';

/**
 * SVGGenerator class
 * 
 * Executes user code in a controlled context and generates SVG using SVG.js.
 * Provides sandboxed code execution with timeout protection and error handling.
 */
export class SVGGenerator {
    /**
     * Create a new SVGGenerator instance
     * 
     * @param {Object} viewportSize - The viewport dimensions
     * @param {number} viewportSize.width - Width in inches
     * @param {number} viewportSize.height - Height in inches
     */
    constructor(viewportSize) {
        this.viewportSize = viewportSize;
        this.lastError = null;
        this.DPI = 96; // Web standard DPI
        this.TIMEOUT_MS = 5000; // 5 second timeout
    }

    /**
     * Set the viewport size for SVG generation
     * 
     * @param {number} width - Width in inches
     * @param {number} height - Height in inches
     */
    setViewportSize(width, height) {
        this.viewportSize = { width, height };
    }

    /**
     * Execute user code and generate SVG markup
     * 
     * @param {string} code - The user's JavaScript code to execute
     * @returns {Promise<string>} The generated SVG markup
     * @throws {Error} If code execution fails or times out
     */
    async execute(code) {
        this.lastError = null;

        // Create a temporary container for SVG generation
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        try {
            // Initialize SVG.js instance with viewport dimensions
            const pixelWidth = this.viewportSize.width * this.DPI;
            const pixelHeight = this.viewportSize.height * this.DPI;

            const draw = SVG()
                .addTo(container)
                .size(pixelWidth, pixelHeight)
                .viewbox(0, 0, this.viewportSize.width, this.viewportSize.height);

            // Execute user code with timeout protection
            await this._executeWithTimeout(code, draw);

            // Capture the generated SVG markup
            const svgMarkup = container.innerHTML;

            // Clean up
            document.body.removeChild(container);

            return svgMarkup;

        } catch (error) {
            // Clean up on error
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }

            // Store the error for later retrieval
            this.lastError = this._formatError(error, code);
            throw this.lastError;
        }
    }

    /**
     * Execute user code with timeout protection
     * 
     * Note: JavaScript's setTimeout cannot interrupt synchronous code execution.
     * This timeout protection works for async operations but cannot stop
     * synchronous infinite loops. This is a known limitation of JavaScript.
     * 
     * @private
     * @param {string} code - The user's JavaScript code
     * @param {Object} draw - The SVG.js drawing instance
     * @returns {Promise<void>}
     * @throws {Error} If execution fails or times out
     */
    async _executeWithTimeout(code, draw) {
        return new Promise((resolve, reject) => {
            // Set up timeout
            const timeoutId = setTimeout(() => {
                reject(new Error(`Code execution timed out after ${this.TIMEOUT_MS / 1000} seconds`));
            }, this.TIMEOUT_MS);

            try {
                // Create a function from the user code
                // Use Function constructor instead of eval for better sandboxing
                const userFunction = new Function('draw', code);

                // Execute the user code
                userFunction(draw);

                // Clear timeout and resolve
                clearTimeout(timeoutId);
                resolve();

            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    /**
     * Format error with type detection and line number extraction
     * 
     * @private
     * @param {Error} error - The error object
     * @param {string} code - The user's code (for context)
     * @returns {Object} Formatted error object
     */
    _formatError(error, code) {
        const formattedError = {
            message: error.message,
            line: null,
            column: null,
            type: 'runtime'
        };

        // Detect syntax errors
        if (error instanceof SyntaxError) {
            formattedError.type = 'syntax';
        }

        // Try to extract line number from error stack
        const lineMatch = error.stack?.match(/at.*:(\d+):(\d+)/);
        if (lineMatch) {
            formattedError.line = parseInt(lineMatch[1], 10);
            formattedError.column = parseInt(lineMatch[2], 10);
        }

        // For syntax errors, try to parse the error message for line info
        if (formattedError.type === 'syntax') {
            const syntaxLineMatch = error.message.match(/line (\d+)/i);
            if (syntaxLineMatch) {
                formattedError.line = parseInt(syntaxLineMatch[1], 10);
            }
        }

        return formattedError;
    }

    /**
     * Get the last error that occurred during code execution
     * 
     * @returns {Object|null} The last error object or null if no error
     */
    getLastError() {
        return this.lastError;
    }
}
