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
        // Set up base container styles with Tailwind classes
        this.container.className = 'error-display hidden p-4 mt-4 font-mono text-sm leading-relaxed';
        
        // Create inner content container
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'error-content whitespace-pre-wrap break-words';
        
        this.container.appendChild(this.contentContainer);
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
        typeHeader.className = 'font-bold mb-2 text-base';
        
        // Set header text based on error type (Requirement 8.2)
        if (type === 'syntax') {
            typeHeader.textContent = '⚠️ Syntax Error';
            typeHeader.className += ' text-red-700';
        } else if (type === 'runtime') {
            typeHeader.textContent = '❌ Runtime Error';
            typeHeader.className += ' text-red-800';
        } else {
            typeHeader.textContent = '⚠️ Error';
            typeHeader.className += ' text-red-800';
        }
        
        this.contentContainer.appendChild(typeHeader);
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = 'mb-2 text-red-900';
        messageContainer.textContent = message;
        this.contentContainer.appendChild(messageContainer);
        
        // Add line number information if available (Requirement 8.1)
        if (line !== null) {
            const locationContainer = document.createElement('div');
            locationContainer.className = 'mt-3 pt-3 border-t border-red-300 font-bold text-red-900';
            
            let locationText = `📍 Line ${line}`;
            if (column !== null) {
                locationText += `, Column ${column}`;
            }
            
            locationContainer.textContent = locationText;
            this.contentContainer.appendChild(locationContainer);
        }
        
        // Show the container (Requirement 8.3)
        this.container.classList.remove('hidden');
        this.container.classList.add('block');
    }

    /**
     * Clear the error display
     * 
     * Requirement: 8.4
     */
    clearError() {
        this.contentContainer.innerHTML = '';
        this.container.classList.add('hidden');
        this.container.classList.remove('block');
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
