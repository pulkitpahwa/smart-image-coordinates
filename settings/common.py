# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

# Standard Library
import os
from os.path import dirname, join

# Third Party Stuff
from django.conf.global_settings import *  # noqa

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
ROOT_DIR = dirname(dirname(__file__))
BASE_DIR = join(ROOT_DIR, 'smarter')

ADMINS = (
    ('Pulkit Pahwa', 'pulkitpahwa11@gmail.com'),
)


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '^217q7^r9_b$z7pp@*edj_%qcwh02emph+z@@vzd*vx%nmhi-1'

DEBUG = True

ALLOWED_HOSTS = []


# Application definition

CORE_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'autoslug',
]

OUR_APPS = [
    'smarter.base',
]

INSTALLED_APPS = CORE_APPS + OUR_APPS

MIDDLEWARE_CLASSES = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'smarter.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = join(ROOT_DIR, 'staticfiles')
STATICFILES_DIRS = (
    join(ROOT_DIR, 'static'),
)

MEDIA_ROOT = join(ROOT_DIR, 'media')
