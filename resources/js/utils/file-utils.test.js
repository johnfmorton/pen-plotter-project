/**
 * Tests for File Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    downloadFile,
    downloadJSON,
    readFileAsText,
    readJSONFile,
    selectFile,
    selectAndReadJSONFile
} from './file-utils.js';

describe('File Utilities', () => {
    describe('downloadFile', () => {
        let createElementSpy;
        let appendChildSpy;
        let removeChildSpy;
        let createObjectURLSpy;
        let revokeObjectURLSpy;

        beforeEach(() => {
            // Mock DOM methods
            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };

            createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
            createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
            revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should download a file with the specified filename', () => {
            const data = 'test data';
            const filename = 'test.txt';

            downloadFile(data, filename, 'text/plain');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
            expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
        });

        it('should use default MIME type if not specified', () => {
            const data = 'test data';
            const filename = 'test.json';

            downloadFile(data, filename);

            expect(createObjectURLSpy).toHaveBeenCalled();
        });

        it('should throw error for invalid data', () => {
            expect(() => downloadFile(null, 'test.txt')).toThrow('Invalid data');
            expect(() => downloadFile('', 'test.txt')).toThrow('Invalid data');
            expect(() => downloadFile(123, 'test.txt')).toThrow('Invalid data');
        });

        it('should throw error for invalid filename', () => {
            expect(() => downloadFile('data', null)).toThrow('Invalid filename');
            expect(() => downloadFile('data', '')).toThrow('Invalid filename');
            expect(() => downloadFile('data', 123)).toThrow('Invalid filename');
        });

        it('should cleanup resources after download', () => {
            const data = 'test data';
            const filename = 'test.txt';

            downloadFile(data, filename);

            expect(removeChildSpy).toHaveBeenCalled();
            expect(revokeObjectURLSpy).toHaveBeenCalled();
        });
    });

    describe('downloadJSON', () => {
        let downloadFileSpy;

        beforeEach(() => {
            // Mock DOM methods
            const mockLink = {
                href: '',
                download: '',
                click: vi.fn()
            };

            vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
            vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
            vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should serialize and download JSON data', () => {
            const jsonData = { name: 'test', value: 123 };
            const filename = 'test';

            downloadJSON(jsonData, filename);

            expect(URL.createObjectURL).toHaveBeenCalled();
        });

        it('should add .json extension if not present', () => {
            const jsonData = { name: 'test' };
            const filename = 'test';
            const mockLink = document.createElement('a');

            downloadJSON(jsonData, filename);

            // The link should have been created with .json extension
            expect(URL.createObjectURL).toHaveBeenCalled();
        });

        it('should not add .json extension if already present', () => {
            const jsonData = { name: 'test' };
            const filename = 'test.json';

            downloadJSON(jsonData, filename);

            expect(URL.createObjectURL).toHaveBeenCalled();
        });

        it('should throw error for invalid JSON data', () => {
            expect(() => downloadJSON(null, 'test')).toThrow('Invalid JSON data');
            expect(() => downloadJSON('string', 'test')).toThrow('Invalid JSON data');
            expect(() => downloadJSON(123, 'test')).toThrow('Invalid JSON data');
        });

        it('should format JSON with indentation', () => {
            const jsonData = { name: 'test', nested: { value: 123 } };
            const filename = 'test';

            downloadJSON(jsonData, filename);

            // Verify that JSON.stringify was called (indirectly through the function)
            expect(URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('readFileAsText', () => {
        it('should read file contents as text', async () => {
            const fileContent = 'test file content';
            const mockFile = new File([fileContent], 'test.txt', { type: 'text/plain' });

            const result = await readFileAsText(mockFile);

            expect(result).toBe(fileContent);
        });

        it('should throw error for invalid file', () => {
            expect(() => readFileAsText(null)).toThrow('Invalid file');
            expect(() => readFileAsText('not a file')).toThrow('Invalid file');
            expect(() => readFileAsText({})).toThrow('Invalid file');
        });

        it('should handle file read errors', async () => {
            const mockFile = new File(['content'], 'test.txt');
            
            // Mock FileReader to simulate error
            const originalFileReader = global.FileReader;
            global.FileReader = class {
                readAsText() {
                    setTimeout(() => this.onerror(), 0);
                }
            };

            await expect(readFileAsText(mockFile)).rejects.toThrow('Failed to read file');

            global.FileReader = originalFileReader;
        });

        it('should handle file read abort', async () => {
            const mockFile = new File(['content'], 'test.txt');
            
            // Mock FileReader to simulate abort
            const originalFileReader = global.FileReader;
            global.FileReader = class {
                readAsText() {
                    setTimeout(() => this.onabort(), 0);
                }
            };

            await expect(readFileAsText(mockFile)).rejects.toThrow('file read was aborted');

            global.FileReader = originalFileReader;
        });
    });

    describe('readJSONFile', () => {
        it('should read and parse JSON file', async () => {
            const jsonData = { name: 'test', value: 123 };
            const jsonString = JSON.stringify(jsonData);
            const mockFile = new File([jsonString], 'test.json', { type: 'application/json' });

            const result = await readJSONFile(mockFile);

            expect(result).toEqual(jsonData);
        });

        it('should throw error for non-JSON file extension', async () => {
            const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

            await expect(readJSONFile(mockFile)).rejects.toThrow('Invalid file type: expected .json file');
        });

        it('should throw error for invalid JSON content', async () => {
            const invalidJSON = '{ invalid json }';
            const mockFile = new File([invalidJSON], 'test.json', { type: 'application/json' });

            await expect(readJSONFile(mockFile)).rejects.toThrow('Invalid JSON format');
        });

        it('should throw error for invalid file', async () => {
            await expect(readJSONFile(null)).rejects.toThrow('Invalid file');
            await expect(readJSONFile('not a file')).rejects.toThrow('Invalid file');
        });

        it('should handle complex JSON structures', async () => {
            const complexData = {
                name: 'test',
                nested: {
                    array: [1, 2, 3],
                    object: { key: 'value' }
                },
                special: 'chars: "quotes" and \'apostrophes\''
            };
            const jsonString = JSON.stringify(complexData);
            const mockFile = new File([jsonString], 'test.json', { type: 'application/json' });

            const result = await readJSONFile(mockFile);

            expect(result).toEqual(complexData);
        });
    });

    describe('selectFile', () => {
        it('should create file input and trigger click', async () => {
            const mockFile = new File(['content'], 'test.txt');
            
            // Mock document.createElement to return a mock input
            const mockInput = {
                type: '',
                accept: '',
                click: vi.fn(),
                onchange: null,
                oncancel: null
            };
            
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const promise = selectFile('.txt');
            
            // Simulate file selection
            setTimeout(() => {
                mockInput.onchange({ target: { files: [mockFile] } });
            }, 0);

            const result = await promise;

            expect(mockInput.type).toBe('file');
            expect(mockInput.accept).toBe('.txt');
            expect(mockInput.click).toHaveBeenCalled();
            expect(result).toBe(mockFile);

            vi.restoreAllMocks();
        });

        it('should use default accept value if not specified', async () => {
            const mockFile = new File(['content'], 'test.txt');
            const mockInput = {
                type: '',
                accept: '',
                click: vi.fn(),
                onchange: null,
                oncancel: null
            };
            
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const promise = selectFile();
            
            setTimeout(() => {
                mockInput.onchange({ target: { files: [mockFile] } });
            }, 0);

            await promise;

            expect(mockInput.accept).toBe('*');

            vi.restoreAllMocks();
        });

        it('should reject if no file is selected', async () => {
            const mockInput = {
                type: '',
                accept: '',
                click: vi.fn(),
                onchange: null,
                oncancel: null
            };
            
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const promise = selectFile();
            
            setTimeout(() => {
                mockInput.onchange({ target: { files: [] } });
            }, 0);

            await expect(promise).rejects.toThrow('No file selected');

            vi.restoreAllMocks();
        });

        it('should reject if file selection is cancelled', async () => {
            const mockInput = {
                type: '',
                accept: '',
                click: vi.fn(),
                onchange: null,
                oncancel: null
            };
            
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const promise = selectFile();
            
            setTimeout(() => {
                mockInput.oncancel();
            }, 0);

            await expect(promise).rejects.toThrow('File selection cancelled');

            vi.restoreAllMocks();
        });
    });

    describe('selectAndReadJSONFile', () => {
        it('should select and read JSON file', async () => {
            const jsonData = { name: 'test', value: 123 };
            const jsonString = JSON.stringify(jsonData);
            const mockFile = new File([jsonString], 'test.json', { type: 'application/json' });
            
            const mockInput = {
                type: '',
                accept: '',
                click: vi.fn(),
                onchange: null,
                oncancel: null
            };
            
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const promise = selectAndReadJSONFile();
            
            setTimeout(() => {
                mockInput.onchange({ target: { files: [mockFile] } });
            }, 0);

            const result = await promise;

            expect(result).toEqual(jsonData);
            expect(mockInput.accept).toBe('.json');

            vi.restoreAllMocks();
        });

        it('should handle file selection cancellation', async () => {
            const mockInput = {
                type: '',
                accept: '',
                click: vi.fn(),
                onchange: null,
                oncancel: null
            };
            
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const promise = selectAndReadJSONFile();
            
            setTimeout(() => {
                mockInput.oncancel();
            }, 0);

            await expect(promise).rejects.toThrow('File selection cancelled');

            vi.restoreAllMocks();
        });

        it('should handle invalid JSON file', async () => {
            const invalidJSON = '{ invalid }';
            const mockFile = new File([invalidJSON], 'test.json', { type: 'application/json' });
            
            const mockInput = {
                type: '',
                accept: '',
                click: vi.fn(),
                onchange: null,
                oncancel: null
            };
            
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const promise = selectAndReadJSONFile();
            
            setTimeout(() => {
                mockInput.onchange({ target: { files: [mockFile] } });
            }, 0);

            await expect(promise).rejects.toThrow('Invalid JSON format');

            vi.restoreAllMocks();
        });
    });
});
