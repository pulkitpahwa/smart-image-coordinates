# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

# Third Party Stuff
from django import forms

from .models import (Category,
                    TemplateFormat,
                    TemplateElement,
                    Document,
                    ExtractedElements)


class CreateCategory(forms.Form):
    """
    used for creating a category
    """

    category_name = forms.CharField(max_length=255, 
                                   min_length=4,
                                   required=True,
                                   label="Enter Category Name",
                                   widget=forms.TextInput(attrs=
                                   {'class':"form-control"}))
    description = forms.CharField(label="Description of Category",
                                  widget=forms.Textarea(attrs=
                                  {"class":"form-control"}))

