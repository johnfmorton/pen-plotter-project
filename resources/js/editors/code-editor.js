/**
 * CodeEditor Component
 * 
 * Provides a Monaco Editor instance for JavaScript code editing with:
 * - Syntax highlighting
 * - Error highlighting
 * - Auto-save functionality
 * - Code change event handling
 * 
 * Requirements: 1.1, 1.4, 7.1, 7.5, 8.1
 */

/**
 * CodeEditor class manages the Monaco Editor instance
 */
export class CodeEditor {
    /**
     * @param {HTMLElement} containerElement - The DOM element to mount the editor
     */
    constructor(containerElement) {
        if (!containerElement) {
            throw new Error('Container element is required for CodeEditor');
        }

        this.container = containerElement;
        this.editor = null;
        this.changeListeners = [];
        this.autoSaveTimer = null;
        this.autoSaveDelay = 1000; // 1 second debounce
        this.decorations = []; // Store error decorations
    }

    /**
     * Initialize the Monaco Editor instance
     * 
     * @param {string} initialValue - Initial code content
     * @returns {void}
     */
    init(initialValue = '') {
        // Ensure Monaco is available
        if (!window.monaco) {
            throw new Error('Monaco Editor is not loaded');
        }

        // Create Monaco Editor instance
        this.editor = window.monaco.editor.create(this.container, {
            value: initialValue,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 14,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
        });

        // Set up change listener for auto-save and custom callbacks
        this.editor.onDidChangeModelContent(() => {
            this._handleCodeChange();
        });
    }

    /**
     * Get the current code value from the editor
     * 
     * @returns {string} The current code content
     */
    getValue() {
        if (!this.editor) {
            throw new Error('Editor is not initialized');
        }
        return this.editor.getValue();
    }

    /**
     * Set the code value in the editor
     * 
     * @param {string} code - The code to set
     * @returns {void}
     */
    setValue(code) {
        if (!this.editor) {
            throw new Error('Editor is not initialized');
        }
        this.editor.setValue(code);
    }

    /**
     * Register an event listener for code changes
     * 
     * @param {string} event - Event name (currently only 'change' is supported)
     * @param {Function} callback - Callback function to execute on event
     * @returns {void}
     */
    on(event, callback) {
        if (event === 'change') {
            if (typeof callback !== 'function') {
                throw new Error('Callback must be a function');
            }
            this.changeListeners.push(callback);
        } else {
            throw new Error(`Unsupported event: ${event}`);
        }
    }

    /**
     * Highlight an error in the editor
     * 
     * @param {number} line - Line number where the error occurred (1-indexed)
     * @param {string} message - Error message to display
     * @returns {void}
     */
    highlightError(line, message) {
        if (!this.editor) {
            throw new Error('Editor is not initialized');
        }

        // Clear previous error decorations
        this.clearErrors();

        // Create error decoration
        const decorations = [
            {
                range: new window.monaco.Range(line, 1, line, 1),
                options: {
                    isWholeLine: true,
                    className: 'error-line',
                    glyphMarginClassName: 'error-glyph',
                    hoverMessage: { value: message },
                    glyphMarginHoverMessage: { value: message },
                    linesDecorationsClassName: 'error-line-decoration',
                }
            }
        ];

        // Apply decorations
        this.decorations = this.editor.deltaDecorations([], decorations);

        // Add CSS for error styling if not already present
        this._ensureErrorStyles();
    }

    /**
     * Clear all error highlights from the editor
     * 
     * @returns {void}
     */
    clearErrors() {
        if (!this.editor) {
            return;
        }

        if (this.decorations.length > 0) {
            this.decorations = this.editor.deltaDecorations(this.decorations, []);
        }
    }

    /**
     * Handle code changes - trigger auto-save and notify listeners
     * 
     * @private
     * @returns {void}
     */
    _handleCodeChange() {
        // Clear existing auto-save timer
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // Set up new auto-save timer (debounced)
        this.autoSaveTimer = setTimeout(() => {
            this._triggerAutoSave();
        }, this.autoSaveDelay);

        // Notify all change listeners immediately
        const code = this.getValue();
        this.changeListeners.forEach(callback => {
            try {
                callback(code);
            } catch (error) {
                console.error('Error in change listener:', error);
            }
        });
    }

    /**
     * Trigger auto-save event
     * 
     * @private
     * @returns {void}
     */
    _triggerAutoSave() {
        // Dispatch custom event for auto-save
        const event = new CustomEvent('autosave', {
            detail: { code: this.getValue() }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * Ensure error styling CSS is present
     * 
     * @private
     * @returns {void}
     */
    _ensureErrorStyles() {
        // Check if styles already exist
        if (document.getElementById('code-editor-error-styles')) {
            return;
        }

        // Create style element
        const style = document.createElement('style');
        style.id = 'code-editor-error-styles';
        style.textContent = `
            .error-line {
                background-color: rgba(255, 0, 0, 0.1);
            }
            .error-line-decoration {
                background-color: #ff0000;
                width: 3px !important;
                margin-left: 3px;
            }
            .error-glyph {
                background-color: #ff0000;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Dispose of the editor instance and clean up resources
     * 
     * @returns {void}
     */
    dispose() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }

        this.changeListeners = [];
        this.decorations = [];
    }
}
