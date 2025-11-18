# Design Document

## Overview

The SVG Plotter Editor is a web-based generative art tool built on Laravel 12 that enables artists to create pen plotter artwork using JavaScript and the SVG.js library. The application features a split-panel interface with real-time preview capabilities, project management, and file persistence. Artists write JavaScript code that leverages SVG.js to generate vector graphics, which can be exported for use with pen plotting hardware.

## Architecture

### High-Level Architecture

The application follows a client-heavy architecture where most of the creative work happens in the browser:

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌────────────────┐              ┌──────────────────┐  │
│  │  Preview Panel │              │   Code Panel     │  │
│  │   (SVG View)   │              │  - Code Editor   │  │
│  │                │              │  - Control Btns  │  │
│  └────────────────┘              └──────────────────┘  │
│           │                               │             │
│           └───────────┬───────────────────┘             │
│                       │                                 │
│              ┌────────▼────────┐                       │
│              │  SVG Generator  │                       │
│              │   (SVG.js)      │                       │
│              └────────┬────────┘                       │
│                       │                                 │
│              ┌────────▼────────┐                       │
│              │ Project Manager │                       │
│              │ (LocalStorage)  │                       │
│              └─────────────────┘                       │
└─────────────────────────────────────────────────────────┘
                        │
                        │ (Optional: Future API)
                        ▼
              ┌─────────────────┐
              │ Laravel Backend │
              │  (File Storage) │
              └─────────────────┘
```

### Technology Stack

**Frontend:**
- Vite 7 for asset bundling
- Tailwind CSS 4 for styling
- SVG.js 3.2+ for SVG generation
- Monaco Editor or CodeMirror for code editing
- Vanilla JavaScript for application logic

**Backend:**
- Laravel 12 (PHP 8.4)
- Blade templates for initial page rendering
- SQLite/MySQL for future server-side features (optional)

## Components and Interfaces

### 1. Main Application Component

**Responsibility:** Orchestrates the overall application, manages state, and coordinates between panels.

**Key Methods:**
```javascript
class PlotterApp {
    constructor()
    init()
    handleNewProject()
    handleSave()
    handleOpen()
    handleRegenerate()
    handleExport()
}
```

### 2. Code Editor Component

**Responsibility:** Provides the code editing interface with syntax highlighting and error detection.

**Key Features:**
- Syntax highlighting for JavaScript
- Line numbers
- Auto-indentation
- Error highlighting
- Debounced auto-save to localStorage

**Interface:**
```javascript
class CodeEditor {
    constructor(containerElement)
    getValue(): string
    setValue(code: string): void
    on(event: string, callback: Function): void
    highlightError(line: number, message: string): void
    clearErrors(): void
}
```

### 3. Preview Panel Component

**Responsibility:** Renders the generated SVG and manages the viewport display.

**Key Features:**
- SVG rendering with proper scaling
- Viewport dimension display
- Grid overlay (optional)
- Pan and zoom capabilities

**Interface:**
```javascript
class PreviewPanel {
    constructor(containerElement, viewportSize)
    render(svgContent: string): void
    clear(): void
    setViewportSize(width: number, height: number): void
    showError(message: string): void
    clearError(): void
}
```

### 4. SVG Generator Component

**Responsibility:** Executes user code in a safe context and generates SVG using SVG.js.

**Key Features:**
- Sandboxed code execution
- SVG.js instance management
- Error capture and reporting
- Timeout protection

**Interface:**
```javascript
class SVGGenerator {
    constructor(viewportSize)
    execute(code: string): Promise<string>
    setViewportSize(width: number, height: number): void
    getLastError(): Error | null
}
```

### 5. Project Manager Component

**Responsibility:** Handles project metadata, file operations, and localStorage persistence.

**Key Features:**
- Project CRUD operations
- File save/load with JSON format
- localStorage management
- Auto-save functionality

**Interface:**
```javascript
class ProjectManager {
    constructor()
    createProject(name: string, viewportSize: ViewportSize): Project
    saveToFile(project: Project): void
    loadFromFile(file: File): Promise<Project>
    saveToLocalStorage(project: Project): void
    loadFromLocalStorage(): Project | null
    clearLocalStorage(): void
}
```

### 6. Control Panel Component

**Responsibility:** Manages the UI controls (buttons) and their interactions.

**Interface:**
```javascript
class ControlPanel {
    constructor(containerElement)
    onNewProject(callback: Function): void
    onSave(callback: Function): void
    onOpen(callback: Function): void
    onRegenerate(callback: Function): void
    onExport(callback: Function): void
    setButtonState(button: string, enabled: boolean): void
}
```

## Data Models

### Project Model

```javascript
interface Project {
    name: string
    code: string
    viewportSize: ViewportSize
    createdAt: string
    updatedAt: string
}
```

### ViewportSize Model

```javascript
interface ViewportSize {
    width: number   // in inches
    height: number  // in inches
    label: string   // e.g., "8.5x11", "11x8.5", "6x6", "4x5"
}

