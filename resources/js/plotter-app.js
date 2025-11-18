/**
 * PlotterApp - Main Application Orchestrator
 * 
 * Coordinates all components of the SVG Plotter Editor:
 * - ProjectManager: Handles project lifecycle and persistence
 * - SVGGenerator: Executes code and generates SVG
 * - CodeEditor: Manages code editing interface
 * - PreviewPanel: Displays generated SVG
 * - ControlPanel: Manages UI controls
 * - NewProjectDialog: Handles new project creation
 * 
 * Requirements: 2.1, 2.4, 3.1, 4.3, 5.1, 5.5, 7.2, 7.3, 9.1
 */

import { ProjectManager } from './managers/project-manager.js';
import { SVGGenerator } from './generators/svg-generator.js';
import { CodeEditor } from './editors/code-editor.js';
import { PreviewPanel } from './preview/preview-panel.js';
import { ControlPanel } from './controls/control-panel.js';
import { NewProjectDialog } from './dialogs/new-project-dialog.js';
import { ErrorDisplay } from './errors/error-display.js';
import { VIEWPORT_PRESETS } from './models/project.js';
import { exportSVG } from './utils/svg-exporter.js';

/**
 * Default starter code for new projects
 */
const DEFAULT_CODE = `// Welcome to SVG Plotter Editor!
// Use the 'draw' object to create SVG graphics with SVG.js
// Documentation: https://svgjs.dev/

// Example: Draw a simple circle pattern
const centerX = draw.viewbox().width / 2;
const centerY = draw.viewbox().height / 2;
const radius = 1;

for (let i = 0; i < 12; i++) {
  const angle = (i * 30) * Math.PI / 180;
  const x = centerX + Math.cos(angle) * 2;
  const y = centerY + Math.sin(angle) * 2;
  
  draw.circle(radius)
    .center(x, y)
    .fill('none')
    .stroke({ width: 0.02, color: '#000' });
}

// Add a center circle
draw.circle(radius * 1.5)
  .center(centerX, centerY)
  .fill('none')
  .stroke({ width: 0.02, color: '#000' });
`;

/**
 * PlotterApp class orchestrates the entire application
 */
export class PlotterApp {
    constructor() {
        this.projectManager = null;
        this.svgGenerator = null;
        this.codeEditor = null;
        this.previewPanel = null;
        this.controlPanel = null;
        this.newProjectDialog = null;
        this.errorDisplay = null;
        this.currentProject = null;
        this.viewportDisplay = null;
    }

    /**
     * Initialize the application and all components
     */
    init() {
        console.log('Initializing PlotterApp components...');

        // Get DOM elements
        const codeEditorContainer = document.getElementById('code-editor');
        const previewPanelContainer = document.getElementById('preview-panel');
        const controlPanelContainer = document.getElementById('control-panel');
        const errorDisplayContainer = document.getElementById('error-display');
        
        if (!codeEditorContainer || !previewPanelContainer || !controlPanelContainer || !errorDisplayContainer) {
            throw new Error('Required DOM elements not found');
        }

        // Initialize viewport display
        this.viewportDisplay = document.getElementById('viewport-display');

        // Initialize ErrorDisplay
        this.errorDisplay = new ErrorDisplay(errorDisplayContainer);

        // Initialize ProjectManager
        this.projectManager = new ProjectManager();

        // Load initial state from localStorage or use default
        const savedProject = this.projectManager.loadFromLocalStorage();
        
        if (savedProject) {
            console.log('Loaded project from localStorage:', savedProject.name);
            this.currentProject = savedProject;
        } else {
            console.log('No saved project found, creating default project');
            this.currentProject = this.projectManager.createProject(
                'Untitled Project',
                VIEWPORT_PRESETS[0], // Default to 8.5x11
                DEFAULT_CODE
            );
        }

        // Initialize SVGGenerator with current viewport
        this.svgGenerator = new SVGGenerator(this.currentProject.viewportSize);

        // Initialize PreviewPanel with current viewport
        this.previewPanel = new PreviewPanel(
            previewPanelContainer,
            this.currentProject.viewportSize
        );

        // Initialize CodeEditor
        this.codeEditor = new CodeEditor(codeEditorContainer);
        this.codeEditor.init(this.currentProject.code);

        // Initialize ControlPanel
        this.controlPanel = new ControlPanel(controlPanelContainer);

        // Initialize NewProjectDialog
        this.newProjectDialog = new NewProjectDialog();

        // Wire up event handlers
        this._wireEventHandlers();

        // Update viewport display
        this._updateViewportDisplay();

        // Initial render
        this.handleRegenerate();

        console.log('PlotterApp initialization complete');
    }

    /**
     * Wire up all event handlers between components
     * 
     * @private
     */
    _wireEventHandlers() {
        // Control Panel button handlers
        this.controlPanel.onNewProject(() => this.handleNewProject());
        this.controlPanel.onSave(() => this.handleSave());
        this.controlPanel.onOpen(() => this.handleOpen());
        this.controlPanel.onRegenerate(() => this.handleRegenerate());
        this.controlPanel.onExport(() => this.handleExport());

        // Code Editor auto-save handler
        this.codeEditor.container.addEventListener('autosave', (event) => {
            this._handleAutoSave(event.detail.code);
        });

        // New Project Dialog handlers
        this.newProjectDialog.onConfirm((projectData) => {
            this._handleNewProjectConfirm(projectData);
        });
    }

    /**
     * Handle New Project button click
     * Shows the new project dialog
     * 
     * Requirement: 3.1
     */
    handleNewProject() {
        console.log('Opening new project dialog');
        this.newProjectDialog.show();
    }

