# SVG Pen Plotter Editor

A browser-based code editor for creating generative art designed for pen plotters. Write JavaScript code using SVG.js, see your artwork rendered in real-time, and export production-ready SVG files optimized for physical plotting.

## About This Project

The SVG Pen Plotter Editor is a complete web application that demonstrates the power and versatility of the [Kiro Laravel Skeleton Template](https://github.com/johnfmorton/kiro-laravel-skeleton). Built entirely using Kiro AI assistance, this project showcases how quickly you can go from concept to working application when you start with a solid foundation.

This application provides a creative coding environment where artists and developers can:

- Write JavaScript code using the powerful SVG.js library
- Preview artwork in real-time with automatic regeneration
- Work with physical dimensions (inches) for accurate plotter output
- Choose from preset viewport sizes (Letter, Landscape, Square, etc.)
- Save and load projects as JSON files
- Export production-ready SVG files for pen plotters
- Enjoy automatic state persistence with localStorage
- Get helpful error messages with line numbers when code fails

The editor features a split-panel interface with Monaco Editor (the same editor that powers VS Code) for code editing, and a live preview panel that updates as you work. Projects automatically save to localStorage, so you never lose your work between sessions.

## Built with Kiro

This project was developed using the Kiro Laravel Skeleton Template, which provided:

- A complete Laravel 12 setup with DDEV for local development
- Pre-configured Vite integration with hot module reloading
- Comprehensive steering documents that guided architectural decisions
- Best practices for Laravel development baked in from day one
- A Makefile for simple, no-fuss development workflows

The skeleton template eliminated hours of initial setup and configuration, allowing development to focus immediately on building features. The included steering documents helped maintain consistent code quality, naming conventions, and architectural patterns throughout the project. This is a real-world demonstration of how the Kiro Laravel Skeleton accelerates development while maintaining professional standards.

## Features

* Laravel Ready: Comes pre-configured with a complete Laravel setup tailored for local development using DDEV.
* Vite Integration: Includes a Vite build process with hot module reloading, making front-end development smooth and efficient.
* Kiro Specs: Comes with highly tuned Kiro spec documents to ensure your code is human-readable and well-structured from the start.
* Makefile Included: Start your project simply by running make dev for an easy, no-fuss development experience.

## DDEV Requirements

Since the project uses DDEV for local enviroment of your Laravel project, you'll need to reference the [DDEV getting started section](https://ddev.com/get-started/) of the documenation. You'll find instructions for Mac, Windows and Linux. Basically, you'll need to be able to install Docker images, and, depending on your platform, a way for local URLs to resolve.

## Quick Start

1. **Clone the repo**: `git clone <https://github.com/johnfmorton/kiro-laravel-skeleton.git> your-project-name`
2. **Navigate to the directory**: `cd your-project-name`
3. **Run initial setup**: `make setup` (installs dependencies, generates app key, runs migrations, builds assets)
4. **Start development**: `make dev` (launches browser, runs migrations, starts Vite dev server)

That's it! Your Laravel app will be running at the URL shown by DDEV (typically `https://your-project-name.ddev.site`).

## Daily Development

After initial setup, just run:

```bash
make dev      # Launch your development environment
```

## Contribution and License

This project is open source under the MIT License. We welcome contributions and suggestions!
