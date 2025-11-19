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
import { downloadJSON, readJSONFile } from '../utils/file-utils.js';

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
            
            // Use the file utility to download JSON
            downloadJSON(updatedProject, project.name);
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

        try {
            // Use the file utility to read JSON
            const project = await readJSONFile(file);
            
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

