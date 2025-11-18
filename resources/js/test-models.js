/**
 * Simple test file to verify model implementations
 * This can be run in the browser console to verify functionality
 */

import { VIEWPORT_PRESETS, createProject, isValidProject, isValidViewportSize } from './models/project.js';
import { createCodeError, parseError, formatError, isValidCodeError } from './models/error.js';
import { 
    isLocalStorageAvailable, 
    saveProjectToLocalStorage, 
    loadProjectFromLocalStorage,
    clearLocalStorage 
} from './utils/local-storage.js';

// Test Project Model
console.log('Testing Project Model...');
console.log('VIEWPORT_PRESETS:', VIEWPORT_PRESETS);

const testProject = createProject('Test Project', VIEWPORT_PRESETS[0], '// test code');
console.log('Created project:', testProject);
console.log('Is valid project:', isValidProject(testProject));
console.log('Is valid viewport:', isValidViewportSize(VIEWPORT_PRESETS[0]));

// Test Error Model
console.log('\nTesting Error Model...');
const syntaxError = createCodeError('Unexpected token', 'syntax', 5, 10);
console.log('Created syntax error:', syntaxError);
console.log('Formatted error:', formatError(syntaxError));
console.log('Is valid error:', isValidCodeError(syntaxError));

const jsError = new Error('Test error');
const parsedError = parseError(jsError, 'runtime');
console.log('Parsed JS error:', parsedError);

// Test LocalStorage
console.log('\nTesting LocalStorage...');
console.log('LocalStorage available:', isLocalStorageAvailable());

if (isLocalStorageAvailable()) {
    const saved = saveProjectToLocalStorage(testProject);
    console.log('Save successful:', saved);
    
    const loaded = loadProjectFromLocalStorage();
    console.log('Loaded project:', loaded);
    console.log('Projects match:', JSON.stringify(testProject) === JSON.stringify(loaded));
    
    clearLocalStorage();
    console.log('Storage cleared');
}

console.log('\nAll model tests completed!');