    /**
     * Handle new project confirmation from dialog
     * 
     * @private
     * @param {Object} projectData - Project data from dialog
     * @param {string} projectData.name - Project name
     * @param {Object} projectData.viewportSize - Viewport dimensions
     * 
     * Requirements: 3.1, 3.5, 7.2
     */
    _handleNewProjectConfirm(projectData) {
        console.log('Creating new project:', projectData.name);

        // Create new project with empty code
        this.currentProject = this.projectManager.createProject(
            projectData.name,
            projectData.viewportSize,
            DEFAULT_CODE
        );

        // Update SVG generator viewport
        this.svgGenerator.setViewportSize(
            projectData.viewportSize.width,
            projectData.viewportSize.height
        );

        // Update preview panel viewport
        this.previewPanel.setViewportSize(
            projectData.viewportSize.width,
            projectData.viewportSize.height
        );

        // Update code editor with default code
        this.codeEditor.setValue(DEFAULT_CODE);
        this.codeEditor.clearErrors();

        // Clear preview and errors
        this.previewPanel.clear();
        this.errorDisplay.clearError();

        // Update viewport display
        this._updateViewportDisplay();

        // Save to localStorage
        this.projectManager.saveToLocalStorage(this.currentProject);

        // Regenerate preview
        this.handleRegenerate();
    }

    /**
     * Handle Save button click
     * Saves the current project to a JSON file and triggers download
     * 
     * Requirements: 4.1, 4.3
     */
    handleSave() {
        console.log('Saving project to file');

        try {
            // Update current project with latest code
            this.currentProject.code = this.codeEditor.getValue();

            // Save to file (triggers download)
            this.projectManager.saveToFile(this.currentProject);

            console.log('Project saved successfully');
        } catch (error) {
            console.error('Failed to save project:', error);
            alert(`Failed to save project: ${error.message}`);
        }
    }

    /**
     * Handle Open button click
     * Opens a file picker and loads a project file
     * 
     * Requirements: 5.1, 5.5, 7.2, 7.3
     */
    handleOpen() {
        console.log('Opening file picker');

        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            try {
                // Load project from file
                const project = await this.projectManager.loadFromFile(file);
                
                console.log('Project loaded successfully:', project.name);

                // Update current project
                this.currentProject = project;

                // Update SVG generator viewport
                this.svgGenerator.setViewportSize(
                    project.viewportSize.width,
                    project.viewportSize.height
                );

                // Update preview panel viewport
                this.previewPanel.setViewportSize(
                    project.viewportSize.width,
                    project.viewportSize.height
                );

                // Update code editor
                this.codeEditor.setValue(project.code);
                this.codeEditor.clearErrors();
                
                // Clear any displayed errors
                this.errorDisplay.clearError();

                // Update viewport display
                this._updateViewportDisplay();

                // Save to localStorage (Requirement 7.4)
                this.projectManager.saveToLocalStorage(project);

                // Regenerate preview (Requirement 5.5)
                this.handleRegenerate();

            } catch (error) {
                console.error('Failed to load project:', error);
                alert(`Failed to load project: ${error.message}`);
            }
        });

        // Trigger file picker
        fileInput.click();
    }

    /**
     * Handle Regenerate button click
     * Executes the current code and updates the preview
     * 
     * Requirements: 2.1, 2.4
     */
    async handleRegenerate() {
        console.log('Regenerating SVG preview');

        // Get current code
        const code = this.codeEditor.getValue();

        // Clear previous errors
        this.codeEditor.clearErrors();
        this.errorDisplay.clearError();

        try {
            // Execute code and generate SVG
            const svgMarkup = await this.svgGenerator.execute(code);

            // Render in preview panel
            this.previewPanel.render(svgMarkup);

            console.log('SVG generated successfully');

        } catch (error) {
            console.error('SVG generation failed:', error);

            // Display error using ErrorDisplay component (Requirements 8.1, 8.2, 8.3)
            this.errorDisplay.showError(error);

            // Highlight error in code editor if line number is available
            if (error.line) {
                this.codeEditor.highlightError(error.line, error.message);
            }
        }
    }

    /**
     * Handle Export button click
     * Exports the current SVG to a file
     * 
     * Requirements: 9.1, 9.2, 9.3, 9.4, 9.6
     */
    async handleExport() {
        console.log('Exporting SVG');

        try {
            // Get current code
            const code = this.codeEditor.getValue();

            // Generate SVG
            const svgMarkup = await this.svgGenerator.execute(code);

            // Export using the SVG exporter utility
            exportSVG(
                svgMarkup,
                this.currentProject.name,
                this.currentProject.viewportSize
            );

            console.log('SVG exported successfully');

        } catch (error) {
            console.error('Failed to export SVG:', error);
            alert(`Failed to export SVG: ${error.message}`);
        }
    }

    /**
     * Handle auto-save event from code editor
     * Saves current state to localStorage
     * 
     * @private
     * @param {string} code - Current code from editor
     * 
     * Requirement: 7.1
     */
    _handleAutoSave(code) {
        // Update current project code
        this.currentProject.code = code;

        // Save to localStorage
        const success = this.projectManager.saveToLocalStorage(this.currentProject);

        if (success) {
            console.log('Auto-saved to localStorage');
        } else {
            console.warn('Auto-save to localStorage failed');
        }
    }

    /**
     * Update the viewport display in the header
     * 
     * @private
     */
    _updateViewportDisplay() {
        if (this.viewportDisplay && this.currentProject) {
            const { width, height } = this.currentProject.viewportSize;
            this.viewportDisplay.textContent = `${width}" × ${height}"`;
        }
    }



    /**
     * Get the current project
     * 
     * @returns {Object} Current project object
     */
    getCurrentProject() {
        return this.currentProject;
    }
}
