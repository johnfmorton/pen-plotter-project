/**
 * File Utilities
 * 
 * Reusable utilities for file download and upload operations.
 * Handles browser compatibility and error cases.
 * 
 * Requirements: 4.3, 5.1, 5.2, 5.4, 9.4
 */

/**
 * Downloads data as a file with the specified filename
 * 
 * @param {string} data - Data to download
 * @param {string} filename - Filename for the download
 * @param {string} [mimeType='application/json'] - MIME type for the file
 * @returns {void}
 * @throws {Error} If download fails or browser doesn't support downloads
 * 
 * Requirements:
 * - 4.3: Trigger file download to user's system
 * - 9.4: Trigger file download with appropriate extension
 */
export function downloadFile(data, filename, mimeType = 'application/json') {
    if (!data || typeof data !== 'string') {
        throw new Error('Invalid data: must be a non-empty string');
    }

    if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename: must be a non-empty string');
    }

    try {
        // Create a Blob from the data
        const blob = new Blob([data], { type: mimeType });
        
        // Create object URL
        const url = URL.createObjectURL(blob);
        
        // Create temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Handle browser compatibility - some browsers require the link to be in the DOM
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Cleanup - remove link and revoke object URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        // Check if browser supports downloads
        if (!document.createElement('a').download !== undefined) {
            throw new Error('Browser does not support file downloads');
        }
        throw new Error(`Failed to download file: ${error.message}`);
    }
}

/**
 * Downloads JSON data as a file
 * 
 * @param {Object} jsonData - JavaScript object to serialize and download
 * @param {string} filename - Filename for the download (without extension)
 * @returns {void}
 * @throws {Error} If serialization or download fails
 * 
 * Requirements:
 * - 4.3: Trigger file download to user's system
 */
export function downloadJSON(jsonData, filename) {
    if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON data: must be an object');
    }

    try {
        // Serialize to JSON with formatting
        const jsonString = JSON.stringify(jsonData, null, 2);
        
        // Add .json extension if not present
        const fullFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
        
        // Download the file
        downloadFile(jsonString, fullFilename, 'application/json');
        
    } catch (error) {
        if (error.message.startsWith('Invalid')) {
            throw error;
        }
        throw new Error(`Failed to download JSON file: ${error.message}`);
    }
}

/**
 * Reads a file as text
 * 
 * @param {File} file - File object to read
 * @returns {Promise<string>} File contents as text
 * @throws {Error} If file reading fails
 * 
 * Requirements:
 * - 5.1: Display file selection dialog and read file
 * - 5.4: Handle file read errors
 */
export function readFileAsText(file) {
    if (!file || !(file instanceof File)) {
        throw new Error('Invalid file: must be a File object');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file: file read error occurred'));
        };
        
        reader.onabort = () => {
            reject(new Error('Failed to read file: file read was aborted'));
        };
        
        try {
            reader.readAsText(file);
        } catch (error) {
            reject(new Error(`Failed to read file: ${error.message}`));
        }
    });
}

/**
 * Parses JSON from a file
 * 
 * @param {File} file - File object to read and parse
 * @returns {Promise<Object>} Parsed JSON object
 * @throws {Error} If file reading or JSON parsing fails
 * 
 * Requirements:
 * - 5.1: Read file as text
 * - 5.2: Parse JSON and validate structure
 * - 5.4: Handle file read errors
 */
export async function readJSONFile(file) {
    if (!file || !(file instanceof File)) {
        throw new Error('Invalid file: must be a File object');
    }

    // Validate file extension
    if (!file.name.endsWith('.json')) {
        throw new Error('Invalid file type: expected .json file');
    }

    try {
        // Read file as text
        const text = await readFileAsText(file);
        
        // Parse JSON
        let jsonData;
        try {
            jsonData = JSON.parse(text);
        } catch (parseError) {
            throw new Error('Invalid JSON format: unable to parse file');
        }
        
        return jsonData;
        
    } catch (error) {
        if (error.message.startsWith('Invalid')) {
            throw error;
        }
        throw new Error(`Failed to read JSON file: ${error.message}`);
    }
}

/**
 * Creates a file input element and triggers file selection
 * 
 * @param {string} [accept='*'] - Accepted file types (e.g., '.json', 'image/*')
 * @returns {Promise<File>} Selected file
 * @throws {Error} If no file is selected
 * 
 * Requirements:
 * - 5.1: Display file selection dialog
 */
export function selectFile(accept = '*') {
    return new Promise((resolve, reject) => {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        
        // Handle file selection
        input.onchange = (event) => {
            const file = event.target.files[0];
            
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }
            
            resolve(file);
        };
        
        // Handle cancellation
        input.oncancel = () => {
            reject(new Error('File selection cancelled'));
        };
        
        // Trigger file picker
        input.click();
    });
}

/**
 * Selects and reads a JSON file
 * 
 * @returns {Promise<Object>} Parsed JSON object from selected file
 * @throws {Error} If file selection, reading, or parsing fails
 * 
 * Requirements:
 * - 5.1: Display file selection dialog
 * - 5.2: Parse JSON and validate structure
 * - 5.4: Handle file read errors
 */
export async function selectAndReadJSONFile() {
    try {
        // Select file
        const file = await selectFile('.json');
        
        // Read and parse JSON
        const jsonData = await readJSONFile(file);
        
        return jsonData;
        
    } catch (error) {
        if (error.message.startsWith('Invalid') || 
            error.message.startsWith('No file') || 
            error.message.startsWith('File selection')) {
            throw error;
        }
        throw new Error(`Failed to select and read JSON file: ${error.message}`);
    }
}
