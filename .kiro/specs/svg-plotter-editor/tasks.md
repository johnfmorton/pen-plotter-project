# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Create Laravel route for the SVG editor page
  - Set up Blade template for the main editor view
  - Install and configure SVG.js library via npm
  - Install and configure Monaco Editor via npm
  - Configure Vite to bundle frontend assets
  - _Requirements: 1.6, 6.1, 6.2, 6.4_

- [x] 2. Implement core data models and utilities
  - [x] 2.1 Create Project model interface in JavaScript
    - Define Project interface with name, code, viewportSize, timestamps
    - Define ViewportSize interface with width, height, label
    - Create VIEWPORT_PRESETS constant array
    - _Requirements: 3.3, 3.4, 3.7_

  - [x] 2.2 Create Error model interface
    - Define CodeError interface with message, line, column, type
    - _Requirements: 8.1, 8.2_

  - [x] 2.3 Implement localStorage wrapper utility
    - Create functions for saving/loading project data
    - Handle QuotaExceededError gracefully
    - Detect localStorage availability
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 2.4 Write property test for localStorage round trip
    - **Property 23: LocalStorage round trip**
    - **Validates: Requirements 7.2**

- [x] 3. Implement ProjectManager component
  - [x] 3.1 Create ProjectManager class
    - Implement createProject method
    - Implement saveToFile method with JSON serialization
    - Implement loadFromFile method with validation
    - Implement saveToLocalStorage method
    - Implement loadFromLocalStorage method
    - _Requirements: 3.5, 3.7, 4.1, 4.2, 4.4, 4.5, 5.2, 5.3, 7.1, 7.2, 7.4_

  - [x] 3.2 Write property test for save-load round trip
    - **Property 16: Save-load round trip preserves formatting**
    - **Validates: Requirements 4.5**

  - [x] 3.3 Write property test for save completeness
    - **Property 13: Save completeness**
    - **Validates: Requirements 4.2**

  - [ ]* 3.4 Write property test for load restoration
    - **Property 18: Load restoration completeness**
    - **Validates: Requirements 5.3**

  - [ ]* 3.5 Write property test for invalid file handling
    - **Property 19: Invalid file error handling**
    - **Validates: Requirements 5.4**

- [-] 4. Implement SVGGenerator component
  - [x] 4.1 Create SVGGenerator class
    - Initialize SVG.js instance with viewport dimensions
    - Implement execute method with Function constructor
    - Add timeout protection (5 second limit)
    - Capture and format syntax errors
    - Capture and format runtime errors
    - Return generated SVG markup
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [x] 4.2 Write property test for SVG.js instance availability
    - **Property 2: SVG.js instance availability**
    - **Validates: Requirements 1.2**

  - [ ]* 4.3 Write property test for SVG markup capture
    - **Property 3: SVG markup capture**
    - **Validates: Requirements 1.3**

  - [ ]* 4.4 Write property test for syntax error reporting
    - **Property 4: Syntax error reporting**
    - **Validates: Requirements 1.4**

  - [ ]* 4.5 Write property test for runtime error handling
    - **Property 5: Runtime error handling**
    - **Validates: Requirements 1.5**

- [x] 5. Implement CodeEditor component
  - [x] 5.1 Create CodeEditor class with Monaco Editor
    - Initialize Monaco Editor instance
    - Configure JavaScript language support
    - Implement getValue and setValue methods
    - Add event listeners for code changes
    - Implement error highlighting
    - Add debounced auto-save (1 second)
    - _Requirements: 1.1, 1.4, 7.1, 7.5, 8.1_

  - [x] 5.2 Write property test for code storage
    - **Property 1: Code storage persistence**
    - **Validates: Requirements 1.1**

  - [x] 5.3 Write property test for auto-save to localStorage
    - **Property 22: LocalStorage auto-save**
    - **Validates: Requirements 7.1**

- [x] 6. Implement PreviewPanel component
  - [x] 6.1 Create PreviewPanel class
    - Create container for SVG rendering
    - Implement render method to display SVG
    - Implement clear method
    - Implement setViewportSize method
    - Calculate and apply appropriate scaling
    - Maintain aspect ratio based on viewport
    - Add error display area
    - _Requirements: 2.2, 2.5, 3.6, 8.3_

  - [x] 6.2 Write property test for aspect ratio preservation
    - **Property 8: Aspect ratio preservation**
    - **Validates: Requirements 2.5**

  - [x] 6.3 Write property test for canvas viewport synchronization
    - **Property 10: Canvas viewport synchronization**
    - **Validates: Requirements 3.6**

- [x] 7. Implement ControlPanel component
  - [x] 7.1 Create ControlPanel class
    - Create button elements (New Project, Save, Open, Regenerate, Export)
    - Implement event listener registration methods
    - Implement button state management (enable/disable)
    - Style buttons with Tailwind CSS
    - _Requirements: 6.4_

- [x] 8. Implement new project dialog
  - [x] 8.1 Create project creation dialog UI
    - Create modal dialog with project name input
    - Add viewport size radio buttons/dropdown
    - Set default viewport to 8.5x11
    - Add confirm and cancel buttons
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 8.2 Write property test for new project state reset
    - **Property 9: New project state reset**
    - **Validates: Requirements 3.5**

  - [ ]* 8.3 Write property test for project metadata storage
    - **Property 11: Project metadata storage**
    - **Validates: Requirements 3.7**

