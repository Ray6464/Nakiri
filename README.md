# Nakiri
Create circular JSON objects from .json files using a built-in unix style referencing scheme.

# Usage
You can import and use the library using vanilla javascript:

```
const nakiri = require('nakiri');

const data = nakiri.parse({
  name: 'Nakiri',
  fav_word: '${{/name}}'
});

console.log(data);
// logs: { name: 'Nakiri', fav_word: 'Nakiri' }

```

You can also determine a symless path for a cleaner outlook, just pass the path string as a second argument to `nakiri.parse()`:

```
const nakiri = require('nakiri');

const data = nakiri.parse({
  name: 'Nakiri',
  info: { age: '1 month' },
  last_commit: '${{age}}'
}, '~/info/');

console.log(data);
// logs: { name: 'Nakiri', info: { age: '1 month' }, last_commit: '1 month' }

```

You can also determine a custom path seprator like `.` by passing it as the third argument (beta):

```
const nakiri = require('nakiri');

const data = nakiri.parse({
  name: 'Nakiri',
  info: { age: '1 month' },
  last_commit: '${{age}}'
}, '~.info.', '.');

console.log(data);
// logs: { name: 'Nakiri', info: { age: '1 month' }, last_commit: '1 month' }

```

You can use a simpler ``mapEntries()``` method to map an object's keys and values. E.g.  

```
const data4 = {
  name: 'David',
  age: 22,
  employement: {
    title: 'Sr Manager',
    pay: '60k'
  }
}

console.log(nakiri.mapEntries(data4, entry => [entry[0]+1, entry[1]+2]));

console.log(nakiri.mapEntries(data4, entry => [entry[0]+1, (typeof(entry[1]) === 'object' && !Array.isArray(entry[1]) && entry[1] !== null ? nakiri.mapEntries(entry[1], _entry => [_entry[0]+1, _entry[1]+2]):entry[1]+2)]));

```

This method is simpler if you don't want a lot of control over your iterations. Also, the recursive example is very verbose (even after refactoring).


Symbolic Legend
===============

1. /          = root of Object
2. ~          = first object below root relative to the current position
3. EMPTY      = binded to whatever needed in stringify and parse (root is DEFAULT)
4. .          = current object // beta
5. ..         = parent object // beta
6. SYMBOL*    = key of SYMBOL // comming soon in v2.0 

### Path examples

Following are a few path examples
```
/person/name
~/name
```

### Features

1. *nakiri.parse(_OBJ, _SYMLESS, _SEPRATOR)* is used to parse a circular object.
2. *nakiri.stringify()* is used to stringify a circular object. (comming soon)
3. *nakiri.mapObjectRecursively(_DEPTH, _OBJ, _keyModFunction, _valueModFunction, _metaData)* is used to recurcively map an object.

> If not sure use ```0``` as **_DEPTH**.  
> **_OBJ** is the object you want to map.  
> If not sure use ```(_key, _metadata) => _key``` as **_keyModFunction**. The **_metadata** argument is an object with information about the object passed, including the passed object itself. E.g. ```_metadata.PARENT``` will return the object presently iterating.  
> If not sure use ```(_val, _metadata) => _val``` as **_valueModFunction**. The **_metadata** argument is an object with information about the object passed, including the passed object itself. E.g. ```_metadata.KEY``` the key of the value. ```_metadata.PIGGYBACK``` can access properties of the *_metaData* argument if the argument goes like ```{ PIGGYBACK: { /* stuff here */ } }```.  
> If not sure use ```{}``` as **_metadata**. Use this argument to provide extra data to a pirticular node.  

4. *nakiri.mapEntries(_obj, _mapFunction)* is used to map entries of an object. The *_mapFunction* argument must be a valid javascript function that returns a 2-D array, in which each member is a valid entry, e.g. ```entry => ['key', 'value']```.  

5. *nakiri.mapKeys(_obj, _mapFunction)* is used to map keys of an object. The *_mapFunction* argument must be a valid javascript function that takes in a valid *JSON key* and return a valid *JSON key*. e.g. ```key => key+5``` will append the character '5' to all key names.  

6. *nakiri.mapObjectRecursivelyV2Beta(_obj, _mapFunction, _cutoff_depth)* is  used to map an object recursively to a certain depth. e.g. The *_mapFunction* argument must be a valid javascript function that returns a 2-D array, in which each member is a valid entry, e.g. ```entry => ['key', 'value']```. The *_cutoff_depth* must be a valid *number* greater than 0; it tells the method to stop the recursive algorithm if it reaches a certain object depth. Array are not considered as going deeper.  

7. *nakiri.isObject(_obj)* is used to check if the provided *_obj* argument is a JS Object, but is not an *Array* or *null*. It returns a *boolean* value.

8. *nakiri.noRefBorder(_arr, _prefix, _suffix)* is used to remove the ```${{ varName }}``` dollar sign and brackets from each member in a string. e.g. ```nakiri.noRefBorder(['${{name}}', '${{age}}']) // returns ['name', 'age']```. The **_prefix** and **_suffix** are optional **regexp** parameters used to remove custom reference borders, e.g. ```$(( var ))```, ```$[[ var ]]```, ```< var />```, etc.