const VIEWPORT_PRESETS = [
    { width: 8.5, height: 11, label: "8.5x11" },
    { width: 11, height: 8.5, label: "11x8.5" },
    { width: 6, height: 6, label: "6x6" },
    { width: 4, height: 5, label: "4x5" }
]
```

### Error Model

```javascript
interface CodeError {
    message: string
    line: number | null
    column: number | null
    type: 'syntax' | 'runtime'
}
```

## Co
rrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Code storage persistence
*For any* JavaScript code entered in the Code Panel, the code should be stored in the application's memory state.
**Validates: Requirements 1.1**

### Property 2: SVG.js instance availability
*For any* code execution, an initialized SVG.js drawing instance should be accessible to the Plotter Code.
**Validates: Requirements 1.2**

### Property 3: SVG markup capture
*For any* valid Plotter Code execution, the system should capture and return valid SVG markup from the SVG.js instance.
**Validates: Requirements 1.3**

### Property 4: Syntax error reporting
*For any* Plotter Code containing JavaScript syntax errors, the system should display error messages to the Artist.
**Validates: Requirements 1.4**

### Property 5: Runtime error handling
*For any* Plotter Code that throws runtime errors, the system should handle the error gracefully and notify the Artist.
**Validates: Requirements 1.5**

### Property 6: Regenerate updates preview
*For any* valid Plotter Code, clicking the regenerate button should execute the code and update the Preview Panel with the new SVG.
**Validates: Requirements 2.1**

### Property 7: Error state preservation
*For any* Plotter Code execution that fails, the system should maintain the previous preview state and display an error message.
**Validates: Requirements 2.4**

### Property 8: Aspect ratio preservation
*For any* viewport size, the Preview Panel should display the SVG with an aspect ratio that matches the configured viewport dimensions.
**Validates: Requirements 2.5**

### Property 9: New project state reset
*For any* new project creation with selected viewport dimensions, the system should clear the current Plotter Code and set the viewport to the selected dimensions.
**Validates: Requirements 3.5**

### Property 10: Canvas viewport synchronization
*For any* new project creation, the SVG canvas dimensions should match the selected viewport size.
**Validates: Requirements 3.6**

### Property 11: Project metadata storage
*For any* new project creation, the project name and viewport size should be stored in the Project metadata.
**Validates: Requirements 3.7**

### Property 12: Save serialization
*For any* project state, clicking the save button should serialize the current Plotter Code into a Project File.
**Validates: Requirements 4.1**

### Property 13: Save completeness
*For any* Project File save operation, the file should include the Plotter Code, project name, viewport size, and creation timestamp.
**Validates: Requirements 4.2**

### Property 14: Save triggers download
*For any* successful save operation, the system should trigger a file download to the Artist's system.
**Validates: Requirements 4.3**

### Property 15: Filename matches project name
*For any* Project File creation, the filename should match the project name.
**Validates: Requirements 4.4**

### Property 16: Save-load round trip preserves formatting
*For any* Plotter Code containing special characters and formatting, saving and then loading the project should preserve all code formatting and special characters.
**Validates: Requirements 4.5**

### Property 17: File parsing validation
*For any* selected Project File, the system should parse and validate the file contents before loading.
**Validates: Requirements 5.2**

### Property 18: Load restoration completeness
*For any* valid Project File, loading it should restore the Plotter Code, project name, and viewport size to match the saved values.
**Validates: Requirements 5.3**

### Property 19: Invalid file error handling
*For any* invalid file selection, the system should display an error message and maintain the current application state unchanged.
**Validates: Requirements 5.4**

### Property 20: Load triggers regeneration
*For any* successfully loaded Project File, the system should automatically regenerate the preview using the restored viewport dimensions.
**Validates: Requirements 5.5**

### Property 21: Responsive layout proportions
*For any* browser window resize event, the system should maintain the left-right layout proportions between Preview Panel and Code Panel.
**Validates: Requirements 6.3**

### Property 22: LocalStorage auto-save
*For any* modification to the Plotter Code, the system should store the code, project name, and viewport size in browser localStorage.
**Validates: Requirements 7.1**

### Property 23: LocalStorage round trip
*For any* project state saved to localStorage, refreshing the page should restore the Plotter Code, project name, and viewport size to their previous values.
**Validates: Requirements 7.2**

### Property 24: File load updates localStorage
*For any* Project File successfully loaded, the system should update localStorage with the loaded code and project metadata.
**Validates: Requirements 7.4**

### Property 25: Error message includes line number
*For any* Plotter Code that throws a JavaScript error, the displayed error message should include the line number where the error occurred.
**Validates: Requirements 8.1**

### Property 26: Error type distinction
*For any* SVG generation failure, the system should distinguish between syntax errors and runtime errors in the error display.
**Validates: Requirements 8.2**

### Property 27: Error clearing on success
*For any* error state followed by successful code regeneration, the system should clear the error message from display.
**Validates: Requirements 8.4**

### Property 28: Export provides SVG markup
*For any* export request, the system should provide the raw SVG markup for download.
**Validates: Requirements 9.1**

### Property 29: Export includes XML declarations
*For any* exported SVG, the file should include proper XML declarations and namespaces.
**Validates: Requirements 9.2**

### Property 30: Export viewBox matches viewport
*For any* exported SVG, the viewBox attribute should match the project's viewport size dimensions.
**Validates: Requirements 9.3**

### Property 31: Export file extension
*For any* export completion, the system should trigger a file download with the .svg extension.
**Validates: Requirements 9.4**

### Property 32: Export preservation round trip
*For any* generated SVG containing paths, strokes, and attributes, exporting the SVG should preserve all elements without loss.
**Validates: Requirements 9.6**

## Error Handling

### Code Execution Errors

**Syntax Errors:**
- Caught during code parsing before execution
- Display error message with line and column number
- Highlight the problematic line in the code editor
- Maintain previous preview state

**Runtime Errors:**
- Caught during code execution
- Display error message with stack trace
- Identify the line where the error occurred
- Maintain previous preview state
- Log full error details to browser console

**Timeout Protection:**
- Set maximum execution time (e.g., 5 seconds)
- Terminate execution if timeout is exceeded
- Display timeout error message
- Prevent browser freezing

### File Operation Errors

**Save Errors:**
- Browser doesn't support file downloads
- Insufficient permissions
- Display user-friendly error message
- Suggest alternative (copy to clipboard)

**Load Errors:**
- Invalid JSON format
- Missing required fields
- Incompatible file version
- Display specific error message
- Maintain current application state

### LocalStorage Errors

**Storage Quota Exceeded:**
- Catch QuotaExceededError
- Notify user of storage limit
- Offer to clear old data
- Continue operation without localStorage

**Storage Unavailable:**
- Detect if localStorage is disabled
- Display warning message
- Continue with in-memory storage only

### SVG Generation Errors

**Invalid SVG Output:**
- Validate SVG structure after generation
- Check for required attributes
- Display validation errors
- Prevent rendering of invalid SVG

## Testing Strategy

### Unit Testing

The application will use PHPUnit for backend testing and Jest for frontend JavaScript testing.

**Backend Tests:**
- Blade template rendering
- Route configuration
- Asset compilation

**Frontend Tests:**
- Component initialization
- Event handler registration
- State management
- DOM manipulation

**Key Unit Test Areas:**
1. Project Manager serialization/deserialization
2. SVG Generator code execution sandbox
3. LocalStorage wrapper methods
4. File download/upload utilities
5. Error message formatting
6. Viewport size calculations

### Property-Based Testing

The application will use fast-check (JavaScript) for property-based testing of the frontend logic.

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: svg-plotter-editor, Property {number}: {property_text}**`
- Tests focus on universal properties that should hold across all inputs

