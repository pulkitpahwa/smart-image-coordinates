from django.shortcuts import render_to_response, get_object_or_404
from django.http import JsonResponse, HttpResponseRedirect
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg
from django.db import IntegrityError

from .models import (Category,
                     TemplateFormat,
                     TemplateElement,
                     Document,
                     ExtractedElements)

from .forms import CreateCategoryForm, TemplateFormatForm, DocumentForm
from .serializers import get_templates_for_category

import json


def home(request):
    """
    View for home page. 
    """
    return render_to_response("home.html", {},
                              context_instance=RequestContext(request))


def get_all_formats(request, category):
    """
    View to get all template formats that exist for the particular category
    """
    try:
        category = Category.objects.get(slug=category)
    except Category.DoesNotExist:
        message = "Invalid category selected"
        return JsonResponse({"error": "true", "message": message})
    all_templates = get_templates_for_category(category)
    return JsonResponse({"error": "false", "data": all_templates})


def create_category(request):
    """
    View to create category
    """
    if request.method == "GET":
        form = CreateCategoryForm()
        return render_to_response("create_category.html", {"form": form},
                                  context_instance=RequestContext(request))
    elif request.method == "POST":
        form = CreateCategoryForm(data=request.POST)
        if not form.is_valid():
            return render_to_response("create_category.html",
                                      {"form": form, "errors": form.errors},
                                      context_instance=RequestContext(request))
        try:
            category = Category.objects.create(
                        category_name=form.cleaned_data['category_name'],
                        description=form.cleaned_data['description'])
        except IntegrityError:
            message = "Category with the same name already exist"
            return render_to_response("create_category.html",
                                      {"form": form, "errors": message},
                                      context_instance=RequestContext(request))
        redirect_url = reverse('create-template')
        redirect_url += "?categ=%s" %(category.slug) 
        return HttpResponseRedirect(redirect_url)


def create_template_format(request):
    """
    View to create new template format.
    """
    if request.method == "GET":
        form = TemplateFormatForm()
        return render_to_response("create_format.html",
                                  {"form": form},
                                  context_instance=RequestContext(request))
    elif request.method == "POST":
        form = TemplateFormatForm(data=request.POST)
        if not form.is_valid():
            return render_to_response("create_format.html",
                                      {"form": form, "errors": form.errors},
                                      context_instance=RequestContext(request))

        category = get_object_or_404(Category,
                                     slug=form.cleaned_data['category'])
        try:
            template = TemplateFormat.objects.create(
                   category=category,
                   template_name=form.cleaned_data['template_name']
                   )
        except IntegrityError:
            message = "Template Name Already exist"
            return render_to_response("create_format.html",
                                      {"form": form, "errors": message},
                                      context_instance=RequestContext(request))
        redirect_url = reverse('upload_document')
        redirect_url += "?categ=%s&format=%s" %(category.slug, 
                                                 template.slug)
        return HttpResponseRedirect(redirect_url)


def upload_document(request):
    """
    View for handling document upload
    """
    if request.method == "GET":
        form = DocumentForm()
        return render_to_response("upload_document.html",
                                  {"form": form},
                                  context_instance=RequestContext(request))
    elif request.method == "POST":
        form = DocumentForm(request.POST, request.FILES)
        if not form.is_valid():
            return render_to_response("upload_document.html",
                                      {"form": form, "errors": form.errors},
                                      context_instance=RequestContext(request))

        template = get_object_or_404(TemplateFormat,
                                     slug=form.cleaned_data['template'])
        document = Document.objects.create(
                template_format=template,
                document_name=form.cleaned_data['document_name'],
                document=request.FILES['document']
        )
        return HttpResponseRedirect(
                reverse('particular_document',
                        kwargs={"unique_id": document.id}
                        ))


@csrf_exempt
def particular_document(request, unique_id):
    """
    View to display a particular document and let the end user to select
    elements from it on the frontend and save them
    """
    document = get_object_or_404(Document, id=unique_id)
    all_elements = document.template_format.templateelement_set.all()
    if request.method == "GET":
        if document.extractedelements_set.all().count() > 0 :
          return HttpResponseRedirect(reverse('preview_document',
                                      kwargs={"unique_id":document.id}))
        return render_to_response('document_selector.html',
                                  {"document": document,
                                   "elements": all_elements},
                                  context_instance=RequestContext(request))

    elif request.method == "POST":

        data = json.loads(json.loads(request.POST['data']))
        if document.image_resolution_x and document.image_resolution_y:
            pass
        else:
            document.image_resolution_x = data["image_width"]
            document.image_resolution_x = data["image_height"]
            document.save()
        template = document.template_format
        document.extractedelements_set.all().delete()
        for element_name in data["elements"]:
            element = TemplateElement.objects.get_or_create(
                    template=template, element_name=element_name)[0]

            extracted_element = ExtractedElements.objects.get_or_create(
                    document=document, element=element)[0]
            extracted_element.x1_coordinate = data[element_name]["x"]
            extracted_element.y1_coordinate = data[element_name]["y"]
            extracted_element.block_width = data[element_name]["width"]
            extracted_element.block_height = data[element_name]["height"]
            extracted_element.save()
        return JsonResponse({"error": "false",
                            "message": "Successfully saved elements"})


def all_documents(request):
    """
    View to display all documents
    """
    documents = Document.objects.all()
    if request.method == "GET":
        return render_to_response("all_documents.html",
                                  {"documents": documents},
                                  context_instance=RequestContext(request))


def document_preview(request, unique_id):
    """
    View to preview/ update a document. Any document for which the elements
    have been created is eligible for preview/ update
    """
    document = get_object_or_404(Document, id=unique_id)
    elements = document.template_format.templateelement_set.all()
    return render_to_response("document_elements.html",
                              {"document": document, "elements": elements},
                              context_instance=RequestContext(request))


def get_element_coordinates(request, unique_id, element):
    """
    Get approx coordinates of a particular element for a given template format
    Average of all values of the particular element for various documents is
    considered.  
    """
    try:
        document = Document.objects.get(id=unique_id)
    except Document.DoesNotExist:
        return JsonResponse({
            "error": "true",
            "message": "Document Does not exist"
            })
    template = document.template_format
    try:
        element = TemplateElement.objects.get(template=template,
                                              element_name__iexact=element)
    except TemplateElement.DoesNotExist:
        return JsonResponse({"error": "true",
                            "message": "Element Does not exist"})

    avg_x = ExtractedElements.objects.filter(
                    element=element).aggregate(Avg('x1_coordinate'))
    avg_y = ExtractedElements.objects.filter(
                    element=element).aggregate(Avg('y1_coordinate'))
    avg_height = ExtractedElements.objects.filter(
                    element=element).aggregate(Avg('block_height'))
    avg_width = ExtractedElements.objects.filter(
                    element=element).aggregate(Avg('block_width'))

    return JsonResponse({"error": "false", "x": avg_x, "y": avg_y,
                        "height": avg_height, "width": avg_width})
