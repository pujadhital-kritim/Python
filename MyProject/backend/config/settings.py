from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
'django.contrib.admin',
'django.contrib.auth',
'django.contrib.contenttypes',
'django.contrib.sessions',
'django.contrib.messages',
'django.contrib.staticfiles',

# Third party
'rest_framework',
'rest_framework_simplejwt',
'rest_framework_simplejwt.token_blacklist',
'corsheaders',

# Our apps
'users',
'store',
'cart',
'order',
'payment',
]

# Middleware
MIDDLEWARE = [
'corsheaders.middleware.CorsMiddleware',
'django.middleware.security.SecurityMiddleware',
'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware',
'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
{
'BACKEND': 'django.template.backends.django.DjangoTemplates',
'DIRS': [],
'APP_DIRS': True,
'OPTIONS': {
'context_processors': [
'django.template.context_processors.request',
'django.contrib.auth.context_processors.auth',
'django.contrib.messages.context_processors.messages',
],
},
},
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
'default': {
'ENGINE': 'django.db.backends.mysql',
'NAME': os.getenv('DB_NAME'),
'USER': os.getenv('DB_USER'),
'PASSWORD': os.getenv('DB_PASSWORD'),
'HOST': os.getenv('DB_HOST', 'localhost'),
'PORT': os.getenv('DB_PORT', '3306'),
}
}

# Auth 
AUTH_USER_MODEL = 'users.User'

# REST Framework 
REST_FRAMEWORK = {
'DEFAULT_AUTHENTICATION_CLASSES': (
'rest_framework_simplejwt.authentication.JWTAuthentication',
),
'DEFAULT_PERMISSION_CLASSES': (
'rest_framework.permissions.IsAuthenticatedOrReadOnly',
),
}

#JWT 
SIMPLE_JWT = {
'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
'ROTATE_REFRESH_TOKENS': True,
'BLACKLIST_AFTER_ROTATION': True,
'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOWED_ORIGINS = [
"http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ── Static & Media ────────────────────────────────
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Khalti Payment 
# Secret key comes from .env file
KHALTI_SECRET_KEY = os.getenv('KHALTI_SECRET_KEY')
KHALTI_VERIFY_URL = "https://a.khalti.com/api/v2/epayment/lookup/"
KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/"

# Frontend URL 
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
