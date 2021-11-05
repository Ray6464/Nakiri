# Nakiri
Create circular JSON objects from .json files using a built-in unix style referencing scheme.

# Usage
You can import the library using vanilla javascript:
```
const nakiri = require('nakiri');

const Jack_Obj = nakiri.parse({
  name: 'Jack',
   age: 22,
 favourite_word: '${{/name}}'
});

```

# Options


Symbolic Legend
===============
1. /          = root of Object
2. ~          = first object below root relative to the current position
3. EMPTY      = binded to whatever needed in stringify and parse (root is DEFAULT)
4. .          = current object
5. ..         = parent object
6. SYMBOL*    = key of SYMBOL // for v2.0 



# LICENSE
MIT License

Copyright (c) 2021 Ray Voice

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

