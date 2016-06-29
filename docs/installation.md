# Installation

It is advised to install all the requirements inside [virtualenv], use [virtualenvwrapper] to manage virtualenvs 

[virtualenv]: https://virtualenv.pypa.io/en/latest/
[virtualenvwrapper]: https://virtualenvwrapper.readthedocs.org/en/latest/

```
pip install -r requirements.txt
python manage.py migrate --noinput
```

# Running the server 

Start the python server by running `python manage.py runserver` command in the root folder of the project.

Check the server running on [http://localhost:8000/](http://localhost:8000/)