---
inclusion: always
---

# Technology Stack

## Core Framework
- Laravel 12 (PHP 8.2+)
- PHP 8.4 (via DDEV)

## Frontend
- Vite 7 for asset bundling
- Tailwind CSS 4
- Axios for HTTP requests

## Database
- SQLite (default)
- MySQL 8.4 available via DDEV
- Eloquent ORM for database interactions

## Development Environment
- DDEV for local development (nginx-fpm, MySQL 8.4)
- Composer 2 for PHP dependency management
- Node.js for frontend tooling

## Testing
- PHPUnit 11.5+ for unit and feature tests
- Laravel Pint for code style enforcement

## Key Dependencies
- Laravel Tinker for REPL
- Laravel Pail for log viewing
- Faker for test data generation
- Mockery for mocking in tests

## Common Commands

### Setup
```bash
composer run setup
```
Installs dependencies, generates app key, runs migrations, and builds assets.

### Development
```bash
composer run dev
```
Starts Laravel server, queue worker, log viewer, and Vite dev server concurrently.

Or run services individually:
```bash
php artisan serve          # Start development server
npm run dev                # Start Vite dev server
php artisan queue:listen   # Start queue worker
php artisan pail           # View logs
```

### Testing
```bash
composer run test
# or
php artisan test
```

### Code Style
```bash
./vendor/bin/pint
```

### Database
```bash
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Drop all tables and re-run migrations
php artisan db:seed              # Run database seeders
php artisan migrate:fresh --seed # Fresh migration with seeding
```

### DDEV Commands
```bash
ddev start          # Start DDEV environment
ddev stop           # Stop DDEV environment
ddev restart        # Restart DDEV environment
ddev ssh            # SSH into web container
ddev composer       # Run Composer commands
ddev artisan        # Run Artisan commands
ddev snapshot       # Create database snapshot
```

### Cache Management
```bash
php artisan config:cache   # Cache configuration
php artisan config:clear   # Clear configuration cache
php artisan route:cache    # Cache routes
php artisan route:clear    # Clear route cache
php artisan view:cache     # Cache views
php artisan view:clear     # Clear view cache
php artisan cache:clear    # Clear application cache
```
