// needs escape sequences for {, }, /, ., ~

function parseCircularObject(_OBJ, _SYMLESS, _SEPRATOR) {
  if (typeof(_OBJ) !== 'object') return 'ERR: 1st Argument not an object';
  if (typeof(_SYMLESS) === 'undefined') _SYMLESS = '__ROOT__/';
  if (typeof(_SEPRATOR) === 'undefined') _SEPRATOR = '/';

function getNode(_value, _data) {
  if (_value === '/')   return _data.ROOT; // dosen't work yet, the code removes the first '/' somewhere
  if (_value === '__ROOT__')   return _data.ROOT; 
  if (_value === '~')   return _data.HOME;
  if (_value === '..')  return _data.PARENT;
  if (_value === '.')   return _data.CURRENT;
  if (_value === SYMLESS_NODE) return _data.SYMLESS;
  return _value;
}

function getValue(_path, _data) {
  const isAbsolute = (_path[0] === '/'); 
  const isSYMLESS = (_path[0] !== '/' && _path[0] !== '~' && _path[0] !== '..' && _path[0] !== '.');

  //if (isSYMLESS === true) _path = SYMLESS_NODE + '/' + _path;
  if (isSYMLESS === true) _path = SYMLESS_NODE + _path;
  if (isAbsolute === true) _path = '__ROOT__/' + _path;
  const nodes = _path.split(SEPRATOR).filter(x => (x === ''? false: true)).map(_node => getNode(_node, _data));

//  if (isAbsolute === true) nodes.unshift('/'); // remove: original line
  const value = nodes.reduce((_prev_node_name, _node_name) => {
    if (typeof(_prev_node_name) === 'undefined') return '';
    return _prev_node_name[_node_name]
  });
  return value;
}

const SEPRATOR = _SEPRATOR;//'/'; // get form flags or args in v2.0
const SYMLESS_NODE = _SYMLESS;//"~/info"; // get from flags or args nowi, add a machanism to remove '/' from the end of the string if there is one or more of them there
const sampleObject = _OBJ;
/* const sampleObject = {
  david: {
    info: {
      name: "David",
      age: 22,
      sex: 'male',
    },
    employement: {
      title: "Jr. Software Tester",
      pay: "60k",
//      bonus: "${{(function christmassBonus() { return (+'$((/david/info/age')) / 2) + 'k' }}})()", // not working, will implement in v2.0
      detailes: {
        name: "${{~/info/name}}",
        age: "${{~/info/age}} years old ${{~/info/sex}}",
        sex: "${{sex}}"
      }
    }
  }
}*/

const ELEMENTS_JSON = sampleObject; // get from flags or args now
const JSON_DATA_STRING = JSON.stringify(ELEMENTS_JSON);
const REFERENCES = mapObjectRecursively(0, ELEMENTS_JSON, _key => _key, (_value, _meta_data) => { // The data argument must have {_root, _home, _parent, _symless}
  const REFERENCE_ITEMS = [_value, ...(JSON.stringify(_value).match(/\$\{\{[^\O\}]+\}\}/g) || [])
  .map(MATCH => (
    {
      REFERENCE: MATCH,
      SUB_REFERENCES: MATCH.match(/\$\(\([^\O\}]+\)\)/g),
    }
  )).map(MATCH => (
    {
      REFERENCE: {
        REF_STR: _value,
	REF: MATCH.REFERENCE,
        REF_PATH: MATCH.REFERENCE.replace(/^(\$\{\{)/, '').replace(/(\}\})$/, '')
      },
      SUB_REFERENCES: (MATCH.SUB_REFERENCES || []).map(ref => ({
        REF_STR: ref,
        REF_PATH: ref.replace(/^(\$\(\()/, '').replace(/(\)\))$/, '')
      }))
    }
  )).map(MATCH => (
    {
      ...MATCH,
      REFERENCE: {
        ...MATCH.REFERENCE,
        REF_VALUE: getValue(MATCH.REFERENCE.REF_PATH, _meta_data),
      }
      //ROOT: _meta_data.ROOT, //HOME: _meta_data.HOME, //PARENT: _meta_data.PARENT, //CURRENT: _meta_data.CURRENT, //SYMLESS: _meta_data.SYMLESS,
    }
  ))].reduce((prev, curr) => prev.replace(curr.REFERENCE.REF, curr.REFERENCE.REF_VALUE));//.map(MATCH => _value/*MATCH.REFERENCE.REF_VALUE*/);
  return REFERENCE_ITEMS;
}, {
  ROOT: ELEMENTS_JSON,
  HOME: ELEMENTS_JSON,
  PARENT: null,
  CURRENT: ELEMENTS_JSON,
  SYMLESS: SYMLESS_NODE 
});

