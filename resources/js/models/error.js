/**
 * Error Model
 * 
 * Defines the structure for code execution errors in the SVG Plotter Editor.
 * 
 * @typedef {Object} CodeError
 * @property {string} message - Error message
 * @property {number|null} line - Line number where error occurred (null if unknown)
 * @property {number|null} column - Column number where error occurred (null if unknown)
 * @property {'syntax'|'runtime'} type - Type of error
 */

/**
 * Creates a new CodeError object
 * 
 * @param {string} message - Error message
 * @param {'syntax'|'runtime'} type - Error type
 * @param {number|null} [line=null] - Line number
 * @param {number|null} [column=null] - Column number
 * @returns {CodeError} New error object
 */
export function createCodeError(message, type, line = null, column = null) {
    return {
        message,
        line,
        column,
        type
    };
}

/**
 * Parses a JavaScript Error object into a CodeError
 * 
 * @param {Error} error - JavaScript error object
 * @param {'syntax'|'runtime'} type - Error type
 * @returns {CodeError} Parsed error object
 */
export function parseError(error, type) {
    let line = null;
    let column = null;
    
    // Try to extract line and column from error stack
    if (error.stack) {
        // Match patterns like "at line:column" or "<anonymous>:line:column"
        const stackMatch = error.stack.match(/:(\d+):(\d+)/);
        if (stackMatch) {
            line = parseInt(stackMatch[1], 10);
            column = parseInt(stackMatch[2], 10);
        }
    }
    
    // For syntax errors, try to extract from message
    if (type === 'syntax' && !line) {
        const messageMatch = error.message.match(/line (\d+)/i);
        if (messageMatch) {
            line = parseInt(messageMatch[1], 10);
        }
    }
    
    return createCodeError(error.message, type, line, column);
}

/**
 * Formats a CodeError for display to the user
 * 
 * @param {CodeError} error - Error to format
 * @returns {string} Formatted error message
 */
export function formatError(error) {
    let formatted = `${error.type === 'syntax' ? 'Syntax Error' : 'Runtime Error'}: ${error.message}`;
    
    if (error.line !== null) {
        formatted += ` (line ${error.line}`;
        if (error.column !== null) {
            formatted += `, column ${error.column}`;
        }
        formatted += ')';
    }
    
    return formatted;
}

/**
 * Validates a CodeError object
 * 
 * @param {any} error - Object to validate
 * @returns {boolean} True if valid CodeError
 */
export function isValidCodeError(error) {
    return (
        error &&
        typeof error === 'object' &&
        typeof error.message === 'string' &&
        (error.line === null || typeof error.line === 'number') &&
        (error.column === null || typeof error.column === 'number') &&
        (error.type === 'syntax' || error.type === 'runtime')
    );
}
