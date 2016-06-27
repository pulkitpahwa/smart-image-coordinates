"""smarter URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from smarter.base import views as base_views

urlpatterns = [
    url(r'^$', base_views.home, name='home'),
    url(r'^admin/', admin.site.urls),
    url(r'^category/add$', base_views.create_category, name='create-category'),
    url(r'^document/all$', base_views.all_documents, name='all_documents'),
    url(r'^template/add$', base_views.create_template_format,
        name='create-template'),
    url(r'^get_template/(?P<category>[-\w]+)$', base_views.get_all_formats,
        name='all_template_formats_json'),
    url(r'^upload-document$', base_views.upload_document,
        name='upload_document'),
    url(r'^document/(?P<unique_id>[-\w]+)$', base_views.particular_document,
        name='particular_document'),
    url(r'^preview/(?P<unique_id>[-\w]+)$', base_views.document_preview,
        name='preview_document'),
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT}),
    url(r'^document/(?P<unique_id>[-\w]+)/(?P<element>[-\w]+)$',
        base_views.get_element_coordinates,
        name='get_element_coordinates'),
]+static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
