/**
 * SaveDialog Component
 * 
 * Manages the save file dialog UI, allowing users to specify a filename
 * before saving their project.
 */

/**
 * SaveDialog class manages the save file modal dialog
 */
export class SaveDialog {
    /**
     * @param {string} dialogId - The ID of the dialog element (default: 'save-dialog')
     */
    constructor(dialogId = 'save-dialog') {
        this.dialog = document.getElementById(dialogId);
        if (!this.dialog) {
            throw new Error(`Dialog element with ID '${dialogId}' not found`);
        }

        this.filenameInput = document.getElementById('save-filename');
        this.confirmButton = document.getElementById('confirm-save');
        this.cancelButton = document.getElementById('cancel-save');
        
        if (!this.filenameInput || !this.confirmButton || !this.cancelButton) {
            throw new Error('Required dialog elements not found');
        }

        this.callbacks = {
            confirm: [],
            cancel: []
        };

        this._initializeEventListeners();
    }

    /**
     * Initialize event listeners for dialog interactions
     * 
     * @private
     */
    _initializeEventListeners() {
        // Confirm button click
        this.confirmButton.addEventListener('click', () => {
            this._handleConfirm();
        });

        // Cancel button click
        this.cancelButton.addEventListener('click', () => {
            this._handleCancel();
        });

        // Enter key in filename input
        this.filenameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this._handleConfirm();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this._handleCancel();
            }
        });

        // Escape key to close dialog
        this.dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this._handleCancel();
            }
        });

        // Click outside dialog to close
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this._handleCancel();
            }
        });
    }

    /**
     * Show the dialog with a default filename
     * 
     * @param {string} defaultFilename - Default filename to populate
     */
    show(defaultFilename = 'untitled') {
        // Set default filename (without extension)
        this.filenameInput.value = defaultFilename;
        
        // Show dialog
        this.dialog.classList.remove('hidden');
        this.dialog.classList.add('flex');
        
        // Focus on filename input and select all text
        setTimeout(() => {
            this.filenameInput.focus();
            this.filenameInput.select();
        }, 100);
    }

    /**
     * Hide the dialog
     */
    hide() {
        this.dialog.classList.remove('flex');
        this.dialog.classList.add('hidden');
    }

    /**
     * Get the filename from the input
     * 
     * @returns {string} The filename (trimmed, without extension)
     */
    getFilename() {
        return this.filenameInput.value.trim();
    }

    /**
     * Validate the filename input
     * 
     * @returns {Object} Validation result with isValid and error properties
     */
    validate() {
        const filename = this.getFilename();
        
        if (!filename) {
            return {
                isValid: false,
                error: 'Filename is required'
            };
        }

        if (filename.length > 255) {
            return {
                isValid: false,
                error: 'Filename must be 255 characters or less'
            };
        }

        // Check for invalid filename characters
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(filename)) {
            return {
                isValid: false,
                error: 'Filename contains invalid characters'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    /**
     * Handle confirm button click
     * 
     * @private
     */
    _handleConfirm() {
        const validation = this.validate();
        
        if (!validation.isValid) {
            alert(validation.error);
            return;
        }

        const filename = this.getFilename();
        this.hide();
        this._triggerCallbacks('confirm', filename);
    }

    /**
     * Handle cancel button click
     * 
     * @private
     */
    _handleCancel() {
        this.hide();
        this._triggerCallbacks('cancel');
    }

    /**
     * Register a callback for when the dialog is confirmed
     * 
     * @param {Function} callback - Function to call with filename
     */
    onConfirm(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callbacks.confirm.push(callback);
    }

    /**
     * Register a callback for when the dialog is cancelled
     * 
     * @param {Function} callback - Function to call when cancelled
     */
    onCancel(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callbacks.cancel.push(callback);
    }

    /**
     * Trigger all callbacks for a specific event
     * 
     * @private
     * @param {string} event - Event name ('confirm' or 'cancel')
     * @param {*} data - Data to pass to callbacks
     */
    _triggerCallbacks(event, data) {
        const callbacks = this.callbacks[event];
        if (!callbacks) {
            return;
        }

        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} callback:`, error);
            }
        });
    }

    /**
     * Check if the dialog is currently visible
     * 
     * @returns {boolean} True if dialog is visible
     */
    isVisible() {
        return !this.dialog.classList.contains('hidden');
    }
}
