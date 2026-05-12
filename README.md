# TaskManager Deployment with Docker

This project includes Docker setup for:
- Django API (Gunicorn)
- Angular frontend (Nginx)
- PostgreSQL database with persistent storage

## Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose v2

## Quick Start
1. From the project root, run:
   docker compose up --build

2. Open:
   - Angular app: http://localhost
   - Django API: http://localhost:8000

3. (Optional) Seed sample data after services are up:
   docker compose exec django python manage.py seed_data

## Environment Variables
Set these in your shell before running compose, or create a local `.env` file in the project root.

### Django
- DJANGO_SECRET_KEY: Secret key for Django
- DJANGO_DEBUG: True or False
- DJANGO_ALLOWED_HOSTS: Comma-separated hosts (example: localhost,127.0.0.1,django)
- CORS_ALLOWED_ORIGINS: Comma-separated origins (example: http://localhost,http://localhost:4200)

### Database
- POSTGRES_DB: Database name
- POSTGRES_USER: Database user
- POSTGRES_PASSWORD: Database password

These are mapped by docker-compose to Django as:
- DB_ENGINE=postgres
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_HOST=postgres
- DB_PORT=5432

## Default Login Credentials After Seeding
After running:
- docker compose exec django python manage.py seed_data

Use one of these users:
- username: john, password: password123
- username: jane, password: password123
- username: admin, password: password123

## Notes
- PostgreSQL data persists in the named volume: postgres_data
- Django static files are collected into the named volume: static_volume
- The Django container runs migrations and collectstatic on startup before launching Gunicorn
