/**
 * ProjectManager
 * 
 * Manages project lifecycle including creation, file operations,
 * and localStorage persistence for the SVG Plotter Editor.
 */

import { createProject, touchProject, isValidProject, VIEWPORT_PRESETS } from '../models/project.js';
import { 
    saveProjectToLocalStorage, 
    loadProjectFromLocalStorage, 
    clearLocalStorage 
} from '../utils/local-storage.js';

/**
 * ProjectManager class handles all project-related operations
 */
export class ProjectManager {
    constructor() {
        this.currentProject = null;
    }

    /**
     * Creates a new project with the given name and viewport size
     * 
     * @param {string} name - Project name
     * @param {import('../models/project').ViewportSize} viewportSize - Viewport dimensions
     * @param {string} [code=''] - Initial code
     * @returns {import('../models/project').Project} New project object
     */
    createProject(name, viewportSize, code = '') {
        const project = createProject(name, viewportSize, code);
        this.currentProject = project;
        return project;
    }

    /**
     * Saves the project to a JSON file and triggers download
     * 
     * @param {import('../models/project').Project} project - Project to save
     * @returns {void}
     * @throws {Error} If project is invalid or save fails
     */
    saveToFile(project) {
        if (!isValidProject(project)) {
            throw new Error('Invalid project: cannot save to file');
        }

        try {
            // Update the updatedAt timestamp
            const updatedProject = touchProject(project);
            
            // Serialize project to JSON with formatting
            const projectJson = JSON.stringify(updatedProject, null, 2);
            
            // Create a Blob from the JSON data
            const blob = new Blob([projectJson], { type: 'application/json' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${project.name}.json`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            throw new Error(`Failed to save project to file: ${error.message}`);
        }
    }

    /**
     * Loads a project from a file
     * 
     * @param {File} file - File object to load
     * @returns {Promise<import('../models/project').Project>} Loaded project
     * @throws {Error} If file is invalid or parsing fails
     */
    async loadFromFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!file.name.endsWith('.json')) {
            throw new Error('Invalid file type: expected .json file');
        }

        try {
            // Read file as text
            const text = await this.readFileAsText(file);
            
            // Parse JSON
            let project;
            try {
                project = JSON.parse(text);
            } catch (parseError) {
                throw new Error('Invalid JSON format: unable to parse file');
            }
            
            // Validate project structure
            if (!isValidProject(project)) {
                throw new Error('Invalid project structure: missing required fields or invalid data');
            }
            
            this.currentProject = project;
            return project;
        } catch (error) {
            if (error.message.startsWith('Invalid') || error.message.startsWith('No file')) {
                throw error;
            }
            throw new Error(`Failed to load project from file: ${error.message}`);
        }
    }

    /**
     * Helper method to read a file as text
     * 
     * @param {File} file - File to read
     * @returns {Promise<string>} File contents as text
     * @private
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Saves the project to localStorage
     * 
     * @param {import('../models/project').Project} project - Project to save
     * @returns {boolean} True if save was successful
     */
    saveToLocalStorage(project) {
        if (!isValidProject(project)) {
            console.error('Invalid project: cannot save to localStorage');
            return false;
        }

        // Update the updatedAt timestamp
        const updatedProject = touchProject(project);
        
        return saveProjectToLocalStorage(updatedProject);
    }

    /**
     * Loads the project from localStorage
     * 
     * @returns {import('../models/project').Project|null} Loaded project or null if not found
     */
    loadFromLocalStorage() {
        const project = loadProjectFromLocalStorage();
        
        if (project && isValidProject(project)) {
            this.currentProject = project;
            return project;
        }
        
        return null;
    }

    /**
     * Clears all project data from localStorage
     * 
     * @returns {boolean} True if clear was successful
     */
    clearLocalStorage() {
        this.currentProject = null;
        return clearLocalStorage();
    }

    /**
     * Gets the current project
     * 
     * @returns {import('../models/project').Project|null} Current project or null
     */
    getCurrentProject() {
        return this.currentProject;
    }

    /**
     * Sets the current project
     * 
     * @param {import('../models/project').Project} project - Project to set as current
     * @returns {void}
     */
    setCurrentProject(project) {
        if (!isValidProject(project)) {
            throw new Error('Invalid project: cannot set as current');
        }
        this.currentProject = project;
    }
}

