# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

# Standart Library
import sys

if "test" in sys.argv:
    print "Testing"
    sys.exit(0)

from .common import * # noqa 

try:
    from .dev import * # noqa
except ImportError:
    pass

try:
    from .prod import * # noqa
except ImportError:
    pass
