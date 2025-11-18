/**
 * Tests for ControlPanel Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ControlPanel } from './control-panel.js';

describe('ControlPanel', () => {
    let container;
    let controlPanel;

    beforeEach(() => {
        // Create a fresh container for each test
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('Constructor', () => {
        it('should throw error if no container element provided', () => {
            expect(() => new ControlPanel(null)).toThrow('Container element is required for ControlPanel');
        });

        it('should create control panel with all buttons', () => {
            controlPanel = new ControlPanel(container);
            
            expect(controlPanel.buttons.newProject).toBeDefined();
            expect(controlPanel.buttons.save).toBeDefined();
            expect(controlPanel.buttons.open).toBeDefined();
            expect(controlPanel.buttons.regenerate).toBeDefined();
            expect(controlPanel.buttons.export).toBeDefined();
        });

        it('should create buttons in the DOM', () => {
            controlPanel = new ControlPanel(container);
            
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toBe(5);
        });

        it('should create buttons with correct labels', () => {
            controlPanel = new ControlPanel(container);
            
            const newProjectBtn = controlPanel.getButton('newProject');
            const saveBtn = controlPanel.getButton('save');
            const openBtn = controlPanel.getButton('open');
            const regenerateBtn = controlPanel.getButton('regenerate');
            const exportBtn = controlPanel.getButton('export');

            expect(newProjectBtn.textContent).toContain('New Project');
            expect(saveBtn.textContent).toContain('Save');
            expect(openBtn.textContent).toContain('Open');
            expect(regenerateBtn.textContent).toContain('Regenerate');
            expect(exportBtn.textContent).toContain('Export SVG');
        });
    });

    describe('Event Registration', () => {
        beforeEach(() => {
            controlPanel = new ControlPanel(container);
        });

        it('should register callback for New Project button', () => {
            const callback = vi.fn();
            controlPanel.onNewProject(callback);
            
            expect(controlPanel.callbacks.newProject).toContain(callback);
        });

        it('should register callback for Save button', () => {
            const callback = vi.fn();
            controlPanel.onSave(callback);
            
            expect(controlPanel.callbacks.save).toContain(callback);
        });

        it('should register callback for Open button', () => {
            const callback = vi.fn();
            controlPanel.onOpen(callback);
            
            expect(controlPanel.callbacks.open).toContain(callback);
        });

        it('should register callback for Regenerate button', () => {
            const callback = vi.fn();
            controlPanel.onRegenerate(callback);
            
            expect(controlPanel.callbacks.regenerate).toContain(callback);
        });

        it('should register callback for Export button', () => {
            const callback = vi.fn();
            controlPanel.onExport(callback);
            
            expect(controlPanel.callbacks.export).toContain(callback);
        });

        it('should throw error if callback is not a function', () => {
            expect(() => controlPanel.onNewProject('not a function')).toThrow('Callback must be a function');
            expect(() => controlPanel.onSave(123)).toThrow('Callback must be a function');
            expect(() => controlPanel.onOpen(null)).toThrow('Callback must be a function');
            expect(() => controlPanel.onRegenerate(undefined)).toThrow('Callback must be a function');
            expect(() => controlPanel.onExport({})).toThrow('Callback must be a function');
        });
    });

    describe('Button Clicks', () => {
        beforeEach(() => {
            controlPanel = new ControlPanel(container);
        });

        it('should trigger callback when New Project button is clicked', () => {
            const callback = vi.fn();
            controlPanel.onNewProject(callback);
            
            const button = controlPanel.getButton('newProject');
            button.click();
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should trigger callback when Save button is clicked', () => {
            const callback = vi.fn();
            controlPanel.onSave(callback);
            
            const button = controlPanel.getButton('save');
            button.click();
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should trigger callback when Open button is clicked', () => {
            const callback = vi.fn();
            controlPanel.onOpen(callback);
            
            const button = controlPanel.getButton('open');
            button.click();
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should trigger callback when Regenerate button is clicked', () => {
            const callback = vi.fn();
            controlPanel.onRegenerate(callback);
            
            const button = controlPanel.getButton('regenerate');
            button.click();
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should trigger callback when Export button is clicked', () => {
            const callback = vi.fn();
            controlPanel.onExport(callback);
            
            const button = controlPanel.getButton('export');
            button.click();
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should trigger multiple callbacks for the same button', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            
            controlPanel.onRegenerate(callback1);
            controlPanel.onRegenerate(callback2);
            
            const button = controlPanel.getButton('regenerate');
            button.click();
            
            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });

        it('should not trigger callback when button is disabled', () => {
            const callback = vi.fn();
            controlPanel.onSave(callback);
            
            controlPanel.setButtonState('save', false);
            
            const button = controlPanel.getButton('save');
            button.click();
            
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Button State Management', () => {
        beforeEach(() => {
            controlPanel = new ControlPanel(container);
        });

        it('should enable button when setButtonState is called with true', () => {
            controlPanel.setButtonState('save', false);
            expect(controlPanel.getButton('save').disabled).toBe(true);
            
            controlPanel.setButtonState('save', true);
            expect(controlPanel.getButton('save').disabled).toBe(false);
        });

        it('should disable button when setButtonState is called with false', () => {
            controlPanel.setButtonState('regenerate', true);
            expect(controlPanel.getButton('regenerate').disabled).toBe(false);
            
            controlPanel.setButtonState('regenerate', false);
            expect(controlPanel.getButton('regenerate').disabled).toBe(true);
        });

        it('should throw error for unknown button', () => {
            expect(() => controlPanel.setButtonState('unknown', true)).toThrow('Unknown button: unknown');
        });

        it('should enable all buttons with enableAll', () => {
            // Disable all buttons first
            controlPanel.disableAll();
            
            Object.keys(controlPanel.buttons).forEach(buttonId => {
                expect(controlPanel.getButton(buttonId).disabled).toBe(true);
            });
            
            // Enable all
            controlPanel.enableAll();
            
            Object.keys(controlPanel.buttons).forEach(buttonId => {
                expect(controlPanel.getButton(buttonId).disabled).toBe(false);
            });
        });

        it('should disable all buttons with disableAll', () => {
            // Enable all buttons first
            controlPanel.enableAll();
            
            Object.keys(controlPanel.buttons).forEach(buttonId => {
                expect(controlPanel.getButton(buttonId).disabled).toBe(false);
            });
            
            // Disable all
            controlPanel.disableAll();
            
            Object.keys(controlPanel.buttons).forEach(buttonId => {
                expect(controlPanel.getButton(buttonId).disabled).toBe(true);
            });
        });
    });

    describe('Button Styling', () => {
        beforeEach(() => {
            controlPanel = new ControlPanel(container);
        });

        it('should apply primary styling to Regenerate button', () => {
            const regenerateBtn = controlPanel.getButton('regenerate');
            expect(regenerateBtn.className).toContain('bg-blue-600');
            expect(regenerateBtn.className).toContain('text-white');
        });

        it('should apply secondary styling to other buttons', () => {
            const newProjectBtn = controlPanel.getButton('newProject');
            const saveBtn = controlPanel.getButton('save');
            const openBtn = controlPanel.getButton('open');
            const exportBtn = controlPanel.getButton('export');

            [newProjectBtn, saveBtn, openBtn, exportBtn].forEach(btn => {
                expect(btn.className).toContain('bg-gray-200');
                expect(btn.className).toContain('text-gray-800');
            });
        });

        it('should have Tailwind CSS classes for all buttons', () => {
            Object.values(controlPanel.buttons).forEach(button => {
                expect(button.className).toContain('px-4');
                expect(button.className).toContain('py-2');
                expect(button.className).toContain('rounded-md');
                expect(button.className).toContain('transition-colors');
            });
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            controlPanel = new ControlPanel(container);
        });

        it('should handle callback errors gracefully', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error');
            });
            const successCallback = vi.fn();
            
            // Spy on console.error
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            controlPanel.onSave(errorCallback);
            controlPanel.onSave(successCallback);
            
            const button = controlPanel.getButton('save');
            button.click();
            
            // Error callback should have been called
            expect(errorCallback).toHaveBeenCalledTimes(1);
            // Success callback should still be called despite error in first callback
            expect(successCallback).toHaveBeenCalledTimes(1);
            // Error should be logged
            expect(consoleErrorSpy).toHaveBeenCalled();
            
            consoleErrorSpy.mockRestore();
        });
    });
});
