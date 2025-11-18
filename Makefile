.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: setup
setup: ## Install dependencies, generate app key, run migrations, and build assets
	ddev composer run setup

.PHONY: dev
dev: ## Launch DDEV, run migrations, and start Vite dev server
	ddev launch
	ddev php artisan migrate
	ddev exec npm run dev

.PHONY: build
build: ## Build production assets with Vite
	ddev exec npm run build

.DEFAULT_GOAL := help