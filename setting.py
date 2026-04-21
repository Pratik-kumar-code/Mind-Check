INSTALLED_APPS = [
    'rest_framework',
    'accounts',
    'mental_health',
    'therapists',
]

AUTH_USER_MODEL = 'accounts.User'

# PostgreSQL config
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mental_db',
        'USER': 'postgres',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
