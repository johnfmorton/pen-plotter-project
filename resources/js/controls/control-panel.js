/**
 * ControlPanel Component
 * 
 * Manages UI controls (buttons) and their interactions for the SVG Plotter Editor.
 * Provides buttons for: New Project, Save, Open, Regenerate, and Export.
 * 
 * Requirements: 6.4
 */

/**
 * ControlPanel class manages button elements and their event handlers
 */
export class ControlPanel {
    /**
     * @param {HTMLElement} containerElement - The DOM element to contain the control buttons
     */
    constructor(containerElement) {
        if (!containerElement) {
            throw new Error('Container element is required for ControlPanel');
        }

        this.container = containerElement;
        this.buttons = {};
        this.callbacks = {
            newProject: [],
            save: [],
            open: [],
            regenerate: [],
            export: []
        };

        this._initializeButtons();
    }

    /**
     * Initialize all control buttons
     * 
     * @private
     */
    _initializeButtons() {
        // Clear container
        this.container.innerHTML = '';

        // Create button container with flex layout
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex flex-wrap gap-2 p-4';

        // Define buttons with their properties
        const buttonConfigs = [
            { id: 'newProject', label: 'New Project', icon: '📄', primary: false },
            { id: 'save', label: 'Save', icon: '💾', primary: false },
            { id: 'open', label: 'Open', icon: '📂', primary: false },
            { id: 'regenerate', label: 'Regenerate', icon: '🔄', primary: true },
            { id: 'export', label: 'Export SVG', icon: '📥', primary: false }
        ];

        // Create each button
        buttonConfigs.forEach(config => {
            const button = this._createButton(config);
            this.buttons[config.id] = button;
            buttonContainer.appendChild(button);
        });

        this.container.appendChild(buttonContainer);
    }

    /**
     * Create a button element with Tailwind CSS styling
     * 
     * @private
     * @param {Object} config - Button configuration
     * @param {string} config.id - Button identifier
     * @param {string} config.label - Button label text
     * @param {string} config.icon - Button icon (emoji)
     * @param {boolean} config.primary - Whether this is a primary button
     * @returns {HTMLButtonElement} The created button element
     */
    _createButton(config) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.action = config.id;

        // Base classes for all buttons
        const baseClasses = [
            'inline-flex',
            'items-center',
            'gap-2',
            'px-4',
            'py-2',
            'rounded-md',
            'font-medium',
            'text-sm',
            'transition-colors',
            'duration-200',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-offset-2',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed'
        ];

        // Primary button styling (blue)
        const primaryClasses = [
            'bg-blue-600',
            'text-white',
            'hover:bg-blue-700',
            'focus:ring-blue-500',
            'disabled:hover:bg-blue-600'
        ];

        // Secondary button styling (gray)
        const secondaryClasses = [
            'bg-gray-200',
            'text-gray-800',
            'hover:bg-gray-300',
            'focus:ring-gray-500',
            'disabled:hover:bg-gray-200'
        ];

        // Apply classes based on button type
        const classes = [
            ...baseClasses,
            ...(config.primary ? primaryClasses : secondaryClasses)
        ];

        button.className = classes.join(' ');

        // Create button content with icon and label
        const iconSpan = document.createElement('span');
        iconSpan.textContent = config.icon;
        iconSpan.setAttribute('aria-hidden', 'true');

        const labelSpan = document.createElement('span');
        labelSpan.textContent = config.label;

        button.appendChild(iconSpan);
        button.appendChild(labelSpan);

        // Add click event listener
        button.addEventListener('click', () => {
            if (!button.disabled) {
                this._triggerCallbacks(config.id);
            }
        });

        return button;
    }

    /**
     * Register a callback for the New Project button
     * 
     * @param {Function} callback - Function to call when button is clicked
     */
    onNewProject(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callbacks.newProject.push(callback);
    }

    /**
     * Register a callback for the Save button
     * 
     * @param {Function} callback - Function to call when button is clicked
     */
    onSave(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callbacks.save.push(callback);
    }

    /**
     * Register a callback for the Open button
     * 
     * @param {Function} callback - Function to call when button is clicked
     */
    onOpen(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callbacks.open.push(callback);
    }

    /**
     * Register a callback for the Regenerate button
     * 
     * @param {Function} callback - Function to call when button is clicked
     */
    onRegenerate(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callbacks.regenerate.push(callback);
    }

    /**
     * Register a callback for the Export button
     * 
     * @param {Function} callback - Function to call when button is clicked
     */
    onExport(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        this.callbacks.export.push(callback);
    }

    /**
     * Set the enabled/disabled state of a button
     * 
     * @param {string} button - Button identifier ('newProject', 'save', 'open', 'regenerate', 'export')
     * @param {boolean} enabled - Whether the button should be enabled
     */
    setButtonState(button, enabled) {
        if (!this.buttons[button]) {
            throw new Error(`Unknown button: ${button}`);
        }

        this.buttons[button].disabled = !enabled;
    }

    /**
     * Trigger all callbacks for a specific button
     * 
     * @private
     * @param {string} buttonId - Button identifier
     */
    _triggerCallbacks(buttonId) {
        const callbacks = this.callbacks[buttonId];
        if (!callbacks) {
            return;
        }

        callbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error(`Error in ${buttonId} callback:`, error);
            }
        });
    }

    /**
     * Get a button element by its identifier
     * 
     * @param {string} buttonId - Button identifier
     * @returns {HTMLButtonElement|undefined} The button element
     */
    getButton(buttonId) {
        return this.buttons[buttonId];
    }

    /**
     * Enable all buttons
     */
    enableAll() {
        Object.keys(this.buttons).forEach(buttonId => {
            this.setButtonState(buttonId, true);
        });
    }

    /**
     * Disable all buttons
     */
    disableAll() {
        Object.keys(this.buttons).forEach(buttonId => {
            this.setButtonState(buttonId, false);
        });
    }
}
