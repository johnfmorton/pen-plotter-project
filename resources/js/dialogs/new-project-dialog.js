/**
 * NewProjectDialog Component
 * 
 * Manages the new project creation dialog UI, including project name input
 * and viewport size selection.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { VIEWPORT_PRESETS } from '../models/project.js';

/**
 * NewProjectDialog class manages the project creation modal dialog
 */
export class NewProjectDialog {
    /**
     * @param {string} dialogId - The ID of the dialog element (default: 'new-project-dialog')
     */
    constructor(dialogId = 'new-project-dialog') {
        this.dialog = document.getElementById(dialogId);
        if (!this.dialog) {
            throw new Error(`Dialog element with ID '${dialogId}' not found`);
        }

        this.projectNameInput = document.getElementById('project-name');
        this.confirmButton = document.getElementById('confirm-new-project');
        this.cancelButton = document.getElementById('cancel-new-project');
        
        if (!this.projectNameInput || !this.confirmButton || !this.cancelButton) {
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

        // Enter key in project name input
        this.projectNameInput.addEventListener('keydown', (e) => {
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
     * Show the dialog
     */
    show() {
        // Reset form to defaults
        this.projectNameInput.value = '';
        this._setDefaultViewport();
        
        // Show dialog
        this.dialog.classList.remove('hidden');
        this.dialog.classList.add('flex');
        
        // Focus on project name input
        setTimeout(() => {
            this.projectNameInput.focus();
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
     * Set the default viewport (8.5x11)
     * 
     * @private
     */
    _setDefaultViewport() {
        const defaultRadio = this.dialog.querySelector('input[name="viewport"][value="8.5x11"]');
        if (defaultRadio) {
            defaultRadio.checked = true;
        }
    }

    /**
     * Get the selected viewport size
     * 
     * @returns {Object} ViewportSize object with width, height, and label
     */
    getSelectedViewport() {
        const selectedRadio = this.dialog.querySelector('input[name="viewport"]:checked');
        if (!selectedRadio) {
            // Default to 8.5x11 if nothing selected
            return VIEWPORT_PRESETS[0];
        }

        const label = selectedRadio.value;
        const viewport = VIEWPORT_PRESETS.find(preset => preset.label === label);
        
        if (!viewport) {
            // Fallback to default
            return VIEWPORT_PRESETS[0];
        }

        return viewport;
    }

    /**
     * Get the project name from the input
     * 
     * @returns {string} The project name (trimmed)
     */
    getProjectName() {
        return this.projectNameInput.value.trim();
    }

    /**
     * Validate the form inputs
     * 
     * @returns {Object} Validation result with isValid and error properties
     */
    validate() {
        const name = this.getProjectName();
        
        if (!name) {
            return {
                isValid: false,
                error: 'Project name is required'
            };
        }

        if (name.length > 100) {
            return {
                isValid: false,
                error: 'Project name must be 100 characters or less'
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

        const projectData = {
            name: this.getProjectName(),
            viewportSize: this.getSelectedViewport()
        };

        this.hide();
        this._triggerCallbacks('confirm', projectData);
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
     * @param {Function} callback - Function to call with project data
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
