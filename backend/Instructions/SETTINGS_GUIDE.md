# PayFlow Backend - Django Settings Configuration Guide

This document explains exactly what needs to be in your Django settings.py file.

## Quick Start Configuration

All required settings are already implemented in `payflow_backend/settings.py`. Below is what was added:

### 1. AUTH_USER_MODEL (Required for custom User)
```python
AUTH_USER_MODEL = 'users.User'
```
**Purpose:** Tells Django to use our custom User model instead of the default one.

### 2. INSTALLED_APPS (Add these apps)
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',           # ← Required
    'corsheaders',              # ← Required for frontend
    'users.apps.UsersConfig',   # ← Our app
    'wallets.apps.WalletsConfig',  # ← Our app
    'transactions.apps.TransactionsConfig',  # ← Our app
    'utils.apps.UtilsConfig',   # ← Our app
]
```

### 3. MIDDLEWARE (Add corsheaders)
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ← Add this
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### 4. ROOT_URLCONF (Point to main urls.py)
```python
ROOT_URLCONF = 'payflow_backend.urls'
```

### 5. REST_FRAMEWORK Configuration
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',  # For browsable API
        'rest_framework.authentication.TokenAuthentication',    # For mobile/frontend
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Everything requires auth
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  # Results per page
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',      # Unauthenticated users
        'user': '1000/hour'      # Authenticated users
    }
}
```

### 6. CORS Configuration (For frontend)
```python
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS_ALLOW_CREDENTIALS = True
```
**Purpose:** Allow requests from React frontend (port 3000 by default).

## Database Configuration

### SQLite (Development - Default)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```
✅ Simple, no setup needed. Perfect for development.

### PostgreSQL (Production - Recommended)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'payflow'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```
✅ Production-ready, better performance, handles concurrency.

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Django Settings
SECRET_KEY=your-very-long-random-secret-key-change-this
DEBUG=True  # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Database (only if using PostgreSQL)
DB_NAME=payflow
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

Install python-decouple to read .env:
```bash
pip install python-decouple
```

Then use in settings.py:
```python
from decouple import config

SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-key')
DEBUG = config('DEBUG', default=True, cast=bool)
```

## Static Files Configuration

```python
STATIC_URL = '/static/'                # URL for static files
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Where collectstatic puts files
```

For production:
```bash
python manage.py collectstatic --no-input
```

## Logging Configuration

The settings include comprehensive logging:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {...},
    'handlers': {...},
    'loggers': {...},
}
```

Logs go to:
- Console (development)
- logs/django.log (warnings and above)

## Complete Settings Checklist

- [x] AUTH_USER_MODEL = 'users.User'
- [x] INSTALLED_APPS includes rest_framework, corsheaders, and 4 apps
- [x] MIDDLEWARE includes corsheaders
- [x] REST_FRAMEWORK configured with authentication & permissions
- [x] CORS_ALLOWED_ORIGINS set
- [x] Database configured (SQLite for dev, PostgreSQL ready for prod)
- [x] STATIC_URL and STATIC_ROOT configured
- [x] LOGGING configured

## Initial Setup Steps

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

4. Run server:
   ```bash
   python manage.py runserver
   ```

5. Access admin: http://localhost:8000/admin/

## Key Points

- ✅ All settings already implemented in `payflow_backend/settings.py`
- ✅ Custom User model properly configured
- ✅ DRF with authentication & permissions
- ✅ CORS enabled for frontend
- ✅ Atomic transactions for financial operations
- ✅ Environment-based configuration ready

## API Root
Once running, access the API at:
- http://localhost:8000/api/ (main endpoint)
- http://localhost:8000/api/users/me/ (current user)
- http://localhost:8000/api/wallets/my_wallet/ (wallet info)
- http://localhost:8000/api/transactions/ (transactions)
