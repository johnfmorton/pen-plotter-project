/**
 * Project Model
 * 
 * Defines the structure for a plotter project including viewport configuration.
 * 
 * @typedef {Object} ViewportSize
 * @property {number} width - Width in inches
 * @property {number} height - Height in inches
 * @property {string} label - Display label (e.g., "8.5x11")
 */

/**
 * @typedef {Object} Project
 * @property {string} name - Project name
 * @property {string} code - JavaScript code for SVG generation
 * @property {ViewportSize} viewportSize - Viewport dimensions
 * @property {string} createdAt - ISO 8601 timestamp
 * @property {string} updatedAt - ISO 8601 timestamp
 */

/**
 * Predefined viewport size presets for common plotter dimensions
 * @type {ViewportSize[]}
 */
export const VIEWPORT_PRESETS = [
    { width: 8.5, height: 11, label: "8.5x11" },
    { width: 11, height: 8.5, label: "11x8.5" },
    { width: 6, height: 6, label: "6x6" },
    { width: 4, height: 5, label: "4x5" }
];

/**
 * Creates a new Project object with default values
 * 
 * @param {string} name - Project name
 * @param {ViewportSize} viewportSize - Viewport dimensions
 * @param {string} [code=''] - Initial code
 * @returns {Project} New project object
 */
export function createProject(name, viewportSize, code = '') {
    const now = new Date().toISOString();
    return {
        name,
        code,
        viewportSize,
        createdAt: now,
        updatedAt: now
    };
}

/**
 * Updates the updatedAt timestamp of a project
 * 
 * @param {Project} project - Project to update
 * @returns {Project} Updated project object
 */
export function touchProject(project) {
    return {
        ...project,
        updatedAt: new Date().toISOString()
    };
}

/**
 * Validates a viewport size object
 * 
 * @param {any} viewportSize - Object to validate
 * @returns {boolean} True if valid viewport size
 */
export function isValidViewportSize(viewportSize) {
    return (
        viewportSize &&
        typeof viewportSize === 'object' &&
        typeof viewportSize.width === 'number' &&
        typeof viewportSize.height === 'number' &&
        typeof viewportSize.label === 'string' &&
        viewportSize.width > 0 &&
        viewportSize.height > 0
    );
}

/**
 * Validates a project object
 * 
 * @param {any} project - Object to validate
 * @returns {boolean} True if valid project
 */
export function isValidProject(project) {
    return (
        project &&
        typeof project === 'object' &&
        typeof project.name === 'string' &&
        typeof project.code === 'string' &&
        isValidViewportSize(project.viewportSize) &&
        typeof project.createdAt === 'string' &&
        typeof project.updatedAt === 'string'
    );
}
