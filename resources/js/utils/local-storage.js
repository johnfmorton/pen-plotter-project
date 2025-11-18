/**
 * LocalStorage Wrapper Utility
 * 
 * Provides safe access to browser localStorage with error handling
 * and quota management for the SVG Plotter Editor.
 */

/**
 * Storage keys used by the application
 */
export const STORAGE_KEYS = {
    PROJECT: 'plotter_current_project',
    CODE: 'plotter_code',
    VIEWPORT: 'plotter_viewport',
    PROJECT_NAME: 'plotter_project_name'
};

/**
 * Checks if localStorage is available in the current browser
 * 
 * @returns {boolean} True if localStorage is available
 */
export function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Saves project data to localStorage
 * 
 * @param {import('../models/project').Project} project - Project to save
 * @returns {boolean} True if save was successful
 */
export function saveProjectToLocalStorage(project) {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return false;
    }
    
    try {
        const projectJson = JSON.stringify(project);
        localStorage.setItem(STORAGE_KEYS.PROJECT, projectJson);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded. Unable to save project.');
            // Attempt to clear old data and retry
            try {
                clearLocalStorage();
                const projectJson = JSON.stringify(project);
                localStorage.setItem(STORAGE_KEYS.PROJECT, projectJson);
                console.info('Cleared old data and successfully saved project');
                return true;
            } catch (retryError) {
                console.error('Failed to save project even after clearing storage:', retryError);
                return false;
            }
        } else {
            console.error('Error saving project to localStorage:', e);
            return false;
        }
    }
}

/**
 * Loads project data from localStorage
 * 
 * @returns {import('../models/project').Project|null} Loaded project or null if not found
 */
export function loadProjectFromLocalStorage() {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available');
        return null;
    }
    
    try {
        const projectJson = localStorage.getItem(STORAGE_KEYS.PROJECT);
        if (!projectJson) {
            return null;
        }
        
        const project = JSON.parse(projectJson);
        return project;
    } catch (e) {
        console.error('Error loading project from localStorage:', e);
        return null;
    }
}

/**
 * Saves individual code to localStorage (for backward compatibility)
 * 
 * @param {string} code - Code to save
 * @returns {boolean} True if save was successful
 */
export function saveCodeToLocalStorage(code) {
    if (!isLocalStorageAvailable()) {
        return false;
    }
    
    try {
        localStorage.setItem(STORAGE_KEYS.CODE, code);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded. Unable to save code.');
        } else {
            console.error('Error saving code to localStorage:', e);
        }
        return false;
    }
}

/**
 * Loads code from localStorage
 * 
 * @returns {string|null} Loaded code or null if not found
 */
export function loadCodeFromLocalStorage() {
    if (!isLocalStorageAvailable()) {
        return null;
    }
    
    try {
        return localStorage.getItem(STORAGE_KEYS.CODE);
    } catch (e) {
        console.error('Error loading code from localStorage:', e);
        return null;
    }
}

/**
 * Saves viewport size to localStorage
 * 
 * @param {import('../models/project').ViewportSize} viewportSize - Viewport to save
 * @returns {boolean} True if save was successful
 */
export function saveViewportToLocalStorage(viewportSize) {
    if (!isLocalStorageAvailable()) {
        return false;
    }
    
    try {
        const viewportJson = JSON.stringify(viewportSize);
        localStorage.setItem(STORAGE_KEYS.VIEWPORT, viewportJson);
        return true;
    } catch (e) {
        console.error('Error saving viewport to localStorage:', e);
        return false;
    }
}

/**
 * Loads viewport size from localStorage
 * 
 * @returns {import('../models/project').ViewportSize|null} Loaded viewport or null
 */
export function loadViewportFromLocalStorage() {
    if (!isLocalStorageAvailable()) {
        return null;
    }
    
    try {
        const viewportJson = localStorage.getItem(STORAGE_KEYS.VIEWPORT);
        if (!viewportJson) {
            return null;
        }
        
        return JSON.parse(viewportJson);
    } catch (e) {
        console.error('Error loading viewport from localStorage:', e);
        return null;
    }
}

/**
 * Saves project name to localStorage
 * 
 * @param {string} name - Project name to save
 * @returns {boolean} True if save was successful
 */
export function saveProjectNameToLocalStorage(name) {
    if (!isLocalStorageAvailable()) {
        return false;
    }
    
    try {
        localStorage.setItem(STORAGE_KEYS.PROJECT_NAME, name);
        return true;
    } catch (e) {
        console.error('Error saving project name to localStorage:', e);
        return false;
    }
}

/**
 * Loads project name from localStorage
 * 
 * @returns {string|null} Loaded project name or null
 */
export function loadProjectNameFromLocalStorage() {
    if (!isLocalStorageAvailable()) {
        return null;
    }
    
    try {
        return localStorage.getItem(STORAGE_KEYS.PROJECT_NAME);
    } catch (e) {
        console.error('Error loading project name from localStorage:', e);
        return null;
    }
}

/**
 * Clears all plotter-related data from localStorage
 * 
 * @returns {boolean} True if clear was successful
 */
export function clearLocalStorage() {
    if (!isLocalStorageAvailable()) {
        return false;
    }
    
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (e) {
        console.error('Error clearing localStorage:', e);
        return false;
    }
}

/**
 * Gets the approximate size of stored data in bytes
 * 
 * @returns {number} Approximate size in bytes
 */
export function getStorageSize() {
    if (!isLocalStorageAvailable()) {
        return 0;
    }
    
    let size = 0;
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                size += item.length * 2; // Approximate: 2 bytes per character in UTF-16
            }
        });
    } catch (e) {
        console.error('Error calculating storage size:', e);
    }
    
    return size;
}