**Property Test Areas:**

1. **Code Storage and Retrieval:**
   - Any code stored should be retrievable unchanged
   - Round-trip through memory state preserves content

2. **File Serialization:**
   - Save-load round trips preserve all project data
   - Special characters and formatting are preserved
   - All required fields are present in saved files

3. **LocalStorage Persistence:**
   - Data saved to localStorage can be retrieved
   - Page refresh restores previous state
   - Invalid data doesn't crash the application

4. **Viewport Calculations:**
   - Aspect ratios are maintained across transformations
   - Canvas dimensions match viewport specifications
   - Scaling preserves proportions

5. **Error Handling:**
   - Invalid code always produces error messages
   - Error states don't corrupt application state
   - Recovery from errors restores normal operation

6. **SVG Export:**
   - Exported SVG contains all generated elements
   - ViewBox matches viewport dimensions
   - XML structure is valid

### Integration Testing

**User Workflow Tests:**
1. Create new project → write code → regenerate → save → load
2. Open existing project → modify code → export SVG
3. Error recovery → fix code → successful regeneration
4. Page refresh → state restoration → continue work

**Browser Compatibility:**
- Test on Chrome, Firefox, Safari, Edge
- Verify localStorage behavior
- Test file download/upload mechanisms
- Validate SVG rendering

