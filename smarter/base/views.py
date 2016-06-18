from django.shortcuts import render_to_response, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.template import RequestContext

from .models import (Category,
                    TemplateFormat,
                    TemplateElement,
                    Document,
                    ExtractedElements)

from .forms import CreateCategoryForm, TemplateFormatForm, DocumentForm
from .serializers import get_templates_for_category


def home(request):
    return render_to_response("home.html", {},
                             context_instance=RequestContext(request))


def get_all_template_formats(request, category):
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
            return render_to_response("create_category.mhtml",
                                     {"form": form, "errors": form.errors},
                                     context_instance=RequestContext(request))
        category = Category.objects.create(
                        category_name=form.cleaned_data['category_name'],
                        description=form.cleaned_data['description'])
        return HttpResponse('category created')


def create_template_format(request):
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
                                 category_name=form.cleaned_data['category'])
        template = TemplateFormat.objects.create(
                category=category,
                template_name=form.cleaned_data['template_name']
                )
        return HttpResponse(template.slug)


def upload_document(request):
    if request.method == "GET":
        form = DocumentForm()
        return render_to_response("upload_document.html",
                                  {"form": form},
                                  context_instance=RequestContext(request))
    elif request.method == "POST":
        form = DocumentForm(request.POST, request.FILES)
        if not form.is_valid():
            print request.FILES['document']
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
        return HttpResponse("document uploaded")
