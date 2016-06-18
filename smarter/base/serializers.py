from django.core import serializers

from .models import TemplateFormat


def get_templates_for_category(category):
    data = serializers.serialize('json',
                        TemplateFormat.objects.filter(category = category),
                        fields=('template_name','slug')
                        )
    return data