//console.log( JSON.stringify(sampleObject, null, 2) );
//console.log( JSON.stringify(REFERENCES, null, 2) );
return REFERENCES;
//console.log( REFERENCES[1].SUB_REFERENCES );
}

function mapObjectRecursively(_depth_count, _obj, _keyModFunction, _valueModFunction, _meta_data) { // _meta_hive is data required at all levels of a recursive iteration
  if (Array.isArray(_obj)) return _obj.map(_i => mapObjectRecursively(_depth_count+1, _i, _keyModFunction, _valueModFunction, {
    ROOT: _meta_data.ROOT,
    HOME: (_depth_count === 1 ? _obj : _meta_data.HOME),
    PARENT: _obj,
    CURRENT: _i,
    SYMLESS: _meta_data.SYMLESS,
    PIGGYBACK: _meta_data.PIGGYBACK
  }));
  if (typeof(_obj) === 'object' && _obj !== null) {
	  const key_meta = {
		  ..._meta_data,
		  PARENT:_obj,
	  };
	  const ENTRIES = Object.entries(_obj).map(_entry => [_keyModFunction(_entry[0], {...key_meta, VALUE: _obj[_entry[0]]}), mapObjectRecursively(_depth_count+1, _entry[1], _keyModFunction, _valueModFunction, {
            ROOT: _meta_data.ROOT,
            HOME: (_depth_count === 1 ? _obj : _meta_data.HOME),
            PARENT: _obj,
            CURRENT: _entry[1],
	    KEY: _entry[0],
            SYMLESS: _meta_data.SYMLESS, 
            PIGGYBACK: _meta_data.PIGGYBACK
	  })]);
	  return Object.fromEntries(ENTRIES);
  }
  return _valueModFunction(_obj, _meta_data); // when object is STRING, NUMBER, BOOLEAN, etc.
};


function mapEntries(_obj, _map) {
  return Object.fromEntries(Object.entries(_obj).map(_map));
}

function mapKeys(_obj, _map) {
  return mapEntries(_obj, _e => [_map(_e[0]), _e[1]]);
}

function mapObjectRecursivelyV2 (_obj, _map, _d) {
  // beta
  // _d is for object depth, not array depth
  return mapEntries(_obj, _e => {
    if (_d <= 0 || _e[1] === null) return [_e[0], _e[1]];
    if (isObject(_e[1])) return [_e[0], mapObjectRecursivelyV2(_e[1], _map, _d-1)];
    if (Array.isArray(_e[1])) return [_e[0], _e[1].map(_m => {
      if (isObject(_m)) return mapObjectRecursivelyV2(_m, _map, _d-1); 
      return _map(['key'+_m, _m])[1];
    })];
    return _map([..._e]);
  });
}

function isObject(a) {
  if (typeof(a) === 'object' && !Array.isArray(a) && a !== null) return true;
  else false;
}

module.exports = {
  stringify: function(_JSON, SYMLESS, BREAK_POINT_DEPTH) {
    const output = {};
    return output;
  },
  parse: function(_OBJ, _SYMLESS, _SEPRATOR) {
    return parseCircularObject(_OBJ, _SYMLESS, _SEPRATOR);
  },
  mapObjectRecursively: mapObjectRecursively,
  mapEntries,
  mapKeys,
  mapObjectRecursivelyV2Beta: mapObjectRecursivelyV2,
  isObject,
}