9. *nakiri.metaFill(_FORM_OBJ, _HIVE_OBJ)* fills a **NAKIRI FORM** with data provided in a **NAKIRI HIVE**. Example provided in the *NAKIRI FORM* section below. The **meta-fill** method stringifies the form to fill it, if you want to keep the filling order intact then use ```nakiri.mapEntries``` instead.  

10. *nakiri.findPathRef(_path, _HIVE_OBJ)* takes a **UNIX PATH* as reference and returns its value from the **NAKIRI HIVE**. e.g.  
```js
nakiri.findPathRef(/details/wage, {
  name: 'David',
  details: {
    wage: '15$/hr'
  }
}) //returns
```

> All methods with Beta suffixed in their namespace are in testing stage.  

# NAKIRI FORM  

A **NAKIRI FORM** is a JSON Object with **UNIX PATH** references to ```values``` stored in a **NAKIRI HIVE** Object. e.g.  

```js
const FORM = {
  name: '${{/name}}',
  mother: '${{./family/mother}}',
  age: '${{/age}}',
  color: '${{~/color}}',
  title: '${{title}}',
  pay: '${{pay/hourly}}',
  sister: '${{../sister/name}}',
  savings: '${{$((SAVINGS))/health}}',
}
```

> The ```$((SAVINGS))``` is a reference to a custom/non-standared prop in the **NAKIRI HIVE**.  

# NAKIRI HIVE  

A **NAKIRI HIVE** is a JSON Object with 5 props: 'ROOT', 'PARENT', 'HOME', 'CURRENT', 'SYMLESS'. These Objects are used to keep track of the navigation of a proverbial *head* up and down any *tree* like structure. e.g. JSON Objects, XML data, etc.  

```js
const david_data = {
  name: 'david',
  age: 22,
  details: {
    color: 'red',
    employement: {
      title: 'Jr. Manager',
      pay: {
        hourly: '15$'
      }
    }
  },
  family: {
    mother: 'Mary'
  }
}

const david_data_hive = {
  ROOT: david_data,
  PARENT: { sister: { name: 'Beth', age: 16 } }, // a psudo-parent since root has no parent
  CURRENT: david_data,
  HOME: david_data.details,
  SYMLESS: david_data.details.employement,
  SAVINGS: { health: '10k', unemployement: '50k' }
}
```

> As the *head* moved down the david_data object the 'ROOT' stays the same, but the 'CURRENT' is replaced by the *prop* on which the *head* is currently on.  
> The 'PARENT' also changes to the very next prop up the chain, relative to the 'CURRENT' prop.  
> The 'HOME' should refer to the node which connects the 'CURRENT' node to the 'ROOT' node.  
> The 'SYMLESS' prop can refer to any place, or even another object. To access this object with a *UNIX PATH* we can just name props of the SYMLESS object, e.g. the 'title' prop in the *NAKIRI FORM* section.

More documentation comming soon, if you have questions shoot them at *rayvanet@gmail.com* and I will get to it ASAP.

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

