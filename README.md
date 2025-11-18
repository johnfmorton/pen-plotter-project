# Kiro + Laravel Skeleton Template

Welcome to the Kiro + Laravel Skeleton Template.

## Introduction

This repository is a fully-formed Laravel starter built from the experience of creating a real-world application with Kiro. Kiro provides a strong foundation for beginning any project, but  the steering documents and build-system structure included in this template provide a production-ready workspace to get your project started on the right foot. You don't have to fuss with the toolkit. You just start building.

You start your project with a complete development environment powered by DDEV, a working Vite setup with hot-module reloading, and a set of guiding documents that help shape conventions, workflows, and team collaboration from day one. Using this template saves at least an hour of initial setup time compared to assembling all of these pieces manually. It provides a consistent, fast, and opinionated starting point so you can focus on building features instead of wiring the project together.

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
