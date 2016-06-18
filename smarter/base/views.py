from django.shortcuts import render_to_response
from django.http import JsonResponse, HttpResponse
from django.template import RequestContext 

from .models import (Category,
                    TemplateFormat,
                    TemplateElement,
                    Document,
                    ExtractedElements)

from .forms import CreateCategory


def create_category(request):
    if request.method == "GET":
        form = CreateCategory()
        return render_to_response("create-category.html",{"form":form},
                                  context_instance = RequestContext(request))
    else : 
        form = CreateCategory(data=request.POST)
        if not form.is_valid():
            return render_to_response("create_category.html",
                                     {"form":form, "errors":form.errors},
                                     context_instance=RequestContext(request))
        Category.objects.create(
                category_name=form.cleaned_data['category_name'],
                description=form.cleaned_data['description'])

        return HttpResponse('category created')
        



