<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SVG Plotter Editor</title>
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/plotter-editor.js'])
</head>
<body class="bg-gradient-to-br from-gray-50 to-gray-100 antialiased">
    <div id="plotter-app" class="h-screen flex flex-col">
        <!-- Header -->
        <header class="bg-white shadow-md border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800">SVG Plotter Editor</h1>
                </div>
                <div id="viewport-info" class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">Viewport:</span>
                    <span id="viewport-display" class="text-sm font-semibold text-blue-600">8.5" × 11"</span>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Preview Panel (Left) -->
            <div class="w-1/2 bg-white border-r border-gray-200 p-6 flex flex-col min-w-0 shadow-inner">
                <div class="flex items-center gap-2 mb-4">
                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <h2 class="text-lg font-semibold text-gray-700">Preview</h2>
                </div>
                <div id="preview-panel" class="flex-1 border-2 border-gray-300 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200">
                    <!-- SVG will be rendered here -->
                </div>
                <div id="error-display" class="mt-4 hidden">
                    <!-- Error messages will appear here -->
                </div>
            </div>

            <!-- Code Panel (Right) -->
            <div class="w-1/2 bg-white p-6 flex flex-col min-w-0">
                <div class="flex items-center justify-between mb-4 gap-4">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                        </svg>
                        <h2 class="text-lg font-semibold text-gray-700">Code Editor</h2>
                    </div>
                    <div id="control-panel" class="flex gap-2 flex-wrap justify-end">
                        <!-- Control buttons will be added here -->
                    </div>
                </div>
                <div id="code-editor" class="flex-1 border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <!-- Monaco Editor will be mounted here -->
                </div>
            </div>
        </div>
    </div>

    <!-- New Project Dialog (Hidden by default) -->
    <div id="new-project-dialog" class="hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">Create New Project</h3>
            </div>
            
            <div class="mb-5">
                <label for="project-name" class="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                <input 
                    type="text" 
                    id="project-name" 
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400" 
                    placeholder="My Plotter Art"
                >
            </div>
            
            <div class="mb-8">
                <label class="block text-sm font-semibold text-gray-700 mb-3">Viewport Size</label>
                <div class="space-y-3">
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group">
                        <input type="radio" name="viewport" value="8.5x11" checked class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700 group-hover:text-blue-700 font-medium">8.5" × 11" <span class="text-gray-500 text-sm">(Letter Portrait)</span></span>
                    </label>
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group">
                        <input type="radio" name="viewport" value="11x8.5" class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700 group-hover:text-blue-700 font-medium">11" × 8.5" <span class="text-gray-500 text-sm">(Letter Landscape)</span></span>
                    </label>
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group">
                        <input type="radio" name="viewport" value="6x6" class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700 group-hover:text-blue-700 font-medium">6" × 6" <span class="text-gray-500 text-sm">(Square)</span></span>
                    </label>
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group">
                        <input type="radio" name="viewport" value="4x5" class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500">
                        <span class="ml-3 text-gray-700 group-hover:text-blue-700 font-medium">4" × 5" <span class="text-gray-500 text-sm">(Small Portrait)</span></span>
                    </label>
                </div>
            </div>
            
            <div class="flex gap-3 justify-end">
                <button 
                    id="cancel-new-project" 
                    class="px-6 py-3 text-gray-700 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow"
                >
                    Cancel
                </button>
                <button 
                    id="confirm-new-project" 
                    class="px-6 py-3 text-white font-medium bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    Create Project
                </button>
            </div>
        </div>
    </div>
</body>
</html>
