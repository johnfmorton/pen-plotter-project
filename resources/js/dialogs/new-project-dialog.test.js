/**
 * Tests for NewProjectDialog Component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NewProjectDialog } from './new-project-dialog.js';
import { VIEWPORT_PRESETS } from '../models/project.js';

describe('NewProjectDialog', () => {
    let dialog;
    let dialogElement;

    beforeEach(() => {
        // Create dialog HTML structure
        document.body.innerHTML = `
            <div id="new-project-dialog" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Create New Project</h3>
                    <div class="mb-4">
                        <label for="project-name" class="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                        <input type="text" id="project-name" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="My Plotter Art">
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Viewport Size</label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="viewport" value="8.5x11" checked class="mr-2">
                                <span>8.5" × 11" (Letter Portrait)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="viewport" value="11x8.5" class="mr-2">
                                <span>11" × 8.5" (Letter Landscape)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="viewport" value="6x6" class="mr-2">
                                <span>6" × 6" (Square)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="viewport" value="4x5" class="mr-2">
                                <span>4" × 5" (Small Portrait)</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex gap-3 justify-end">
                        <button id="cancel-new-project" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">Cancel</button>
                        <button id="confirm-new-project" class="px-4 py-2 text-white bg-blue-600 rounded-md">Create</button>
                    </div>
                </div>
            </div>
        `;

        dialogElement = document.getElementById('new-project-dialog');
        dialog = new NewProjectDialog();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('constructor', () => {
        it('should initialize with dialog element', () => {
            expect(dialog.dialog).toBe(dialogElement);
        });

        it('should throw error if dialog element not found', () => {
            document.body.innerHTML = '';
            expect(() => new NewProjectDialog()).toThrow('Dialog element with ID \'new-project-dialog\' not found');
        });

        it('should throw error if required elements not found', () => {
            document.body.innerHTML = '<div id="new-project-dialog"></div>';
            expect(() => new NewProjectDialog()).toThrow('Required dialog elements not found');
        });
    });

    describe('show', () => {
        it('should show the dialog', () => {
            dialog.show();
            expect(dialogElement.classList.contains('hidden')).toBe(false);
            expect(dialogElement.classList.contains('flex')).toBe(true);
        });

        it('should reset project name input', () => {
            dialog.projectNameInput.value = 'Test Project';
            dialog.show();
            expect(dialog.projectNameInput.value).toBe('');
        });

        it('should set default viewport to 8.5x11', () => {
            const radio11x85 = document.querySelector('input[name="viewport"][value="11x8.5"]');
            radio11x85.checked = true;
            
            dialog.show();
            
            const defaultRadio = document.querySelector('input[name="viewport"][value="8.5x11"]');
            expect(defaultRadio.checked).toBe(true);
        });
    });

    describe('hide', () => {
        it('should hide the dialog', () => {
            dialog.show();
            dialog.hide();
            expect(dialogElement.classList.contains('hidden')).toBe(true);
            expect(dialogElement.classList.contains('flex')).toBe(false);
        });
    });

    describe('getSelectedViewport', () => {
        it('should return default viewport (8.5x11) when default is selected', () => {
            const viewport = dialog.getSelectedViewport();
            expect(viewport).toEqual(VIEWPORT_PRESETS[0]);
            expect(viewport.label).toBe('8.5x11');
        });

        it('should return selected viewport', () => {
            const radio = document.querySelector('input[name="viewport"][value="11x8.5"]');
            radio.checked = true;
            
            const viewport = dialog.getSelectedViewport();
            expect(viewport.label).toBe('11x8.5');
            expect(viewport.width).toBe(11);
            expect(viewport.height).toBe(8.5);
        });

        it('should return 6x6 viewport when selected', () => {
            const radio = document.querySelector('input[name="viewport"][value="6x6"]');
            radio.checked = true;
            
            const viewport = dialog.getSelectedViewport();
            expect(viewport.label).toBe('6x6');
            expect(viewport.width).toBe(6);
            expect(viewport.height).toBe(6);
        });

        it('should return 4x5 viewport when selected', () => {
            const radio = document.querySelector('input[name="viewport"][value="4x5"]');
            radio.checked = true;
            
            const viewport = dialog.getSelectedViewport();
            expect(viewport.label).toBe('4x5');
            expect(viewport.width).toBe(4);
            expect(viewport.height).toBe(5);
        });
    });

    describe('getProjectName', () => {
        it('should return trimmed project name', () => {
            dialog.projectNameInput.value = '  My Project  ';
            expect(dialog.getProjectName()).toBe('My Project');
        });

        it('should return empty string for empty input', () => {
            dialog.projectNameInput.value = '';
            expect(dialog.getProjectName()).toBe('');
        });
    });

    describe('validate', () => {
        it('should return valid for non-empty project name', () => {
            dialog.projectNameInput.value = 'My Project';
            const result = dialog.validate();
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should return invalid for empty project name', () => {
            dialog.projectNameInput.value = '';
            const result = dialog.validate();
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Project name is required');
        });

        it('should return invalid for whitespace-only project name', () => {
            dialog.projectNameInput.value = '   ';
            const result = dialog.validate();
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Project name is required');
        });

        it('should return invalid for project name over 100 characters', () => {
            dialog.projectNameInput.value = 'a'.repeat(101);
            const result = dialog.validate();
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Project name must be 100 characters or less');
        });

        it('should return valid for project name with exactly 100 characters', () => {
            dialog.projectNameInput.value = 'a'.repeat(100);
            const result = dialog.validate();
            expect(result.isValid).toBe(true);
        });
    });

    describe('onConfirm', () => {
        it('should register confirm callback', () => {
            const callback = vi.fn();
            dialog.onConfirm(callback);
            expect(dialog.callbacks.confirm).toContain(callback);
        });

        it('should throw error for non-function callback', () => {
            expect(() => dialog.onConfirm('not a function')).toThrow('Callback must be a function');
        });

        it('should call confirm callback with project data when confirmed', () => {
            const callback = vi.fn();
            dialog.onConfirm(callback);
            
            dialog.projectNameInput.value = 'Test Project';
            dialog.confirmButton.click();
            
            expect(callback).toHaveBeenCalledWith({
                name: 'Test Project',
                viewportSize: VIEWPORT_PRESETS[0]
            });
        });

        it('should hide dialog after confirm', () => {
            dialog.show();
            dialog.projectNameInput.value = 'Test Project';
            dialog.confirmButton.click();
            
            expect(dialog.isVisible()).toBe(false);
        });

        it('should not call callback if validation fails', () => {
            const callback = vi.fn();
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
            
            dialog.onConfirm(callback);
            dialog.projectNameInput.value = '';
            dialog.confirmButton.click();
            
            expect(callback).not.toHaveBeenCalled();
            expect(alertSpy).toHaveBeenCalledWith('Project name is required');
            
            alertSpy.mockRestore();
        });
    });

    describe('onCancel', () => {
        it('should register cancel callback', () => {
            const callback = vi.fn();
            dialog.onCancel(callback);
            expect(dialog.callbacks.cancel).toContain(callback);
        });

        it('should throw error for non-function callback', () => {
            expect(() => dialog.onCancel('not a function')).toThrow('Callback must be a function');
        });

        it('should call cancel callback when cancelled', () => {
            const callback = vi.fn();
            dialog.onCancel(callback);
            
            dialog.cancelButton.click();
            
            expect(callback).toHaveBeenCalled();
        });

        it('should hide dialog after cancel', () => {
            dialog.show();
            dialog.cancelButton.click();
            
            expect(dialog.isVisible()).toBe(false);
        });
    });

    describe('keyboard interactions', () => {
        it('should confirm on Enter key in project name input', () => {
            const callback = vi.fn();
            dialog.onConfirm(callback);
            
            dialog.projectNameInput.value = 'Test Project';
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            dialog.projectNameInput.dispatchEvent(event);
            
            expect(callback).toHaveBeenCalled();
        });

        it('should cancel on Escape key in project name input', () => {
            const callback = vi.fn();
            dialog.onCancel(callback);
            
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            dialog.projectNameInput.dispatchEvent(event);
            
            expect(callback).toHaveBeenCalled();
        });

        it('should cancel on Escape key in dialog', () => {
            const callback = vi.fn();
            dialog.onCancel(callback);
            
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            dialogElement.dispatchEvent(event);
            
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('click outside to close', () => {
        it('should cancel when clicking on dialog backdrop', () => {
            const callback = vi.fn();
            dialog.onCancel(callback);
            
            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: dialogElement, enumerable: true });
            dialogElement.dispatchEvent(event);
            
            expect(callback).toHaveBeenCalled();
        });

        it('should not cancel when clicking inside dialog content', () => {
            const callback = vi.fn();
            dialog.onCancel(callback);
            
            const innerElement = dialog.projectNameInput;
            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: innerElement, enumerable: true });
            dialogElement.dispatchEvent(event);
            
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('isVisible', () => {
        it('should return false when dialog is hidden', () => {
            expect(dialog.isVisible()).toBe(false);
        });

        it('should return true when dialog is shown', () => {
            dialog.show();
            expect(dialog.isVisible()).toBe(true);
        });
    });

    describe('multiple callbacks', () => {
        it('should call all registered confirm callbacks', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            
            dialog.onConfirm(callback1);
            dialog.onConfirm(callback2);
            
            dialog.projectNameInput.value = 'Test';
            dialog.confirmButton.click();
            
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should call all registered cancel callbacks', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            
            dialog.onCancel(callback1);
            dialog.onCancel(callback2);
            
            dialog.cancelButton.click();
            
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });
});
