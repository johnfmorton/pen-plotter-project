# Pen Plotter Playground

## Overview

The **Pen Plotter Playground** is a browser-based creative coding environment for generating artwork designed for pen plotters. Built on the **Kiro Laravel Skeleton Template**, this application leverages Laravel 12, DDEV, and modern frontend tooling to provide a robust development foundation.

Write JavaScript code using SVG.js, preview your artwork in real-time, and export production-ready SVG files optimized for physical plotting.

![[Pen Plotter Playground Screenshot]](documentation/pen-plotter-screenshot.jpg)

## Getting Started

### Prerequisites

This project is built on the **Kiro Laravel Skeleton Template**, which provides:
- Laravel 12 framework
- PHP 8.4 via DDEV
- MySQL 8.4 database
- Vite 7 for asset bundling
- Tailwind CSS 4

**Required software:**
- Docker (for DDEV)
- DDEV installed ([installation guide](https://ddev.com/get-started/))
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url> your-project-name
cd your-project-name
```

2. Run initial setup:

```bash
make setup
```

This command will:
- Install PHP dependencies via Composer
- Install Node.js dependencies via NPM
- Generate application key
- Run database migrations
- Build frontend assets

3. Start the development environment:
```bash
make dev
```

Your application will be available at `https://your-project-name.ddev.site`

## Using the Editor

### Interface Layout

The editor features a split-panel interface:

- **Left Panel**: Monaco code editor (same editor as VS Code)
- **Right Panel**: Live preview of your SVG artwork
- **Top Controls**: Viewport size presets and action buttons

### Writing Code

The editor uses SVG.js for drawing. Your code has access to a pre-configured `draw` object representing the SVG canvas.

#### Basic Example

```javascript
// Draw a simple circle
draw.circle(100).fill('none').stroke({ color: '#000', width: 2 }).center(200, 200);
```

#### Available Variables

- `draw` - The SVG.js drawing instance
- `width` - Canvas width in pixels
- `height` - Canvas height in pixels

### Viewport Sizes

Choose from preset sizes optimized for common paper formats:

- **Letter (8.5" × 11")** - Standard US letter size
- **Landscape (11" × 8.5")** - Letter rotated
- **Square (8" × 8")** - Perfect square format
- **A4 (8.27" × 11.69")** - International standard
- **A4 Landscape (11.69" × 8.27")** - A4 rotated
- **Tabloid (11" × 17")** - Larger format

All dimensions are converted to pixels at 96 DPI for accurate physical output.

### Code Execution

- Code runs automatically when you stop typing (debounced)
- Press **Run Code** button to manually execute
- Errors display with line numbers in the preview panel
- The canvas clears before each execution

### Project Management

#### Saving Projects

1. Click **Save Project** button
2. Your project downloads as a JSON file
3. Filename format: `plotter-project-YYYY-MM-DD-HHMMSS.json`

The JSON file contains:
- Your JavaScript code
- Selected viewport size
- Timestamp

#### Loading Projects

1. Click **Load Project** button
2. Select a previously saved JSON file
3. Code and viewport settings restore automatically

#### Auto-Save

Projects automatically save to browser localStorage:
- Saves every time code changes
- Persists between browser sessions
- Restores automatically on page load

### Exporting SVG

1. Create your artwork in the editor
2. Click **Download SVG** button
3. SVG file downloads ready for plotting
4. Filename format: `plotter-output-YYYY-MM-DD-HHMMSS.svg`

The exported SVG includes:
- Physical dimensions in inches
- Optimized for pen plotter output
- All paths and shapes from your code

## SVG.js Quick Reference

### Basic Shapes

```javascript
// Circle
draw.circle(diameter).center(x, y);

// Rectangle
draw.rect(width, height).move(x, y);

// Line
draw.line(x1, y1, x2, y2);

// Polyline
draw.polyline([[x1, y1], [x2, y2], [x3, y3]]);

// Path
draw.path('M 0 0 L 100 100');
```

### Styling

```javascript
// No fill, black stroke (typical for plotters)
shape.fill('none').stroke({ color: '#000', width: 2 });

// Stroke properties
shape.stroke({
  color: '#000',
  width: 2,
  linecap: 'round',
  linejoin: 'round'
});
```

### Transformations

```javascript
// Move
shape.move(x, y);

// Center
shape.center(x, y);

// Rotate
shape.rotate(degrees);

// Scale
shape.scale(factor);

// Translate
shape.translate(dx, dy);
```

### Groups

```javascript
// Create group
const group = draw.group();

// Add shapes to group
group.circle(50).center(100, 100);
group.rect(50, 50).move(75, 75);

// Transform entire group
group.rotate(45).center(200, 200);
```

## Example Projects

### Concentric Circles

```javascript
const centerX = width / 2;
const centerY = height / 2;
const maxRadius = Math.min(width, height) / 2 - 20;

for (let i = 0; i < 10; i++) {
  const radius = (maxRadius / 10) * (i + 1);
  draw.circle(radius * 2)
    .center(centerX, centerY)
    .fill('none')
    .stroke({ color: '#000', width: 1 });
}
```

### Grid Pattern

```javascript
const spacing = 50;

// Vertical lines
for (let x = 0; x <= width; x += spacing) {
  draw.line(x, 0, x, height)
    .stroke({ color: '#000', width: 1 });
}

// Horizontal lines
for (let y = 0; y <= height; y += spacing) {
  draw.line(0, y, width, y)
    .stroke({ color: '#000', width: 1 });
}
```

### Random Circles

```javascript
const numCircles = 50;

for (let i = 0; i < numCircles; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  const radius = Math.random() * 30 + 10;
  
  draw.circle(radius * 2)
    .center(x, y)
    .fill('none')
    .stroke({ color: '#000', width: 1 });
}
```

## Development Commands

### Using Make

```bash
make help    # Show available commands
make setup   # Initial project setup
make dev     # Start development environment
make build   # Build production assets
```

### Using DDEV Directly

```bash
# Start/stop environment
ddev start
ddev stop
ddev restart

# Run Laravel commands
ddev artisan migrate
ddev artisan tinker

# Run Composer commands
ddev composer install
ddev composer update

# Run NPM commands
ddev npm install
ddev npm run dev
ddev npm run build

# Access containers
ddev ssh              # Web container
ddev mysql            # Database CLI
```

## Troubleshooting

### Code Not Running

- Check browser console for JavaScript errors
- Verify SVG.js syntax is correct
- Ensure `draw` object is being used
- Try clicking **Run Code** button manually

### Preview Not Updating

- Check if code has syntax errors
- Refresh the browser page
- Clear browser cache
- Restart Vite dev server: `ddev npm run dev`

### DDEV Issues

```bash
# Restart DDEV
ddev restart

# View logs
ddev logs

# Check DDEV status
ddev describe

# Stop all DDEV projects
ddev poweroff
```

### localStorage Not Working

- Check browser privacy settings
- Ensure cookies/storage are enabled
- Try a different browser
- Clear browser data and reload

## Tips and Best Practices

### For Pen Plotters

1. **Use `fill('none')`** - Plotters draw strokes, not fills
2. **Set appropriate stroke width** - Usually 1-2 pixels
3. **Consider pen lift time** - Minimize disconnected paths
4. **Test with preview** - Verify before plotting
5. **Export at correct size** - Match your paper size

### Code Organization

1. **Use functions** - Break complex drawings into functions
2. **Add comments** - Document your creative process
3. **Use constants** - Define colors, sizes at the top
4. **Test incrementally** - Build up complexity gradually

### Performance

1. **Limit iterations** - Too many shapes can slow preview
2. **Simplify paths** - Complex paths take longer to render
3. **Use groups** - Organize related shapes together
4. **Clear unused code** - Keep editor clean

## Built on the Kiro Laravel Skeleton

This project leverages the Kiro Laravel Skeleton Template, which provides:

### Pre-configured Development Environment
- **DDEV Integration**: Complete Docker-based local development with PHP 8.4, MySQL 8.4, and nginx
- **Vite Setup**: Hot module reloading for efficient frontend development
- **Queue System**: Database-driven queues for asynchronous email sending
- **Makefile Commands**: Simple `make dev` and `make setup` commands for common tasks

### Comprehensive Steering Documents
The skeleton includes detailed guidance documents that shaped this project's architecture:
- **tech.md**: Technology stack and common commands
- **structure.md**: Project organization and naming conventions
- **laravel.md**: Laravel best practices and coding standards
- **ddev.md**: DDEV-specific workflows and commands
- **product.md**: Product overview and context

These steering documents ensure consistent code quality, proper architecture patterns, and maintainable code from day one.

### Production-Ready Foundation
- PSR-12 coding standards with Laravel Pint
- Strict typing throughout the codebase
- Service layer and repository patterns
- Comprehensive PHPDoc documentation
- Security best practices built-in

## Technology Stack

- **Framework**: Laravel 12 with PHP 8.4
- **Database**: SQLite (development) / MySQL 8.4 (production via DDEV)
- **Frontend**: Tailwind CSS 4 with Vite 7 for asset bundling
- **Authentication**: Laravel's built-in authentication system
- **Email**: Laravel Mail with queue support
- **Development**: DDEV for containerized local environment

## Resources

- [SVG.js Documentation](https://svgjs.dev/)
- [DDEV Documentation](https://ddev.readthedocs.io/)
- [Laravel Documentation](https://laravel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Kiro Laravel Skeleton Template](https://github.com/kiro-ai/laravel-skeleton)

## Support

For issues or questions:

1. Check this documentation
2. Review example projects
3. Check browser console for errors
4. Review DDEV logs: `ddev logs`
5. Open an issue on GitHub

## License

This project is open source under the MIT License.

## Acknowledgments

Built with the [Kiro Laravel Skeleton Template](https://github.com/johnfmorton/kiro-laravel-skeleton), which provides a production-ready foundation for Laravel projects with DDEV, comprehensive steering documents, and best practices built-in.
