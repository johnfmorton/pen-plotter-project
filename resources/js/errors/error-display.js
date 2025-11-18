/**
 * ErrorDisplay class
 * 
 * Manages the display of code execution errors with proper formatting,
 * type distinction, and line number information.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export class ErrorDisplay {
    /**
     * Create a new ErrorDisplay instance
     * 
     * @param {HTMLElement} containerElement - The DOM element to contain error messages
     */
    constructor(containerElement) {
        if (!containerElement) {
            throw new Error('Container element is required for ErrorDisplay');
        }
        
        this.container = containerElement;
        this._initializeContainer();
    }

    /**
     * Initialize the container with proper styling
     * 
     * @private
     */
    _initializeContainer() {
        // Set up base container styles
        this.container.className = 'error-display hidden';
        
        // Create inner content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'error-content';
        
        this.container.appendChild(this.contentContainer);
        
        // Apply default styles
        this._applyStyles();
    }

    /**
     * Apply styling to the error display
     * 
     * @private
     */
    _applyStyles() {
        // Container styles
        Object.assign(this.container.style, {
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: '#fee',
            border: '2px solid #fcc',
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5'
        });
        
        // Content container styles
        Object.assign(this.contentContainer.style, {
            color: '#c00',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
        });
    }

    /**
     * Show an error message with type distinction and line number
     * 
     * Requirements: 8.1, 8.2, 8.3
     * 
     * @param {Object|string} error - Error object or error message string
     * @param {string} [error.message] - Error message
     * @param {'syntax'|'runtime'} [error.type] - Error type
     * @param {number|null} [error.line] - Line number where error occurred
     * @param {number|null} [error.column] - Column number where error occurred
     */
    showError(error) {
        // Handle string errors
        if (typeof error === 'string') {
            this._displayFormattedError('Error', error, null, null);
            return;
        }
        
        // Handle error objects
        const errorType = error.type || 'runtime';
        const message = error.message || 'An unknown error occurred';
        const line = error.line || null;
        const column = error.column || null;
        
        // Format and display the error
        this._displayFormattedError(errorType, message, line, column);
    }

    /**
     * Display a formatted error message
     * 
     * @private
     * @param {'syntax'|'runtime'|'Error'} type - Error type
     * @param {string} message - Error message
     * @param {number|null} line - Line number
     * @param {number|null} column - Column number
     */
    _displayFormattedError(type, message, line, column) {
        // Clear previous content
        this.contentContainer.innerHTML = '';
        
        // Create error type header
        const typeHeader = document.createElement('div');
        typeHeader.style.fontWeight = 'bold';
        typeHeader.style.marginBottom = '0.5rem';
        typeHeader.style.fontSize = '1rem';
        
        // Set header text based on error type (Requirement 8.2)
        if (type === 'syntax') {
            typeHeader.textContent = '⚠️ Syntax Error';
            typeHeader.style.color = '#d00';
        } else if (type === 'runtime') {
            typeHeader.textContent = '❌ Runtime Error';
            typeHeader.style.color = '#c00';
        } else {
            typeHeader.textContent = '⚠️ Error';
            typeHeader.style.color = '#c00';
        }
        
        this.contentContainer.appendChild(typeHeader);
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.style.marginBottom = '0.5rem';
        messageContainer.textContent = message;
        this.contentContainer.appendChild(messageContainer);
        
        // Add line number information if available (Requirement 8.1)
        if (line !== null) {
            const locationContainer = document.createElement('div');
            locationContainer.style.marginTop = '0.75rem';
            locationContainer.style.paddingTop = '0.75rem';
            locationContainer.style.borderTop = '1px solid #fcc';
            locationContainer.style.fontWeight = 'bold';
            locationContainer.style.color = '#900';
            
            let locationText = `📍 Line ${line}`;
            if (column !== null) {
                locationText += `, Column ${column}`;
            }
            
            locationContainer.textContent = locationText;
            this.contentContainer.appendChild(locationContainer);
        }
        
        // Show the container (Requirement 8.3)
        this.container.classList.remove('hidden');
        this.container.style.display = 'block';
    }

    /**
     * Clear the error display
     * 
     * Requirement: 8.4
     */
    clearError() {
        this.contentContainer.innerHTML = '';
        this.container.classList.add('hidden');
        this.container.style.display = 'none';
    }

    /**
     * Check if an error is currently displayed
     * 
     * @returns {boolean} True if error is displayed
     */
    hasError() {
        return !this.container.classList.contains('hidden');
    }

    /**
     * Update the styling of the error display
     * Useful for customizing appearance
     * 
     * @param {Object} styles - CSS styles to apply
     */
    updateStyles(styles) {
        Object.assign(this.container.style, styles);
    }
}
