/**
 * SVG Plotter Editor - Main Application Entry Point
 * 
 * This file initializes the SVG Plotter Editor application.
 */

import { SVG } from '@svgdotjs/svg.js';
import * as monaco from 'monaco-editor';
import { PlotterApp } from './plotter-app.js';

// Make SVG.js and Monaco available globally for the application
window.SVG = SVG;
window.monaco = monaco;

// Application will be initialized here
console.log('SVG Plotter Editor loaded');
console.log('SVG.js version:', SVG.VERSION || 'loaded');
console.log('Monaco Editor loaded:', !!monaco);

// Initialize PlotterApp when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready - Initializing PlotterApp');
    
    try {
        const app = new PlotterApp();
        app.init();
        
        // Make app available globally for debugging
        window.plotterApp = app;
        
        console.log('PlotterApp initialized successfully');
    } catch (error) {
        console.error('Failed to initialize PlotterApp:', error);
    }
});
