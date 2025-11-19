/**
 * Tests for ErrorDisplay component
 * 
 * Validates error display functionality including:
 * - Error message display with line numbers
 * - Error type distinction (syntax vs runtime)
 * - Error clearing on success
 * - Visibility management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ErrorDisplay } from './error-display.js';

describe('ErrorDisplay', () => {
    let container;
    let errorDisplay;

    beforeEach(() => {
        // Create a container element for testing
        container = document.createElement('div');
        container.id = 'test-error-display';
        document.body.appendChild(container);
        
        // Create ErrorDisplay instance
        errorDisplay = new ErrorDisplay(container);
    });

    afterEach(() => {
        // Clean up
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    describe('Constructor', () => {
        it('should throw error if no container provided', () => {
            expect(() => new ErrorDisplay(null)).toThrow('Container element is required');
        });

        it('should initialize with hidden state', () => {
            expect(container.classList.contains('hidden')).toBe(true);
        });

        it('should create content container', () => {
            const contentContainer = container.querySelector('.error-content');
            expect(contentContainer).toBeTruthy();
        });
    });

    describe('showError', () => {
        it('should display string error messages', () => {
            errorDisplay.showError('Test error message');
            
            expect(container.classList.contains('hidden')).toBe(false);
            expect(container.textContent).toContain('Test error message');
        });

        it('should display syntax error with proper type distinction', () => {
            const error = {
                message: 'Unexpected token',
                type: 'syntax',
                line: 5,
                column: 10
            };
            
            errorDisplay.showError(error);
            
            expect(container.textContent).toContain('Syntax Error');
            expect(container.textContent).toContain('Unexpected token');
            expect(container.textContent).toContain('Line 5');
            expect(container.textContent).toContain('Column 10');
        });

        it('should display runtime error with proper type distinction', () => {
            const error = {
                message: 'Cannot read property of undefined',
                type: 'runtime',
                line: 12
            };
            
            errorDisplay.showError(error);
            
            expect(container.textContent).toContain('Runtime Error');
            expect(container.textContent).toContain('Cannot read property of undefined');
            expect(container.textContent).toContain('Line 12');
        });

        it('should include line number when available', () => {
            const error = {
                message: 'Test error',
                type: 'runtime',
                line: 42
            };
            
            errorDisplay.showError(error);
            
            expect(container.textContent).toContain('Line 42');
        });

        it('should include column number when available', () => {
            const error = {
                message: 'Test error',
                type: 'syntax',
                line: 10,
                column: 25
            };
            
            errorDisplay.showError(error);
            
            expect(container.textContent).toContain('Line 10');
            expect(container.textContent).toContain('Column 25');
        });

        it('should handle error without line number', () => {
            const error = {
                message: 'Generic error',
                type: 'runtime'
            };
            
            errorDisplay.showError(error);
            
            expect(container.textContent).toContain('Generic error');
            expect(container.textContent).not.toContain('Line');
        });

        it('should make container visible', () => {
            errorDisplay.showError('Test error');
            
            expect(container.classList.contains('hidden')).toBe(false);
            expect(container.classList.contains('block')).toBe(true);
        });

        it('should replace previous error when showing new error', () => {
            errorDisplay.showError('First error');
            expect(container.textContent).toContain('First error');
            
            errorDisplay.showError('Second error');
            expect(container.textContent).toContain('Second error');
            expect(container.textContent).not.toContain('First error');
        });
    });

    describe('clearError', () => {
        it('should hide the error display', () => {
            errorDisplay.showError('Test error');
            expect(container.classList.contains('hidden')).toBe(false);
            
            errorDisplay.clearError();
            expect(container.classList.contains('hidden')).toBe(true);
            expect(container.classList.contains('block')).toBe(false);
        });

        it('should clear error content', () => {
            errorDisplay.showError('Test error');
            expect(container.textContent).toContain('Test error');
            
            errorDisplay.clearError();
            const contentContainer = container.querySelector('.error-content');
            expect(contentContainer.innerHTML).toBe('');
        });

        it('should be safe to call multiple times', () => {
            errorDisplay.clearError();
            errorDisplay.clearError();
            
            expect(container.classList.contains('hidden')).toBe(true);
        });
    });

    describe('hasError', () => {
        it('should return false when no error is displayed', () => {
            expect(errorDisplay.hasError()).toBe(false);
        });

        it('should return true when error is displayed', () => {
            errorDisplay.showError('Test error');
            expect(errorDisplay.hasError()).toBe(true);
        });

        it('should return false after clearing error', () => {
            errorDisplay.showError('Test error');
            errorDisplay.clearError();
            expect(errorDisplay.hasError()).toBe(false);
        });
    });

    describe('Error Type Distinction', () => {
        it('should distinguish between syntax and runtime errors', () => {
            const syntaxError = {
                message: 'Syntax problem',
                type: 'syntax',
                line: 1
            };
            
            errorDisplay.showError(syntaxError);
            expect(container.textContent).toContain('Syntax Error');
            
            const runtimeError = {
                message: 'Runtime problem',
                type: 'runtime',
                line: 2
            };
            
            errorDisplay.showError(runtimeError);
            expect(container.textContent).toContain('Runtime Error');
            expect(container.textContent).not.toContain('Syntax Error');
        });
    });

    describe('updateStyles', () => {
        it('should allow custom styling', () => {
            errorDisplay.updateStyles({
                backgroundColor: 'rgb(255, 0, 0)',
                padding: '2rem'
            });
            
            expect(container.style.backgroundColor).toBe('rgb(255, 0, 0)');
            expect(container.style.padding).toBe('2rem');
        });
    });

    describe('Error Message Formatting', () => {
        it('should format error messages with proper structure', () => {
            const error = {
                message: 'Detailed error message',
                type: 'syntax',
                line: 15,
                column: 8
            };
            
            errorDisplay.showError(error);
            
            // Check that all components are present
            expect(container.textContent).toContain('Syntax Error');
            expect(container.textContent).toContain('Detailed error message');
            expect(container.textContent).toContain('Line 15');
            expect(container.textContent).toContain('Column 8');
        });

        it('should handle long error messages', () => {
            const longMessage = 'This is a very long error message that should wrap properly and not break the layout. '.repeat(5);
            
            errorDisplay.showError({
                message: longMessage,
                type: 'runtime',
                line: 100
            });
            
            expect(container.textContent).toContain(longMessage);
        });

        it('should handle special characters in error messages', () => {
            const specialMessage = 'Error with <special> & "characters" \'here\'';
            
            errorDisplay.showError({
                message: specialMessage,
                type: 'runtime'
            });
            
            expect(container.textContent).toContain(specialMessage);
        });
    });
});
