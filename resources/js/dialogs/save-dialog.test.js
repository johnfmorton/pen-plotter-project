/**
 * Tests for SaveDialog Component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveDialog } from './save-dialog.js';

describe('SaveDialog', () => {
    let dialog;
    let saveDialog;

    beforeEach(() => {
        // Create dialog HTML structure
        document.body.innerHTML = `
            <div id="save-dialog" class="hidden">
                <input id="save-filename" type="text" />
                <button id="confirm-save">Save</button>
                <button id="cancel-save">Cancel</button>
            </div>
        `;

        dialog = document.getElementById('save-dialog');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Constructor', () => {
        it('should throw error if dialog element not found', () => {
            document.body.innerHTML = '';
            expect(() => new SaveDialog()).toThrow("Dialog element with ID 'save-dialog' not found");
        });

        it('should throw error if required elements not found', () => {
            document.body.innerHTML = '<div id="save-dialog"></div>';
            expect(() => new SaveDialog()).toThrow('Required dialog elements not found');
        });

        it('should initialize successfully with all required elements', () => {
            expect(() => {
                saveDialog = new SaveDialog();
            }).not.toThrow();
        });

        it('should initialize callbacks object', () => {
            saveDialog = new SaveDialog();
            expect(saveDialog.callbacks).toBeDefined();
            expect(saveDialog.callbacks.confirm).toEqual([]);
            expect(saveDialog.callbacks.cancel).toEqual([]);
        });
    });

    describe('show()', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should show the dialog', () => {
            saveDialog.show();
            expect(dialog.classList.contains('hidden')).toBe(false);
            expect(dialog.classList.contains('flex')).toBe(true);
        });

        it('should set default filename', () => {
            saveDialog.show('test-project');
            const input = document.getElementById('save-filename');
            expect(input.value).toBe('test-project');
        });

        it('should use "untitled" as default if no filename provided', () => {
            saveDialog.show();
            const input = document.getElementById('save-filename');
            expect(input.value).toBe('untitled');
        });

        it('should focus and select the filename input', async () => {
            const input = document.getElementById('save-filename');
            const focusSpy = vi.spyOn(input, 'focus');
            const selectSpy = vi.spyOn(input, 'select');

            saveDialog.show('test');

            // Wait for setTimeout
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(focusSpy).toHaveBeenCalled();
            expect(selectSpy).toHaveBeenCalled();
        });
    });

    describe('hide()', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should hide the dialog', () => {
            saveDialog.show();
            saveDialog.hide();
            expect(dialog.classList.contains('hidden')).toBe(true);
            expect(dialog.classList.contains('flex')).toBe(false);
        });
    });

    describe('getFilename()', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should return trimmed filename', () => {
            const input = document.getElementById('save-filename');
            input.value = '  test-project  ';
            expect(saveDialog.getFilename()).toBe('test-project');
        });

        it('should return empty string if input is empty', () => {
            const input = document.getElementById('save-filename');
            input.value = '';
            expect(saveDialog.getFilename()).toBe('');
        });
    });

    describe('validate()', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should validate empty filename as invalid', () => {
            const input = document.getElementById('save-filename');
            input.value = '';
            const result = saveDialog.validate();
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Filename is required');
        });

        it('should validate filename with only spaces as invalid', () => {
            const input = document.getElementById('save-filename');
            input.value = '   ';
            const result = saveDialog.validate();
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Filename is required');
        });

        it('should validate filename longer than 255 characters as invalid', () => {
            const input = document.getElementById('save-filename');
            input.value = 'a'.repeat(256);
            const result = saveDialog.validate();
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Filename must be 255 characters or less');
        });

        it('should validate filename with invalid characters', () => {
            const input = document.getElementById('save-filename');
            const invalidChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
            
            invalidChars.forEach(char => {
                input.value = `test${char}file`;
                const result = saveDialog.validate();
                expect(result.isValid).toBe(false);
                expect(result.error).toBe('Filename contains invalid characters');
            });
        });

        it('should validate valid filename', () => {
            const input = document.getElementById('save-filename');
            input.value = 'my-project-2024';
            const result = saveDialog.validate();
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });

        it('should validate filename with spaces and special characters', () => {
            const input = document.getElementById('save-filename');
            input.value = 'My Project (2024) - Draft #1';
            const result = saveDialog.validate();
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe('Callback Registration', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should register confirm callback', () => {
            const callback = vi.fn();
            saveDialog.onConfirm(callback);
            expect(saveDialog.callbacks.confirm).toContain(callback);
        });

        it('should register cancel callback', () => {
            const callback = vi.fn();
            saveDialog.onCancel(callback);
            expect(saveDialog.callbacks.cancel).toContain(callback);
        });

        it('should throw error if confirm callback is not a function', () => {
            expect(() => saveDialog.onConfirm('not a function')).toThrow('Callback must be a function');
        });

        it('should throw error if cancel callback is not a function', () => {
            expect(() => saveDialog.onCancel(123)).toThrow('Callback must be a function');
        });
    });

    describe('User Interactions', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should trigger confirm callback when confirm button is clicked', () => {
            const callback = vi.fn();
            saveDialog.onConfirm(callback);

            const input = document.getElementById('save-filename');
            input.value = 'test-project';

            const confirmBtn = document.getElementById('confirm-save');
            confirmBtn.click();

            expect(callback).toHaveBeenCalledWith('test-project');
            expect(saveDialog.isVisible()).toBe(false);
        });

        it('should trigger cancel callback when cancel button is clicked', () => {
            const callback = vi.fn();
            saveDialog.onCancel(callback);

            saveDialog.show();
            const cancelBtn = document.getElementById('cancel-save');
            cancelBtn.click();

            expect(callback).toHaveBeenCalled();
            expect(saveDialog.isVisible()).toBe(false);
        });

        it('should show alert and not trigger callback for invalid filename', () => {
            const callback = vi.fn();
            const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
            saveDialog.onConfirm(callback);

            saveDialog.show(); // Show the dialog first
            const input = document.getElementById('save-filename');
            input.value = '';

            const confirmBtn = document.getElementById('confirm-save');
            confirmBtn.click();

            expect(alertSpy).toHaveBeenCalledWith('Filename is required');
            expect(callback).not.toHaveBeenCalled();
            expect(saveDialog.isVisible()).toBe(true);

            alertSpy.mockRestore();
        });

        it('should handle Enter key in filename input', () => {
            const callback = vi.fn();
            saveDialog.onConfirm(callback);

            const input = document.getElementById('save-filename');
            input.value = 'test-project';

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
            input.dispatchEvent(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(callback).toHaveBeenCalledWith('test-project');
        });

        it('should handle Escape key in filename input', () => {
            const callback = vi.fn();
            saveDialog.onCancel(callback);

            saveDialog.show();
            const input = document.getElementById('save-filename');

            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
            input.dispatchEvent(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(callback).toHaveBeenCalled();
        });

        it('should handle Escape key on dialog', () => {
            const callback = vi.fn();
            saveDialog.onCancel(callback);

            saveDialog.show();

            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
            dialog.dispatchEvent(event);

            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(callback).toHaveBeenCalled();
        });

        it('should close dialog when clicking outside', () => {
            const callback = vi.fn();
            saveDialog.onCancel(callback);

            saveDialog.show();

            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: dialog, enumerable: true });
            dialog.dispatchEvent(event);

            expect(callback).toHaveBeenCalled();
            expect(saveDialog.isVisible()).toBe(false);
        });

        it('should not close dialog when clicking inside', () => {
            const callback = vi.fn();
            saveDialog.onCancel(callback);

            saveDialog.show();

            const input = document.getElementById('save-filename');
            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: input, enumerable: true });
            dialog.dispatchEvent(event);

            expect(callback).not.toHaveBeenCalled();
            expect(saveDialog.isVisible()).toBe(true);
        });
    });

    describe('isVisible()', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should return false when dialog is hidden', () => {
            expect(saveDialog.isVisible()).toBe(false);
        });

        it('should return true when dialog is shown', () => {
            saveDialog.show();
            expect(saveDialog.isVisible()).toBe(true);
        });

        it('should return false after hiding', () => {
            saveDialog.show();
            saveDialog.hide();
            expect(saveDialog.isVisible()).toBe(false);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            saveDialog = new SaveDialog();
        });

        it('should handle callback errors gracefully', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error');
            });
            const successCallback = vi.fn();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            saveDialog.onConfirm(errorCallback);
            saveDialog.onConfirm(successCallback);

            const input = document.getElementById('save-filename');
            input.value = 'test';

            const confirmBtn = document.getElementById('confirm-save');
            confirmBtn.click();

            expect(errorCallback).toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });
    });
});
