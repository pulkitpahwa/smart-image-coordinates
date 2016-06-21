from __future__ import absolute_import, unicode_literals

import uuid

from django.db import models
from autoslug import AutoSlugField


class Category(models.Model):
    """
    List of categories a.k.a. Projects.
    """
    category_name = models.CharField(max_length=255,
            verbose_name="Name of the Category", unique=True)
    description = models.TextField(default="", blank=True)
    slug = AutoSlugField(populate_from="category_name", unique=True)

    def __str__(self):
        return self.category_name


class TemplateFormat(models.Model):
    """
    List of template formats. e.g. Bill for CCD, Barista, etc.
    """
    category = models.ForeignKey(Category,
            verbose_name="Category of the Format")
    template_name = models.CharField(max_length=225,
            verbose_name="Name of template format", unique=True)
    slug = AutoSlugField(populate_from="template_name", unique=True)

    def __str__(self):
        return self.template_name


class TemplateElement(models.Model):
    """
    List of elements for a given template type
    """
    template = models.ForeignKey(TemplateFormat,
            verbose_name="Base Format of the element")
    element_name = models.CharField(max_length=255,
            verbose_name="Name of the Element")

    def __str__(self):
        return self.element_name

    def get_element_name(self):
        """Returns the name of the element"""
        return self.element_name

    def get_template_name(self):
        """Returns the name of the template for which this element exist"""
        return self.template.template_name

    class Meta:
        unique_together = ('template', 'element_name')


class Document(models.Model):
    """
    Document whose elements are to be extracted
    """
    id  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template_format = models.ForeignKey(TemplateFormat)
    document_name = models.CharField(max_length=255,
            verbose_name='name of document')
    document = models.FileField(upload_to="documents")
    element = models.ManyToManyField(TemplateElement,
            through='ExtractedElements')
    slug = AutoSlugField(populate_from="document_name", unique=True)
    image_resolution_x  = models.IntegerField(blank = True, null = True)
    image_resolution_y = models.IntegerField(blank = True, null = True)

    def __str__(self):
        return self.document_name

    def get_template_format(self):
        """Get the format of the template that this document has"""
        return self.template_format.template_name

    def get_all_elements_name(self):
        """Get name of all elements for the given document"""
        return self.element_set.all().values("element_name", flat=True)

    def count_number_of_elements(self):
        """
        Count number of template elements that are selected for this document
        """
        return self.element_set.all().count()


class ExtractedElements(models.Model):
    """
    List of all extracted elements along with their co-ordinates
    in ratio of their position to the image resolution
    """
    document = models.ForeignKey(Document)
    element = models.ForeignKey(TemplateElement)
    x1_coordinate = models.FloatField()
    y1_coordinate = models.FloatField()
    x2_coordinate = models.FloatField(blank = True, null = True)
    y2_coordinate = models.FloatField(blank = True, null = True)
    block_height = models.FloatField(blank = True, null = True)
    block_width = models.FloatField(blank = True, null = True)

    def __str__(self):
        return "Element %s of document  %s" % (self.element.element_name,
                self.document.document_name)
