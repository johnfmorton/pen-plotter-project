<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SVG Plotter Editor</title>
    @vite(['resources/css/app.css', 'resources/js/app.js', 'resources/js/plotter-editor.js'])
</head>
<body class="bg-gray-100">
    <div id="plotter-app" class="h-screen flex flex-col">
        <!-- Header -->
        <header class="bg-white shadow-sm px-6 py-4">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-gray-800">SVG Plotter Editor</h1>
                <div id="viewport-info" class="text-sm text-gray-600">
                    Viewport: <span id="viewport-display">8.5" × 11"</span>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Preview Panel (Left) -->
            <div class="w-1/2 bg-white border-r border-gray-200 p-6 flex flex-col min-w-0">
                <h2 class="text-lg font-semibold text-gray-700 mb-4">Preview</h2>
                <div id="preview-panel" class="flex-1 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <!-- SVG will be rendered here -->
                </div>
                <div id="error-display" class="mt-4 hidden">
                    <!-- Error messages will appear here -->
                </div>
            </div>

            <!-- Code Panel (Right) -->
            <div class="w-1/2 bg-white p-6 flex flex-col min-w-0">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-semibold text-gray-700">Code Editor</h2>
                    <div id="control-panel" class="flex gap-2 flex-wrap">
                        <!-- Control buttons will be added here -->
                    </div>
                </div>
                <div id="code-editor" class="flex-1 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <!-- Monaco Editor will be mounted here -->
                </div>
            </div>
        </div>
    </div>

    <!-- New Project Dialog (Hidden by default) -->
    <div id="new-project-dialog" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Create New Project</h3>
            <div class="mb-4">
                <label for="project-name" class="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input type="text" id="project-name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="My Plotter Art">
            </div>
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Viewport Size</label>
                <div class="space-y-2">
                    <label class="flex items-center">
                        <input type="radio" name="viewport" value="8.5x11" checked class="mr-2">
                        <span>8.5" × 11" (Letter Portrait)</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="viewport" value="11x8.5" class="mr-2">
                        <span>11" × 8.5" (Letter Landscape)</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="viewport" value="6x6" class="mr-2">
                        <span>6" × 6" (Square)</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="viewport" value="4x5" class="mr-2">
                        <span>4" × 5" (Small Portrait)</span>
                    </label>
                </div>
            </div>
            <div class="flex gap-3 justify-end">
                <button id="cancel-new-project" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button id="confirm-new-project" class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Create</button>
            </div>
        </div>
    </div>
</body>
</html>
