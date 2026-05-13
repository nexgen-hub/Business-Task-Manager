import os
import sys
from django.core.management import execute_from_command_line

def run_migrations():
    """Run migrations automatically on startup"""
    print("=" * 50)
    print("Running database migrations...")
    print("=" * 50)
    
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskmanager.settings')
    
    # Run migrations
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])
    
    print("=" * 50)
    print("Migrations completed.")
    print("=" * 50)