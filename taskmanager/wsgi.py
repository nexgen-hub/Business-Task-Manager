"""
WSGI config for taskmanager project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""
# Run migrations automatically on startup (for Render free tier)
try:
    from startup import run_migrations
    run_migrations()
except Exception as e:
    print(f"Migration warning: {e}")
    
import os

from django.core.wsgi import get_wsgi_application



os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskmanager.settings')

application = get_wsgi_application()
