/**
 * Property-Based Tests for LocalStorage Utility
 * 
 * **Feature: svg-plotter-editor, Property 23: LocalStorage round trip**
 * **Validates: Requirements 7.2**
 * 
 * Tests that data saved to localStorage can be retrieved unchanged,
 * ensuring that page refresh restores previous state correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
    saveProjectToLocalStorage,
    loadProjectFromLocalStorage,
    clearLocalStorage,
    isLocalStorageAvailable
} from './local-storage.js';
import { createProject, VIEWPORT_PRESETS } from '../models/project.js';

describe('LocalStorage Round Trip Property Tests', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        clearLocalStorage();
        localStorage.clear();
    });

    /**
     * Property 23: LocalStorage round trip
     * 
     * For any project state saved to localStorage, refreshing the page 
     * (simulated by save then load) should restore the Plotter Code, 
     * project name, and viewport size to their previous values.
     */
    it('should preserve project data through save-load round trip', () => {
        // Arbitrary for generating random project names
        const projectNameArbitrary = fc.string({ minLength: 1, maxLength: 100 });
        
        // Arbitrary for generating random code (including special characters)
        const codeArbitrary = fc.string({ minLength: 0, maxLength: 5000 });
        
        // Arbitrary for selecting viewport sizes
        const viewportArbitrary = fc.constantFrom(...VIEWPORT_PRESETS);
        
        // Property: For any project, save then load should return equivalent data
        fc.assert(
            fc.property(
                projectNameArbitrary,
                codeArbitrary,
                viewportArbitrary,
                (name, code, viewport) => {
                    // Create a project with random data
                    const originalProject = createProject(name, viewport, code);
                    
                    // Save to localStorage
                    const saveResult = saveProjectToLocalStorage(originalProject);
                    expect(saveResult).toBe(true);
                    
                    // Load from localStorage (simulating page refresh)
                    const loadedProject = loadProjectFromLocalStorage();
                    
                    // Verify the loaded project is not null
                    expect(loadedProject).not.toBeNull();
                    
                    // Verify all fields are preserved
                    expect(loadedProject.name).toBe(originalProject.name);
                    expect(loadedProject.code).toBe(originalProject.code);
                    expect(loadedProject.viewportSize.width).toBe(originalProject.viewportSize.width);
                    expect(loadedProject.viewportSize.height).toBe(originalProject.viewportSize.height);
                    expect(loadedProject.viewportSize.label).toBe(originalProject.viewportSize.label);
                    expect(loadedProject.createdAt).toBe(originalProject.createdAt);
                    expect(loadedProject.updatedAt).toBe(originalProject.updatedAt);
                }
            ),
            { numRuns: 100 } // Run 100 iterations as specified in design doc
        );
    });

    /**
     * Additional property: Special characters should be preserved
     * 
     * This tests that special characters in code (like quotes, newlines, 
     * unicode) are properly preserved through the round trip.
     */
    it('should preserve special characters in code through round trip', () => {
        // Arbitrary for generating strings with special characters
        const specialCodeArbitrary = fc.string({
            minLength: 0,
            maxLength: 1000
        });
        
        const viewportArbitrary = fc.constantFrom(...VIEWPORT_PRESETS);
        
        fc.assert(
            fc.property(
                specialCodeArbitrary,
                viewportArbitrary,
                (code, viewport) => {
                    const project = createProject('Special Chars Test', viewport, code);
                    
                    saveProjectToLocalStorage(project);
                    const loaded = loadProjectFromLocalStorage();
                    
                    expect(loaded).not.toBeNull();
                    expect(loaded.code).toBe(project.code);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Additional property: Empty and whitespace-only code should be preserved
     */
    it('should preserve empty and whitespace-only code', () => {
        const whitespaceArbitrary = fc.oneof(
            fc.constant(''),
            fc.constant(' '),
            fc.constant('\n'),
            fc.constant('\t'),
            fc.constant('   \n\t  ')
        );
        
        const viewportArbitrary = fc.constantFrom(...VIEWPORT_PRESETS);
        
        fc.assert(
            fc.property(
                whitespaceArbitrary,
                viewportArbitrary,
                (code, viewport) => {
                    const project = createProject('Whitespace Test', viewport, code);
                    
                    saveProjectToLocalStorage(project);
                    const loaded = loadProjectFromLocalStorage();
                    
                    expect(loaded).not.toBeNull();
                    expect(loaded.code).toBe(project.code);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Additional property: Very long project names should be preserved
     */
    it('should preserve long project names through round trip', () => {
        const longNameArbitrary = fc.string({ minLength: 100, maxLength: 500 });
        const viewportArbitrary = fc.constantFrom(...VIEWPORT_PRESETS);
        
        fc.assert(
            fc.property(
                longNameArbitrary,
                viewportArbitrary,
                (name, viewport) => {
                    const project = createProject(name, viewport, '// test');
                    
                    saveProjectToLocalStorage(project);
                    const loaded = loadProjectFromLocalStorage();
                    
                    expect(loaded).not.toBeNull();
                    expect(loaded.name).toBe(project.name);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Additional property: All viewport presets should work correctly
     */
    it('should preserve all viewport preset configurations', () => {
        const viewportArbitrary = fc.constantFrom(...VIEWPORT_PRESETS);
        const codeArbitrary = fc.string({ minLength: 0, maxLength: 100 });
        
        fc.assert(
            fc.property(
                viewportArbitrary,
                codeArbitrary,
                (viewport, code) => {
                    const project = createProject('Viewport Test', viewport, code);
                    
                    saveProjectToLocalStorage(project);
                    const loaded = loadProjectFromLocalStorage();
                    
                    expect(loaded).not.toBeNull();
                    expect(loaded.viewportSize).toEqual(project.viewportSize);
                }
            ),
            { numRuns: 100 }
        );
    });
});