### Manual Testing

**Visual Verification:**
- Preview panel displays correctly
- Layout responds to window resizing
- Error messages are visible and clear
- Buttons are properly positioned

**Plotter Compatibility:**
- Export SVG files to actual plotter software
- Verify dimensions match viewport settings
- Confirm paths render correctly

## Implementation Notes

### Code Editor Choice

**Recommended: Monaco Editor**
- Same editor as VS Code
- Excellent JavaScript support
- Built-in error detection
- Syntax highlighting
- Auto-completion

**Alternative: CodeMirror 6**
- Lighter weight
- Highly customizable
- Good JavaScript support

### SVG.js Integration

**Initialization:**
```javascript
// Create SVG.js instance with viewport dimensions
const draw = SVG()
    .addTo('#preview-panel')
    .size(viewportWidth * DPI, viewportHeight * DPI)
    .viewbox(0, 0, viewportWidth, viewportHeight)
```

**Code Execution Context:**
```javascript
// Provide 'draw' instance to user code
const userFunction = new Function('draw', userCode)
userFunction(draw)
```

### File Format

**Project File Structure (JSON):**
```json
{
    "version": "1.0",
    "name": "My Plotter Art",
    "viewport": {
        "width": 8.5,
        "height": 11,
        "label": "8.5x11"
    },
    "code": "// User's JavaScript code here",
    "createdAt": "2025-11-18T10:30:00Z",
    "updatedAt": "2025-11-18T14:45:00Z"
}
```

### LocalStorage Keys

```javascript
const STORAGE_KEYS = {
    PROJECT: 'plotter_current_project',
    CODE: 'plotter_code',
    VIEWPORT: 'plotter_viewport',
    PROJECT_NAME: 'plotter_project_name'
}
```

### DPI Conversion

Standard conversion: 96 DPI (web standard)
- 8.5 inches = 816 pixels
- 11 inches = 1056 pixels

### Security Considerations

**Code Execution Sandbox:**
- Use Function constructor (not eval)
- No access to window, document (except SVG.js instance)
- Timeout protection
- Error boundary wrapping

**File Upload Validation:**
- Verify JSON structure
- Sanitize loaded code
- Limit file size (e.g., 1MB max)
- Validate viewport dimensions

### Performance Optimizations

**Debouncing:**
- Auto-save to localStorage: 1000ms debounce
- Preview regeneration: Optional auto-regenerate with 500ms debounce

**Code Execution:**
- Clear previous SVG before regeneration
- Dispose of SVG.js instances properly
- Limit execution time

**Memory Management:**
- Clear localStorage periodically
- Limit undo/redo history
- Dispose of unused DOM elements

## Future Enhancements

### Phase 2 Features

1. **Code Templates:**
   - Starter templates for common patterns
   - Example gallery
   - Template categories

2. **Multiple Layers:**
   - Support for multiple pen colors
   - Layer management UI
   - Export layers separately

3. **Parameter Controls:**
   - UI sliders for code variables
   - Real-time parameter adjustment
   - Parameter presets

4. **Server-Side Storage:**
   - User accounts
   - Cloud project storage
   - Project sharing

5. **Advanced Export:**
   - Export to different formats (PDF, DXF)
   - Batch export
   - Print preview

6. **Collaboration:**
   - Share projects via URL
   - Embed projects
   - Community gallery

### Technical Debt Considerations

- Consider TypeScript migration for better type safety
- Implement comprehensive error logging
- Add analytics for feature usage
- Create automated visual regression tests
- Document SVG.js API usage patterns
