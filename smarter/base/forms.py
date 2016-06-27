# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

# Third Party Stuff
from django import forms

from .models import Category, TemplateFormat


def _get_category_choices():
    return [(category.slug, category.category_name)
            for category in Category.objects.all()]


def _get_template_choices():
    return [(template.slug, template.template_name)
            for template in TemplateFormat.objects.all()]


class CreateCategoryForm(forms.Form):
    """
    used for creating a category
    """

    category_name = forms.CharField(max_length=255,
                                    min_length=4,
                                    required=True,
                                    label="Enter Category Name",
                                    widget=forms.TextInput(
                                      attrs={'class': "form-control"}))
    description = forms.CharField(label="Description of Category",
                                  widget=forms.Textarea(
                                    attrs={"class": "form-control"}))


class TemplateFormatForm(forms.Form):
    """
    used for creating a template format
    """
    category = forms.ChoiceField(label="Category",
                                 required=True,
                                 widget=forms.Select(
                                  attrs={'class': 'form-control dropdown'}))
    template_name = forms.CharField(max_length=225,
                                    label="Template Name",
                                    min_length=3,
                                    required=True,
                                    widget=forms.TextInput(
                                      attrs={'class': 'form-control'}))

    def __init__(self, *args, **kwargs):
        super(TemplateFormatForm, self).__init__(*args, **kwargs)
        self.fields['category'].choices = _get_category_choices()


class DocumentForm(forms.Form):
    """
    Used to upload new document
    """
    category = forms.ChoiceField(label="Category",
                                 required=True,
                                 widget=forms.Select(
                                  attrs={'class': 'form-control dropdown'}))
    template = forms.ChoiceField(label="Template",
                                 required=True,
                                 widget=forms.Select(
                                  attrs={'class': 'form-control dropdown'}))
    document_name = forms.CharField(label='Name of document',
                                    required=True,
                                    max_length=255,
                                    widget=forms.TextInput(attrs={
                                        'class': 'form-control'
                                    }))
    document = forms.FileField(label="Upload File",
                               required=True)

    def __init__(self, *args, **kwargs):
        super(DocumentForm, self).__init__(*args, **kwargs)
        self.fields['category'].choices = _get_category_choices()
        self.fields['template'].choices = _get_template_choices()