- [x] 9. Implement main PlotterApp orchestrator
  - [x] 9.1 Create PlotterApp class
    - Initialize all components
    - Wire up event handlers
    - Implement handleNewProject method
    - Implement handleSave method with download trigger
    - Implement handleOpen method with file picker
    - Implement handleRegenerate method
    - Implement handleExport method
    - Load initial state from localStorage or show default
    - _Requirements: 2.1, 2.4, 3.1, 4.3, 5.1, 5.5, 7.2, 7.3, 9.1_

  - [ ]* 9.2 Write property test for regenerate updates preview
    - **Property 6: Regenerate updates preview**
    - **Validates: Requirements 2.1**

  - [ ]* 9.3 Write property test for error state preservation
    - **Property 7: Error state preservation**
    - **Validates: Requirements 2.4**

  - [ ]* 9.4 Write property test for save triggers download
    - **Property 14: Save triggers download**
    - **Validates: Requirements 4.3**

  - [ ]* 9.5 Write property test for load triggers regeneration
    - **Property 20: Load triggers regeneration**
    - **Validates: Requirements 5.5**

  - [ ]* 9.6 Write property test for file load updates localStorage
    - **Property 24: File load updates localStorage**
    - **Validates: Requirements 7.4**

- [x] 10. Implement SVG export functionality
  - [x] 10.1 Create SVG export utility
    - Extract SVG markup from preview
    - Add XML declaration and namespaces
    - Set viewBox attribute to match viewport
    - Trigger file download with .svg extension
    - Preserve all paths, strokes, and attributes
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_

  - [ ]* 10.2 Write property test for export includes XML declarations
    - **Property 29: Export includes XML declarations**
    - **Validates: Requirements 9.2**

  - [ ]* 10.3 Write property test for export viewBox matches viewport
    - **Property 30: Export viewBox matches viewport**
    - **Validates: Requirements 9.3**

  - [ ]* 10.4 Write property test for export preservation
    - **Property 32: Export preservation round trip**
    - **Validates: Requirements 9.6**

- [x] 11. Implement error handling and display
  - [x] 11.1 Create error display component
    - Create error message container
    - Implement showError method with error type distinction
    - Implement clearError method
    - Format error messages with line numbers
    - Style error display for visibility
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 11.2 Write property test for error message line numbers
    - **Property 25: Error message includes line number**
    - **Validates: Requirements 8.1**

  - [ ]* 11.3 Write property test for error type distinction
    - **Property 26: Error type distinction**
    - **Validates: Requirements 8.2**

  - [ ]* 11.4 Write property test for error clearing
    - **Property 27: Error clearing on success**
    - **Validates: Requirements 8.4**

- [x] 12. Implement responsive layout
  - [x] 12.1 Create main layout with Tailwind CSS
    - Create two-column grid layout
    - Position Preview Panel on left
    - Position Code Panel on right
    - Make layout responsive to window resizing
    - Ensure adequate space for both panels
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 12.2 Write property test for responsive layout proportions
    - **Property 21: Responsive layout proportions**
    - **Validates: Requirements 6.3**

- [x] 13. Create default example template
  - [x] 13.1 Write starter code example
    - Create simple SVG.js example (e.g., circle pattern)
    - Add helpful comments explaining SVG.js usage
    - Set as default when no localStorage data exists
    - _Requirements: 7.3_

- [x] 14. Implement file download/upload utilities
  - [x] 14.1 Create file download utility
    - Create Blob from JSON data
    - Trigger browser download with filename
    - Handle browser compatibility
    - _Requirements: 4.3, 9.4_

  - [x] 14.2 Create file upload utility
    - Create file input element
    - Read file as text
    - Parse JSON and validate structure
    - Handle file read errors
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ]* 14.3 Write property test for filename matches project name
    - **Property 15: Filename matches project name**
    - **Validates: Requirements 4.4**

  - [ ]* 14.4 Write property test for export file extension
    - **Property 31: Export file extension**
    - **Validates: Requirements 9.4**

- [x] 15. Create Laravel route and Blade template
  - [x] 15.1 Set up route and controller
    - Create route in web.php for /plotter-editor
    - Create PlotterEditorController with index method
    - Create Blade template at resources/views/plotter-editor.blade.php
    - Include Vite directives for CSS and JS
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 16. Style the application with Tailwind CSS
  - [x] 16.1 Design and implement UI styling
    - Style Preview Panel with border and background
    - Style Code Panel with proper spacing
    - Style buttons with hover states
    - Style error messages for visibility
    - Style project creation dialog
    - Ensure responsive design
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.3_

- [ ] 17. Add viewport size display
  - [ ] 17.1 Create viewport info display
    - Show current viewport dimensions in UI
    - Update display when viewport changes
    - Show dimensions in inches
    - _Requirements: 3.6_

- [ ] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Integration testing and bug fixes
  - [ ] 19.1 Test complete user workflows
    - Test: Create project → write code → regenerate → save → load
    - Test: Open project → modify → export
    - Test: Error handling → fix → regenerate
    - Test: Page refresh → state restoration
    - Fix any bugs discovered during testing
    - _Requirements: All_

  - [ ]* 19.2 Write integration tests for user workflows
    - Test complete user journeys
    - Verify component interactions
    - Test error recovery flows

- [ ] 20. Documentation and polish
  - [ ] 20.1 Add inline code documentation
    - Document all public methods
    - Add JSDoc comments
    - Document SVG.js usage patterns
    - _Requirements: All_

  - [ ] 20.2 Create user-facing help text
    - Add tooltips to buttons
    - Add help text for viewport sizes
    - Add example code comments
    - _Requirements: 3.3, 6.4_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
