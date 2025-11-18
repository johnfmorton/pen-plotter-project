/**
 * Unit Tests for CodeEditor
 * 
 * Tests the core functionality of the CodeEditor component including:
 * - Initialization
 * - Getting and setting values
 * - Event listeners
 * - Error highlighting
 * - Auto-save functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodeEditor } from './code-editor.js';

describe('CodeEditor', () => {
    let container;
    let editor;
    let mockMonaco;

    beforeEach(() => {
        // Create a container element
        container = document.createElement('div');
        container.id = 'test-editor';
        document.body.appendChild(container);

        // Mock Monaco Editor
        const mockEditorInstance = {
            getValue: vi.fn(() => ''),
            setValue: vi.fn(),
            onDidChangeModelContent: vi.fn((callback) => {
                mockEditorInstance._changeCallback = callback;
                return { dispose: vi.fn() };
            }),
            deltaDecorations: vi.fn((oldDecorations, newDecorations) => {
                return newDecorations.map((_, i) => `decoration-${i}`);
            }),
            dispose: vi.fn(),
            _changeCallback: null,
            _triggerChange: function() {
                if (this._changeCallback) {
                    this._changeCallback();
                }
            }
        };

        mockMonaco = {
            editor: {
                create: vi.fn(() => mockEditorInstance)
            },
            Range: class Range {
                constructor(startLine, startCol, endLine, endCol) {
                    this.startLineNumber = startLine;
                    this.startColumn = startCol;
                    this.endLineNumber = endLine;
                    this.endColumn = endCol;
                }
            }
        };

        // Set up global Monaco
        window.monaco = mockMonaco;
    });

    afterEach(() => {
        if (editor) {
            editor.dispose();
        }
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
        delete window.monaco;
    });

    describe('Constructor', () => {
        it('should throw error if container element is not provided', () => {
            expect(() => new CodeEditor(null)).toThrow('Container element is required for CodeEditor');
        });

        it('should create instance with valid container', () => {
            editor = new CodeEditor(container);
            expect(editor).toBeInstanceOf(CodeEditor);
            expect(editor.container).toBe(container);
        });
    });

    describe('Initialization', () => {
        it('should throw error if Monaco is not loaded', () => {
            delete window.monaco;
            editor = new CodeEditor(container);
            expect(() => editor.init()).toThrow('Monaco Editor is not loaded');
        });

        it('should initialize Monaco Editor with default configuration', () => {
            editor = new CodeEditor(container);
            editor.init();

            expect(mockMonaco.editor.create).toHaveBeenCalledWith(
                container,
                expect.objectContaining({
                    value: '',
                    language: 'javascript',
                    theme: 'vs-dark',
                    automaticLayout: true,
                })
            );
        });

        it('should initialize with provided initial value', () => {
            editor = new CodeEditor(container);
            const initialCode = 'console.log("Hello");';
            editor.init(initialCode);

            expect(mockMonaco.editor.create).toHaveBeenCalledWith(
                container,
                expect.objectContaining({
                    value: initialCode
                })
            );
        });

        it('should set up change listener on initialization', () => {
            editor = new CodeEditor(container);
            editor.init();

            expect(editor.editor.onDidChangeModelContent).toHaveBeenCalled();
        });
    });

    describe('getValue and setValue', () => {
        beforeEach(() => {
            editor = new CodeEditor(container);
            editor.init();
        });

        it('should throw error when getting value before initialization', () => {
            const uninitEditor = new CodeEditor(container);
            expect(() => uninitEditor.getValue()).toThrow('Editor is not initialized');
        });

        it('should get current code value', () => {
            const testCode = 'const x = 10;';
            editor.editor.getValue.mockReturnValue(testCode);

            expect(editor.getValue()).toBe(testCode);
            expect(editor.editor.getValue).toHaveBeenCalled();
        });

        it('should throw error when setting value before initialization', () => {
            const uninitEditor = new CodeEditor(container);
            expect(() => uninitEditor.setValue('test')).toThrow('Editor is not initialized');
        });

        it('should set code value', () => {
            const testCode = 'const y = 20;';
            editor.setValue(testCode);

            expect(editor.editor.setValue).toHaveBeenCalledWith(testCode);
        });
    });

    describe('Event Listeners', () => {
        beforeEach(() => {
            editor = new CodeEditor(container);
            editor.init();
        });

        it('should register change event listener', () => {
            const callback = vi.fn();
            editor.on('change', callback);

            expect(editor.changeListeners).toContain(callback);
        });

        it('should throw error for invalid callback', () => {
            expect(() => editor.on('change', 'not a function')).toThrow('Callback must be a function');
        });

        it('should throw error for unsupported event', () => {
            expect(() => editor.on('invalid', vi.fn())).toThrow('Unsupported event: invalid');
        });

        it('should trigger change listeners when code changes', () => {
            const callback = vi.fn();
            editor.on('change', callback);

            const testCode = 'const z = 30;';
            editor.editor.getValue.mockReturnValue(testCode);

            // Simulate code change
            editor.editor._triggerChange();

            expect(callback).toHaveBeenCalledWith(testCode);
        });

        it('should handle multiple change listeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            editor.on('change', callback1);
            editor.on('change', callback2);

            const testCode = 'const a = 1;';
            editor.editor.getValue.mockReturnValue(testCode);

            editor.editor._triggerChange();

            expect(callback1).toHaveBeenCalledWith(testCode);
            expect(callback2).toHaveBeenCalledWith(testCode);
        });

        it('should handle errors in change listeners gracefully', () => {
            const errorCallback = vi.fn(() => { throw new Error('Listener error'); });
            const goodCallback = vi.fn();
            
            editor.on('change', errorCallback);
            editor.on('change', goodCallback);

            const testCode = 'const b = 2;';
            editor.editor.getValue.mockReturnValue(testCode);

            // Should not throw
            expect(() => editor.editor._triggerChange()).not.toThrow();
            
            // Good callback should still be called
            expect(goodCallback).toHaveBeenCalled();
        });
    });

    describe('Error Highlighting', () => {
        beforeEach(() => {
            editor = new CodeEditor(container);
            editor.init();
        });

        it('should throw error when highlighting before initialization', () => {
            const uninitEditor = new CodeEditor(container);
            expect(() => uninitEditor.highlightError(1, 'Error')).toThrow('Editor is not initialized');
        });

        it('should highlight error at specified line', () => {
            const line = 5;
            const message = 'Syntax error';

            editor.highlightError(line, message);

            expect(editor.editor.deltaDecorations).toHaveBeenCalled();
            const decorationCall = editor.editor.deltaDecorations.mock.calls[0];
            const newDecorations = decorationCall[1];

            expect(newDecorations).toHaveLength(1);
            expect(newDecorations[0].range.startLineNumber).toBe(line);
            expect(newDecorations[0].options.hoverMessage.value).toBe(message);
        });

        it('should clear previous errors when highlighting new error', () => {
            editor.highlightError(1, 'Error 1');
            const firstDecorations = editor.decorations;

            editor.highlightError(2, 'Error 2');

            // Should clear old decorations
            expect(editor.editor.deltaDecorations).toHaveBeenCalledWith(
                firstDecorations,
                []
            );
        });

        it('should add error styles to document', () => {
            editor.highlightError(1, 'Error');

            const styleElement = document.getElementById('code-editor-error-styles');
            expect(styleElement).toBeTruthy();
            expect(styleElement.textContent).toContain('.error-line');
        });

        it('should not add duplicate error styles', () => {
            editor.highlightError(1, 'Error 1');
            editor.highlightError(2, 'Error 2');

            const styleElements = document.querySelectorAll('#code-editor-error-styles');
            expect(styleElements.length).toBe(1);
        });
    });

    describe('Clear Errors', () => {
        beforeEach(() => {
            editor = new CodeEditor(container);
            editor.init();
        });

        it('should clear error decorations', () => {
            editor.highlightError(1, 'Error');
            const decorations = editor.decorations;

            editor.clearErrors();

            expect(editor.editor.deltaDecorations).toHaveBeenCalledWith(decorations, []);
            expect(editor.decorations).toHaveLength(0);
        });

        it('should handle clearing when no errors exist', () => {
            expect(() => editor.clearErrors()).not.toThrow();
        });

        it('should not throw if editor is not initialized', () => {
            const uninitEditor = new CodeEditor(container);
            expect(() => uninitEditor.clearErrors()).not.toThrow();
        });
    });

    describe('Auto-save', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            editor = new CodeEditor(container);
            editor.init();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should trigger auto-save after debounce delay', () => {
            const autoSaveListener = vi.fn();
            container.addEventListener('autosave', autoSaveListener);

            const testCode = 'const x = 1;';
            editor.editor.getValue.mockReturnValue(testCode);

            // Trigger change
            editor.editor._triggerChange();

            // Should not trigger immediately
            expect(autoSaveListener).not.toHaveBeenCalled();

            // Fast-forward time
            vi.advanceTimersByTime(1000);

            // Should trigger after 1 second
            expect(autoSaveListener).toHaveBeenCalled();
            expect(autoSaveListener.mock.calls[0][0].detail.code).toBe(testCode);
        });

        it('should debounce multiple rapid changes', () => {
            const autoSaveListener = vi.fn();
            container.addEventListener('autosave', autoSaveListener);

            // Trigger multiple changes rapidly
            editor.editor._triggerChange();
            vi.advanceTimersByTime(500);
            editor.editor._triggerChange();
            vi.advanceTimersByTime(500);
            editor.editor._triggerChange();

            // Should not have triggered yet
            expect(autoSaveListener).not.toHaveBeenCalled();

            // Fast-forward past debounce delay
            vi.advanceTimersByTime(1000);

            // Should only trigger once
            expect(autoSaveListener).toHaveBeenCalledTimes(1);
        });
    });

    describe('Dispose', () => {
        beforeEach(() => {
            editor = new CodeEditor(container);
            editor.init();
        });

        it('should dispose editor instance', () => {
            const mockDispose = editor.editor.dispose;
            
            editor.dispose();

            expect(mockDispose).toHaveBeenCalled();
            expect(editor.editor).toBeNull();
        });

        it('should clear auto-save timer', () => {
            vi.useFakeTimers();
            
            // Trigger a change to start auto-save timer
            editor.editor._triggerChange();
            
            // Dispose before timer fires
            editor.dispose();
            
            // Advance time
            vi.advanceTimersByTime(1000);
            
            // Auto-save should not trigger
            const autoSaveListener = vi.fn();
            container.addEventListener('autosave', autoSaveListener);
            expect(autoSaveListener).not.toHaveBeenCalled();
            
            vi.useRealTimers();
        });

        it('should clear change listeners', () => {
            const callback = vi.fn();
            editor.on('change', callback);

            editor.dispose();

            expect(editor.changeListeners).toHaveLength(0);
        });

        it('should clear decorations', () => {
            editor.highlightError(1, 'Error');
            editor.dispose();

            expect(editor.decorations).toHaveLength(0);
        });
    });
});
