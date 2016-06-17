Image Co-ordinates Extraction 
=============================

Image Co-ordinates Extraction is a django app that let the users select the areas from different pdfs/images and then
extract the text from the selected areas.

It is used by : 
 - [Juxt Smart-Mandate](http://juxt-smartmandate.com/)

# Getting Started

It is advised to install all the requirements inside [virtualenv], use [virtualenvwrapper] to manage virtualenvs 

[virtualenv]: https://virtualenv.pypa.io/en/latest/
[virtualenvwrapper]: https://virtualenvwrapper.readthedocs.org/en/latest/

```
pip install -r requirements-dev.txt
python manage.py migrate --noinput
```


