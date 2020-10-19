const Regexp = {};

Regexp.create = function(names, flags, fn) {
  fn = fn || function(s) { return s };
  return new RegExp(
    names
    .map((n) => 'string' === typeof n ? Regexp.types[n] : n)
    .map((r) => fn(r.toString().slice(1,-1)))
    .join('|'),
    flags
  );
};

Regexp.join = function(regexps, flags, prepend = '') {
  return new RegExp(
    regexps
    .map(n => 'string' === typeof n ? [n, Regexp.types[n]] : n)
    .map(r => (r[2] ?? '') + '(?<' + r[0].replace(/\s/g, '_') + '>' + r[1].toString().slice(1,-1) + ')')
    .join('|'),
    flags
  )
};

Regexp.types = {
  'tokens': /.+?\b|.\B|\b.+?/,
  'words': /[a-zA-Z0-9]{1,}/,
  'parts': /[./\\\(\)"'\-:,.;<>~!@#$%^&*\|\+=\[\]{}`~\? ]+/,

  'single comment': /\/\/.*?$/,
  'double comment': /\/\*[^]*?\*\//,
  'single quote string': /('(?:(?:\\\n|\\'|[^'\n]))*?')/,
  'double quote string': /("(?:(?:\\\n|\\"|[^"\n]))*?")/,
  'template string': /(`(?:(?:\\`|[^`]))*?`)/,

  'operator': /!|>=?|<=?|={1,3}|(?:&){1,2}|\|?\||\?|\*|\/|~|\^|%|\+{1,2}|\-{1,2}/, // \.(?!\d)|
  'attribute': / ((?!\d|[. ]*?(if|else|do|for|case|try|catch|while|with|switch))[a-zA-Z0-9_ $]+)(?=\(.*\).*{)/,
  'keyword': /\b(async|await|break|case|catch|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|if|implements|import|in|instanceof|interface|let|new|package|private|protected|public|return|static|super|switch|throw|try|typeof|while|with|yield)\b/,
  'declare': /\b(function|interface|class|var|let|const|enum|void)\b/,
  'variable': /\b(Object|Function|Boolean|Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|SyntaxError|TypeError|URIError|Number|Math|Date|String|RegExp|Array|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|ArrayBuffer|DataView|JSON|Intl|arguments|console|window|document|Symbol|Set|Map|WeakSet|WeakMap|Proxy|Reflect|Promise)\b/,
  'special': /\b(true|false|null|undefined)\b/,
  'params': /function[ \(]{1}[^]*?\{/,
  'number': /-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|-?Infinity)\b/,
  'symbol': /[{}[\]:,.]/,
  'call': /\b(\w+)(?=\()/,
  'definition': /\bthis\b/,

  // 'arguments': /(?:(?!if|else|do|for|case|try|catch|while|with|switch))(?:[^\(\n]*)(?:\().([^{()}]+)(?=[\}\)]+\s?\{)/,
  // / (?!\d|[. ]*?(?=if|else|do|for|case|try|catch|while|with|switch))(?=[a-zA-Z0-9_ $])+(?!\()([^{()}]+)(?=[\}\)]+\s?\{)/,
  // 'arguments': /(?!\()([^()]+)(?=\).+\{)/,
  'regexp': /(?![^\/])(\/(?![\/|\*]).*?[^\\\^]\/)([;\n\.\)\]\} gim])/,

  'xml': /<[^>]*>/,
  'url': /((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/,
  'indent': /^ +|^\t+/,//(?!.*(if|else|do|for|case|try|catch|while|with|switch))
  'line': /^.+$|^\n/,
  'newline': /\r\n|\r|\n/,
};

Regexp.types.comment = Regexp.create([
  'single comment',
  'double comment',
]);

Regexp.types.string = Regexp.create([
  'single quote string',
  'double quote string',
  'template string',
]);

Regexp.types.multiline = Regexp.create([
  'double comment',
  'template string',
  'indent',
  'line'
]);

Regexp.parse = function(s, regexp, filter) {
  var words = [];
  var word;

  if (filter) {
    while (word = regexp.exec(s)) {
      if (filter(word)) words.push(word);
    }
  } else {
    while (word = regexp.exec(s)) {
      words.push(word);
    }
  }

  return words;
};

function Point(p) {
  if (p) {
    this.x = p.x;
    this.y = p.y;
  } else {
    this.x = 0;
    this.y = 0;
  }
}

Point.prototype.set = function(p) {
  this.x = p.x;
  this.y = p.y;
};

Point.prototype.isNotZero = function () {
  return this.x !== 0 || this.y !== 0
};

Point.prototype.copy = function() {
  return new Point(this);
};

Point.prototype.equal = function(p) {
  return this.x === p.x && this.y === p.y
};

Point.prototype.addRight = function(x) {
  this.x += x;
  return this;
};

Point.prototype.abs = function () {
  return new Point({
    x: Math.abs(this.x),
    y: Math.abs(this.y)
  })
};

Point.prototype.sign = function () {
  return new Point({
    x: Math.sign(this.x),
    y: Math.sign(this.y)
  })
};

Point.prototype['/'] =
Point.prototype.div = function(p) {
  return new Point({
    x: this.x / (p.x || p.width || 0),
    y: this.y / (p.y || p.height || 0)
  });
};

Point.prototype['_/'] =
Point.prototype.floorDiv = function(p) {
  return new Point({
    x: this.x / (p.x || p.width || 0) | 0,
    y: this.y / (p.y || p.height || 0) | 0
  });
};

Point.prototype['o/'] =
Point.prototype.roundDiv = function(p) {
  return new Point({
    x: Math.round(this.x / (p.x || p.width || 0)),
    y: Math.round(this.y / (p.y || p.height || 0))
  });
};

Point.prototype['^/'] =
Point.prototype.ceilDiv = function(p) {
  return new Point({
    x: Math.ceil(this.x / (p.x || p.width || 0)),
    y: Math.ceil(this.y / (p.y || p.height || 0))
  });
};

Point.prototype['+'] =
Point.prototype.plus =
Point.prototype.add = function(p) {
  return new Point({
    x: this.x + (p.x || p.width || 0),
    y: this.y + (p.y || p.height || 0)
  });
};

Point.prototype['-'] =
Point.prototype.minus =
Point.prototype.sub = function(p) {
  return new Point({
    x: this.x - (p.x || p.width || 0),
    y: this.y - (p.y || p.height || 0)
  });
};

Point.prototype['*'] =
Point.prototype.mul = function(p) {
  return new Point({
    x: this.x * (p.x || p.width || 0),
    y: this.y * (p.y || p.height || 0)
  });
};

Point.prototype['^*'] =
Point.prototype.ceilMul = function(p) {
  return new Point({
    x: Math.ceil(this.x * (p.x || p.width || 0)),
    y: Math.ceil(this.y * (p.y || p.height || 0))
  });
};

Point.prototype['o*'] =
Point.prototype.roundMul = function(p) {
  return new Point({
    x: Math.round(this.x * (p.x || p.width || 0)),
    y: Math.round(this.y * (p.y || p.height || 0))
  });
};

Point.prototype['_*'] =
Point.prototype.floorMul = function(p) {
  return new Point({
    x: this.x * (p.x || p.width || 0) | 0,
    y: this.y * (p.y || p.height || 0) | 0
  });
};

Point.prototype.lerp = function(p, a) {
  return new Point({
    x: this.x + ((p.x - this.x) * a),
    y: this.y + ((p.y - this.y) * a)
  });
};

Point.prototype.clamp = function(area) {
  return Point.clamp(area, this)
};

Point.prototype.toString = function() {
  return this.x + ',' + this.y;
};

Point.sort = function(a, b) {
  return a.y === b.y
    ? a.x - b.x
    : a.y - b.y;
};

Point.gridRound = function(b, a) {
  return {
    x: Math.round(a.x / b.width),
    y: Math.round(a.y / b.height)
  };
};

Point.low = function(low, p) {
  return {
    x: Math.max(low.x, p.x),
    y: Math.max(low.y, p.y)
  };
};

Point.clamp = function(area, p) {
  return new Point({
    x: Math.min(area.end?.x ?? area.width, Math.max(area.begin?.x ?? 0, p.x)),
    y: Math.min(area.end?.y ?? area.height, Math.max(area.begin?.y ?? 0, p.y))
  });
};

Point.offset = function(b, a) {
  return { x: a.x + b.x, y: a.y + b.y };
};

Point.offsetX = function(x, p) {
  return { x: p.x + x, y: p.y };
};

Point.offsetY = function(y, p) {
  return { x: p.x, y: p.y + y };
};

Point.toLeftTop = function(p) {
  return {
    left: p.x,
    top: p.y
  };
};

class Area {
  static offset (b, a) {
    return {
      begin: point.offset(b.begin, a.begin),
      end: point.offset(b.end, a.end)
    }
  }

  static offsetX (x, a) {
    return {
      begin: point.offsetX(x, a.begin),
      end: point.offsetX(x, a.end)
    }
  }

  static offsetY (y, a) {
    return {
      begin: point.offsetY(y, a.begin),
      end: point.offsetY(y, a.end)
    }
  }

  static sort (a, b) {
    return a.begin.y === b.begin.y
      ? a.begin.x - b.begin.x
      : a.begin.y - b.begin.y
  }

  static toPointSort (a, b) {
    return a.begin.y <= b.y && a.end.y >= b.y
      ? a.begin.y === b.y
        ? a.begin.x - b.x
        : a.end.y === b.y
          ? a.end.x - b.x
          : 0
      : a.begin.y - b.y;
  }

  constructor (a) {
    if (a) {
      this.begin = new Point(a.begin);
      this.end = new Point(a.end);
    } else {
      this.begin = new Point;
      this.end = new Point;
    }
  }

  copy () {
    return new Area(this)
  }

  get () {
    var s = [this.begin, this.end].sort(Point.sort);
    return new Area({
      begin: new Point(s[0]),
      end: new Point(s[1])
    })
  }

  set (area) {
    this.begin.set(area.begin);
    this.end.set(area.end);
  }

  get height () {
    const { begin, end } = this.get();
    return end.y - begin.y
  }

  setLeft (bx, ex) {
    this.begin.x = bx;
    if (ex != null) this.end.x = ex;
    return this;
  }

  addRight (x) {
    this.begin.x += x;
    this.end.x += x;
    return this;
  }

  addBottom (y) {
    this.end.y += y;
    return this;
  }

  shiftByLines (y) {
    this.begin.y += y;
    this.end.y += y;
    return this
  }

  normalizeY () {
    return this.shiftByLines(-this.begin.y)
  }

  greaterThan (a) {
    return this.begin.y === a.end.y
      ? this.begin.x > a.end.x
      : this.begin.y > a.end.y;
  }

  greaterThanOrEqual (a) {
    return this.begin.y === a.begin.y
      ? this.begin.x >= a.begin.x
      : this.begin.y > a.begin.y;
  }

  lessThan (a) {
    return this.end.y === a.begin.y
      ? this.end.x < a.begin.x
      : this.end.y < a.begin.y;
  }

  lessThanOrEqual (a) {
    return this.end.y === a.end.y
      ? this.end.x <= a.end.x
      : this.end.y < a.end.y;
  }

  isEmpty () {
    return this.begin.equal(this.end)
  }

  inside (a) {
    return this['>'](a) && this['<'](a);
  }

  outside (a) {
    return this['<'](a) || this['>'](a);
  }

  insideEqual (a) {
    return this['>='](a) && this['<='](a);
  }

  outsideEqual (a) {
    return this['<='](a) || this['>='](a);
  }

  equal (a) {
    return this.begin.x === a.begin.x && this.begin.y === a.begin.y
        && this.end.x   === a.end.x   && this.end.y   === a.end.y;
  }

  beginLineEqual (a) {
    return this.begin.y === a.begin.y;
  }

  endLineEqual (a) {
    return this.end.y === a.end.y;
  }

  linesEqual (a) {
    return this['|='](a) && this['=|'](a);
  }

  sameLine (a) {
    return this.begin.y === this.end.y && this.begin.y === a.begin.y;
  }

  shortenByX (x) {
    return new Area({
      begin: {
        x: this.begin.x + x,
        y: this.begin.y
      },
      end: {
        x: this.end.x - x,
        y: this.end.y
      }
    });
  }

  widenByX (x) {
    return new Area({
      begin: {
        x: this.begin.x - x,
        y: this.begin.y
      },
      end: {
        x: this.end.x + x,
        y: this.end.y
      }
    });
  }

  toString () {
    let area = this.get();
    return '' + area.begin + '|' + area.end;
  }
}

Area.prototype['>'] = Area.prototype.greaterThan;
Area.prototype['>='] = Area.prototype.greaterThanOrEqual;
Area.prototype['<'] = Area.prototype.lessThan;
Area.prototype['<='] = Area.prototype.lessThanOrEqual;
Area.prototype['><'] = Area.prototype.inside;
Area.prototype['<>'] = Area.prototype.outside;
Area.prototype['>=<'] = Area.prototype.insideEqual;
Area.prototype['<=>'] = Area.prototype.outsideEqual;
Area.prototype['==='] = Area.prototype.equal;
Area.prototype['|='] = Area.prototype.beginLineEqual;
Area.prototype['=|'] = Area.prototype.endLineEqual;
Area.prototype['|=|'] = Area.prototype.linesEqual;
Area.prototype['=|='] = Area.prototype.sameLine;
Area.prototype['-x-'] = Area.prototype.shortenByX;
Area.prototype['+x+'] = Area.prototype.widenByX;

var push = [].push;
var slice = [].slice;

function Event() {
  if (!(this instanceof Event)) return new Event;

  this._handlers = {};
}

Event.prototype._getHandlers = function(name) {
  this._handlers = this._handlers || {};
  return this._handlers[name] = this._handlers[name] || [];
};

Event.prototype.emit = function(name, a, b, c, d) {
  if (this.silent) return
  var handlers = this._getHandlers(name);
  for (var i = 0; i < handlers.length; i++) {
    handlers[i](a, b, c, d);
  }};

Event.prototype.on = function(name) {
  var handlers;
  var newHandlers = slice.call(arguments, 1);
  if (Array.isArray(name)) {
    name.forEach(function(name) {
      handlers = this._getHandlers(name);
      push.apply(handlers, newHandlers[name]);
    }, this);
  } else {
    handlers = this._getHandlers(name);
    push.apply(handlers, newHandlers);
  }
};

Event.prototype.off = function(name, handler) {
  var handlers = this._getHandlers(name);
  var index = handlers.indexOf(handler);
  if (~index) handlers.splice(index, 1);
};

Event.prototype.once = function(name, fn) {
  var handlers = this._getHandlers(name);
  var handler = function(a, b, c, d) {
    fn(a, b, c, d);
    handlers.splice(handlers.indexOf(handler), 1);
  };
  handlers.push(handler);
};

/*

example search for offset `4` :
`o` are node's levels, `x` are traversal steps

x
x
o-->x   o   o
o o x   o   o o o
o o o-x o o o o o
1 2 3 4 5 6 7 8 9

*/

function Node(value, level) {
  this.value = value;
  this.level = level;
  this.width = new Array(this.level).fill(value && value.length || 0);
  this.next = new Array(this.level).fill(null);
}

Node.prototype = {
  get length() {
    return this.width[0];
  }
};

function SkipString(o) {
  o = o || {};
  this.levels = o.levels || 11;
  this.bias = o.bias || 1 / Math.E;
  this.head = new Node(null, this.levels);
  this.chunkSize = o.chunkSize || 5000;
}

SkipString.prototype = {
  get length() {
    return this.head.width[this.levels - 1];
  }
};

SkipString.prototype.get = function(offset) {
  // great hack to do offset >= for .search()
  // we don't have fractions anyway so..
  return this.search(offset, true);
};

SkipString.prototype.set = function(text) {
  this.insertChunked(0, text);
};

SkipString.prototype.search = function(offset, incl) {
  incl = incl ? .1 : 0;

  // prepare to hold steps
  var steps = new Array(this.levels);
  var width = new Array(this.levels);

  // iterate levels down, skipping top
  var i = this.levels;
  var node = this.head;

  while (i--) {
    while (offset + incl > node.width[i] && null != node.next[i]) {
      offset -= node.width[i];
      node = node.next[i];
    }
    steps[i] = node;
    width[i] = offset;
  }

  return {
    node: node,
    steps: steps,
    width: width,
    offset: offset
  };
};

SkipString.prototype.splice = function(s, offset, value, level) {
  var steps = s.steps; // skip steps left of the offset
  var width = s.width;

  var p; // left node or `p`
  var q; // right node or `q` (our new node)

  // create new node
  level = level || this.randomLevel();
  q = new Node(value, level);
  var length = q.width[0];

  // iterator
  var i;

  // iterate steps levels below new node level
  i = level;
  while (i--) {
    p = steps[i]; // get left node of this level step
    q.next[i] = p.next[i]; // insert so inherit left's next
    p.next[i] = q; // left's next is now our new node
    q.width[i] = p.width[i] - width[i] + length;
    p.width[i] = width[i];
  }

  // iterate steps all levels down until except new node level
  i = this.levels;
  while (i-- > level) {
    p = steps[i]; // get left node of this level
    p.width[i] += length; // add new node width
  }

  // return new node
  return q;
};

SkipString.prototype.insert = function(offset, value, level) {
  var s = this.search(offset);

  // if search falls in the middle of a string
  // insert it there instead of creating a new node
  if (s.offset && s.node.value && s.offset < s.node.value.length) {
    this.update(s, insert(s.offset, s.node.value, value));
    return s.node;
  }

  return this.splice(s, offset, value, level);
};

SkipString.prototype.update = function(s, value) {
  // values length difference
  var length = s.node.value.length - value.length;

  // update value
  s.node.value = value;

  // iterator
  var i;

  // fix widths on all levels
  i = this.levels;

  while (i--) {
    s.steps[i].width[i] -= length;
  }

  return length;
};

SkipString.prototype.remove = function(range) {
  if (range[1] > this.length) {
    throw new Error(
      'range end over maximum length(' +
      this.length + '): [' + range.join() + ']'
    );
  }

  // remain distance to remove
  var x = range[1] - range[0];

  // search for node on left edge
  var s = this.search(range[0]);
  var offset = s.offset;
  var steps = s.steps;
  var node = s.node;

  // skip head
  if (this.head === node) node = node.next[0];

  // slice left edge when partial
  if (offset) {
    if (offset < node.width[0]) {
      x -= this.update(s,
        node.value.slice(0, offset) +
        node.value.slice(
          offset +
          Math.min(x, node.length - offset)
        )
      );
    }

    node = node.next[0];

    if (!node) return;
  }

  // remove all full nodes in range
  while (node && x >= node.width[0]) {
    x -= this.removeNode(steps, node);
    node = node.next[0];
  }

  // slice right edge when partial
  if (x) {
    this.replace(steps, node, node.value.slice(x));
  }
};

SkipString.prototype.removeNode = function(steps, node) {
  var length = node.width[0];

  var i;

  i = node.level;
  while (i--) {
    steps[i].width[i] -= length - node.width[i];
    steps[i].next[i] = node.next[i];
  }

  i = this.levels;
  while (i-- > node.level) {
    steps[i].width[i] -= length;
  }

  return length;
};

SkipString.prototype.replace = function(steps, node, value) {
  var length = node.value.length - value.length;

  node.value = value;

  var i;
  i = node.level;
  while (i--) {
    node.width[i] -= length;
  }

  i = this.levels;
  while (i-- > node.level) {
    steps[i].width[i] -= length;
  }

  return length;
};

SkipString.prototype.removeCharAt = function(offset) {
  return this.remove([offset, offset+1]);
};

SkipString.prototype.insertChunked = function(offset, text) {
  for (var i = 0; i < text.length; i += this.chunkSize) {
    var chunk = text.substr(i, this.chunkSize);
    this.insert(i + offset, chunk);
  }
};

SkipString.prototype.substring = function(a, b) {
  var length = b - a;

  var search = this.search(a, true);
  var node = search.node;
  if (this.head === node) node = node.next[0];
  var d = length + search.offset;
  var s = '';
  while (node && d >= 0) {
    d -= node.width[0];
    s += node.value;
    node = node.next[0];
  }
  if (node) {
    s += node.value;
  }

  return s.substr(search.offset, length);
};

SkipString.prototype.randomLevel = function() {
  var level = 1;
  while (level < this.levels - 1 && Math.random() < this.bias) level++;
  return level;
};

SkipString.prototype.getRange = function(range) {
  range = range || [];
  return this.substring(range[0], range[1]);
};

SkipString.prototype.copy = function() {
  var copy = new SkipString;
  var node = this.head;
  var offset = 0;
  while (node = node.next[0]) {
    copy.insert(offset, node.value);
    offset += node.width[0];
  }
  return copy;
};

SkipString.prototype.joinString = function(delimiter) {
  var parts = [];
  var node = this.head;
  while (node = node.next[0]) {
    parts.push(node.value);
  }
  return parts.join(delimiter);
};

SkipString.prototype.toString = function() {
  return this.substring(0, this.length);
};

function insert(offset, string, part) {
  return string.slice(0, offset) + part + string.slice(offset);
}

// var WORD = /\w+/g;
var WORD = /[a-zA-Z0-9]{1,}/g;

function PrefixTreeNode() {
  this.value = '';
  this.rank = 0;
  this.children = {};
}

PrefixTreeNode.prototype.getChildren = function() {
  var children = Object
    .keys(this.children)
    .map((key) => this.children[key]);

  return children.reduce((p, n) => p.concat(n.getChildren()), children);
};

PrefixTreeNode.prototype.collect = function(key) {
  var collection = [];
  var node = this.find(key);
  if (node) {
    collection = node
      .getChildren()
      .filter((node) => node.value)
      .sort((a, b) => {
        var res = b.rank - a.rank;
        if (res === 0) res = b.value.length - a.value.length;
        if (res === 0) res = a.value > b.value;
        return res;
      });

    if (node.value) collection.push(node);
  }
  return collection;
};

PrefixTreeNode.prototype.find = function(key) {
  var node = this;
  for (var char in key) {
    if (key[char] in node.children) {
      node = node.children[key[char]];
    } else {
      return;
    }
  }
  return node;
};

PrefixTreeNode.prototype.insert = function(s, value) {
  var node = this;
  var i = 0;
  var n = s.length;

  while (i < n) {
    if (s[i] in node.children) {
      node = node.children[s[i]];
      i++;
    } else {
      break;
    }
  }

  while (i < n) {
    node =
    node.children[s[i]] =
    node.children[s[i]] || new PrefixTreeNode;
    i++;
  }

  node.value = s;
  node.rank++;
};

PrefixTreeNode.prototype.index = function(s) {
  var word;
  while (word = WORD.exec(s)) {
    this.insert(word[0]);
  }
};

function binarySearch(array, compare) {
  var index = -1;
  var prev = -1;
  var low = 0;
  var high = array.length;
  if (!high) return {
    item: null,
    index: 0
  };

  do {
    prev = index;
    index = low + (high - low >> 1);
    var item = array[index];
    var result = compare(item);

    if (result) low = index;
    else high = index;
  } while (prev !== index);

  if (item != null) {
    return {
      item: item,
      index: index
    };
  }

  return {
    item: null,
    index: ~low * -1 - 1
  };
}

function Parts(minSize) {
  minSize = minSize || 5000;
  this.minSize = minSize;
  this.parts = [];
  this.length = 0;
}

Parts.prototype.push = function(item) {
  this.append([item]);
};

Parts.prototype.append = function(items) {
  var part = last(this.parts);

  if (!part) {
    part = [];
    part.startIndex = 0;
    part.startOffset = 0;
    this.parts.push(part);
  }
  else if (part.length >= this.minSize) {
    var startIndex = part.startIndex + part.length;
    var startOffset = items[0];

    part = [];
    part.startIndex = startIndex;
    part.startOffset = startOffset;
    this.parts.push(part);
  }

  part.push.apply(part, items.map(offset => offset - part.startOffset));

  this.length += items.length;
};

Parts.prototype.get = function(index) {
  var part = this.findPartByIndex(index).item;
  if (!part) return -1
  return (part[Math.min(part.length - 1, index - part.startIndex)] ?? -1) + part.startOffset;
};

Parts.prototype.find = function(offset) {
  var p = this.findPartByOffset(offset);
  if (!p.item) return null;

  var part = p.item;
  var partIndex = p.index;
  var o = this.findOffsetInPart(offset, part);
  return {
    offset: o.item + part.startOffset,
    index: o.index + part.startIndex,
    local: o.index,
    part: part,
    partIndex: partIndex
  };
};

Parts.prototype.insert = function(offset, array) {
  var o = this.find(offset);
  if (!o) {
    return this.append(array);
  }
  if (o.offset > offset) o.local = -1;
  var length = array.length;
  //TODO: maybe subtract 'offset' instead ?
  array = array.map(el => el -= o.part.startOffset);
  insert$1(o.part, o.local + 1, array);
  this.shiftIndex(o.partIndex + 1, -length);
  this.length += length;
};

Parts.prototype.shiftOffset = function(offset, shift) {
  var parts = this.parts;
  var item = this.find(offset);
  if (!item) return;
  if (offset > item.offset) item.local += 1;

  var removed = 0;
  for (var i = item.local; i < item.part.length; i++) {
    item.part[i] += shift;
    if (item.part[i] + item.part.startOffset < offset) {
      removed++;
      item.part.splice(i--, 1);
    }
  }
  if (removed) {
    this.shiftIndex(item.partIndex + 1, removed);
    this.length -= removed;
  }
  for (var i = item.partIndex + 1; i < parts.length; i++) {
    parts[i].startOffset += shift;
    if (parts[i].startOffset < offset) {
      if (last(parts[i]) + parts[i].startOffset < offset) {
        removed = parts[i].length;
        this.shiftIndex(i + 1, removed);
        this.length -= removed;
        parts.splice(i--, 1);
      } else {
        this.removeBelowOffset(offset, parts[i]);
      }
    }
  }
};

Parts.prototype.removeRange = function(range) {
  var a = this.find(range[0]);
  var b = this.find(range[1]);
  if (!a && !b) return;

  if (a.partIndex === b.partIndex) {
    if (a.offset >= range[1] || a.offset < range[0]) a.local += 1;
    if (b.offset >= range[1] || b.offset < range[0]) b.local -= 1;
    var shift = remove(a.part, a.local, b.local + 1).length;
    this.shiftIndex(a.partIndex + 1, shift);
    this.length -= shift;
  } else {
    if (a.offset >= range[1] || a.offset < range[0]) a.local += 1;
    if (b.offset >= range[1] || b.offset < range[0]) b.local -= 1;
    var shiftA = remove(a.part, a.local).length;
    var shiftB = remove(b.part, 0, b.local + 1).length;
    if (b.partIndex - a.partIndex > 1) {
      var removed = remove(this.parts, a.partIndex + 1, b.partIndex);
      var shiftBetween = removed.reduce((p,n) => p + n.length, 0);
      b.part.startIndex -= shiftA + shiftBetween;
      this.shiftIndex(b.partIndex - removed.length + 1, shiftA + shiftB + shiftBetween);
      this.length -= shiftA + shiftB + shiftBetween;
    } else {
      b.part.startIndex -= shiftA;
      this.shiftIndex(b.partIndex + 1, shiftA + shiftB);
      this.length -= shiftA + shiftB;
    }
  }

  //TODO: this is inefficient as we can calculate the indexes ourselves
  if (!a.part.length) {
    this.parts.splice(this.parts.indexOf(a.part), 1);
  }
  if (!b.part.length) {
    this.parts.splice(this.parts.indexOf(b.part), 1);
  }
};

Parts.prototype.shiftIndex = function(startIndex, shift) {
  for (var i = startIndex; i < this.parts.length; i++) {
    this.parts[i].startIndex -= shift;
  }
};

Parts.prototype.removeBelowOffset = function(offset, part) {
  var o = this.findOffsetInPart(offset, part);
  var shift = remove(part, 0, o.index).length;
  this.shiftIndex(o.partIndex + 1, shift);
  this.length -= shift;
};

Parts.prototype.findOffsetInPart = function(offset, part) {
  offset -= part.startOffset;
  return binarySearch(part, o => o <= offset);
};

Parts.prototype.findPartByIndex = function(index) {
  return binarySearch(this.parts, s => s.startIndex <= index);
};

Parts.prototype.findPartByOffset = function(offset) {
  return binarySearch(this.parts, s => s.startOffset <= offset);
};

Parts.prototype.toArray = function() {
  return this.parts.reduce((p,n) => p.concat(n), []);
};

Parts.prototype.slice = function() {
  var parts = new Parts(this.minSize);
  this.parts.forEach(part => {
    var p = part.slice();
    p.startIndex = part.startIndex;
    p.startOffset = part.startOffset;
    parts.parts.push(p);
  });
  parts.length = this.length;
  return parts;
};

function last(array) {
  return array[array.length - 1];
}

function remove(array, a, b) {
  if (b == null) {
    return array.splice(a);
  } else {
    return array.splice(a, b - a);
  }
}

function insert$1(target, index, array) {
  var op = array.slice();
  op.unshift(index, 0);
  target.splice.apply(target, op);
}

var Type$1 = {
  '\n': 'lines',
  '{': 'open curly',
  '}': 'close curly',
  '[': 'open square',
  ']': 'close square',
  '(': 'open parens',
  ')': 'close parens',
  '/': 'open comment',
  '*': 'close comment',
  '`': 'template string',
};

var TOKEN = /\n|\/\*|\*\/|`|\{|\}|\[|\]|\(|\)/g;

Tokens.Type = Type$1;

function Tokens(factory) {
  factory = factory || function() { return new Parts; };

  this.factory = factory;

  var t = this.tokens = {
    lines: factory(),
    blocks: factory(),
    segments: factory(),
  };

  this.collection = {
    '\n': t.lines,
    '{': t.blocks,
    '}': t.blocks,
    '[': t.blocks,
    ']': t.blocks,
    '(': t.blocks,
    ')': t.blocks,
    '/': t.segments,
    '*': t.segments,
    '`': t.segments,
  };
}

Tokens.prototype.__proto__ = Event.prototype;

Tokens.prototype.index = function(text, offset) {
  offset = offset || 0;

  var tokens = this.tokens;
  var match;
  var collection;

  while (match = TOKEN.exec(text)) {
    collection = this.collection[text[match.index]];
    collection.push(match.index + offset);
  }
};

Tokens.prototype.update = function(range, text, shift) {
  var insert = new Tokens(Array);
  insert.index(text, range[0]);

  var lengths = {};
  for (var type in this.tokens) {
    lengths[type] = this.tokens[type].length;
  }

  for (var type in this.tokens) {
    this.tokens[type].shiftOffset(range[0], shift);
    this.tokens[type].removeRange(range);
    this.tokens[type].insert(range[0], insert.tokens[type]);
  }

  for (var type in this.tokens) {
    if (this.tokens[type].length !== lengths[type]) {
      this.emit(`change ${type}`);
    }
  }
};

Tokens.prototype.getByIndex = function(type, index) {
  return this.tokens[type].get(index);
};

Tokens.prototype.getCollection = function(type) {
  return this.tokens[type];
};

Tokens.prototype.getByOffset = function(type, offset) {
  return this.tokens[type].find(offset);
};

Tokens.prototype.copy = function() {
  var tokens = new Tokens(this.factory);
  var t = tokens.tokens;
  for (var key in this.tokens) {
    t[key] = this.tokens[key].slice();
  }
  tokens.collection = {
    '\n': t.lines,
    '{': t.blocks,
    '}': t.blocks,
    '[': t.blocks,
    ']': t.blocks,
    '(': t.blocks,
    ')': t.blocks,
    '/': t.segments,
    '*': t.segments,
    '`': t.segments,
  };
  return tokens;
};

var Begin = /[\/'"`]/g;

var Match = {
  'single comment': ['//','\n'],
  'double comment': ['/*','*/'],
  'template string': ['`','`'],
  'single quote string': ["'","'"],
  'double quote string': ['"','"'],
  'regexp': ['/','/'],
};

var Skip = {
  'single quote string': "\\",
  'double quote string': "\\",
  'single comment': false,
  'double comment': false,
  'regexp': "\\",
};

var Token = {};
for (var key in Match) {
  var M = Match[key];
  Token[M[0]] = key;
}

var Length = {
  'open comment': 2,
  'close comment': 2,
  'template string': 1,
};

var NotOpen = {
  'close comment': true
};

var Closes = {
  'open comment': 'close comment',
  'template string': 'template string',
};

var Tag = {
  'open comment': 'comment',
  'template string': 'string',
};

function Segments(buffer) {
  this.buffer = buffer;
  this.cache = {};
  this.reset();
}

Segments.prototype.clearCache = function(offset) {
  if (offset) {
    var s = binarySearch(this.cache.state, s => s.offset < offset);
    this.cache.state.splice(s.index);
  } else {
    this.cache.state = [];
  }
  this.cache.offset = {};
  this.cache.range = {};
  this.cache.point = {};
};

Segments.prototype.reset = function() {
  this.clearCache();
};

Segments.prototype.get = function(y) {
  if (y in this.cache.point) {
    return this.cache.point[y];
  }

  var segments = this.buffer.tokens.getCollection('segments');
  var open = false;
  var state = null;
  var waitFor = '';
  var point = { x:-1, y:-1 };
  var close = 0;
  var offset;
  var segment;
  var range;
  var valid;
  var last;

  var i = 0;

  var cacheState = this.getCacheState(y);
  if (cacheState && cacheState.item) {
    open = true;
    state = cacheState.item;
    waitFor = Closes[state.type];
    i = state.index + 1;
  }

  for (; i < segments.length; i++) {
    offset = segments.get(i);
    segment = {
      offset: offset,
      type: Type[this.buffer.charAt(offset)]
    };

    // searching for close token
    if (open) {
      if (waitFor === segment.type) {
        point = this.getOffsetPoint(segment.offset);

        if (!point) {
          return (this.cache.point[y] = null);
        }

        if (point.y >= y) {
          return (this.cache.point[y] = Tag[state.type]);
        }

        last = segment;
        last.point = point;
        state = null;
        open = false;

        if (point.y >= y) break;
      }
    }

    // searching for open token
    else {
      point = this.getOffsetPoint(segment.offset);

      if (!point) {
        return (this.cache.point[y] = null);
      }

      range = this.buffer.getLine(point.y).offsetRange;

      if (last && last.point.y === point.y) {
        close = last.point.x + Length[last.type];
      } else {
        close = 0;
      }

      valid = this.isValidRange([range[0], range[1]+1], segment, close);

      if (valid) {
        if (NotOpen[segment.type]) continue;
        open = true;
        state = segment;
        state.index = i;
        state.point = point;
        // state.toString = function() { return this.offset };
        waitFor = Closes[state.type];
        if (!this.cache.state.length || this.cache.state.length && state.offset > this.cache.state[this.cache.state.length - 1].offset) {
          this.cache.state.push(state);
        }
      }

      if (point.y >= y) break;
    }
  }

  if (state && state.point.y < y) {
    return (this.cache.point[y] = Tag[state.type]);
  }

  return (this.cache.point[y] = null);
};

//TODO: cache in Buffer
Segments.prototype.getOffsetPoint = function(offset) {
  if (offset in this.cache.offset) return this.cache.offset[offset];
  return (this.cache.offset[offset] = this.buffer.getOffsetPoint(offset));
};

Segments.prototype.isValidRange = function(range, segment, close) {
  var key = range.join();
  if (key in this.cache.range) return this.cache.range[key];
  var text = this.buffer.getOffsetRangeText(range);
  var valid = this.isValid(text, segment.offset - range[0], close);
  return (this.cache.range[key] = valid);
};

Segments.prototype.isValid = function(text, offset, lastIndex) {
  Begin.lastIndex = lastIndex;

  var match = Begin.exec(text);
  if (!match) return;

  var i = match.index;

  var last = i;

  var valid = true;

  outer:
  for (; i < text.length; i++) {
    var one = text[i];
    var next = text[i + 1];
    var two = one + next;
    if (i === offset) return true;

    var o = Token[two];
    if (!o) o = Token[one];
    if (!o) {
      continue;
    }

    var waitFor = Match[o][1];

    last = i;

    switch (waitFor.length) {
      case 1:
        while (++i < text.length) {
          one = text[i];

          if (one === Skip[o]) {
            ++i;
            continue;
          }

          if (waitFor === one) {
            i += 1;
            break;
          }

          if ('\n' === one && !valid) {
            valid = true;
            i = last + 1;
            continue outer;
          }

          if (i === offset) {
            valid = false;
            continue;
          }
        }
        break;
      case 2:
        while (++i < text.length) {

          one = text[i];
          two = text[i] + text[i + 1];

          if (one === Skip[o]) {
            ++i;
            continue;
          }

          if (waitFor === two) {
            i += 2;
            break;
          }

          if ('\n' === one && !valid) {
            valid = true;
            i = last + 2;
            continue outer;
          }

          if (i === offset) {
            valid = false;
            continue;
          }
        }
        break;
    }
  }
  return valid;
};

Segments.prototype.getCacheState = function(y) {
  var s = binarySearch(this.cache.state, s => s.point.y < y);
  if (s.item && y - 1 < s.item.point.y) return null;
  else return s;
  // return s;
};

function Indexer(buffer) {
  this.buffer = buffer;
}

Indexer.prototype.find = function(s) {
  if (!s) return [];
  var offsets = [];
  var text = this.buffer.raw;
  var len = s.length;
  var index;
  while (~(index = text.indexOf(s, index + len))) {
    offsets.push(index);
  }
  return offsets;
};

// import Syntax from './syntax.js'

var EOL = /\r\n|\r|\n/g;
var NEWLINE = /\n/g;
var WORDS = Regexp.create(['tokens'], 'g');

var SEGMENT = {
  'comment': '/*',
  'string': '`',
};

function Buffer() {
  this.log = [];
  // this.syntax = new Syntax;
  this.indexer = new Indexer(this);
  this.segments = new Segments(this);
  this.setText('');
}

Buffer.prototype.__proto__ = Event.prototype;

Buffer.prototype.updateRaw = function() {
  this.raw = this.text.toString();
};

Buffer.prototype.copy = function() {
  this.updateRaw();
  var buffer = new Buffer;
  buffer.replace(this);
  return buffer;
};

Buffer.prototype.replace = function(data) {
  this.raw = data.raw;
  this.text.set(this.raw);
  this.tokens = data.tokens.copy();
  this.segments.clearCache();
};

Buffer.prototype.setText = function(text) {
  text = normalizeEOL(text);

  this.raw = text; //this.syntax.highlight(text);

  // this.syntax.tab = ~this.raw.indexOf('\t') ? '\t' : ' ';

  this.text = new SkipString;
  this.text.set(this.raw);

  this.tokens = new Tokens;
  this.tokens.index(this.raw);
  this.tokens.on('change segments', this.emit.bind(this, 'change segments'));

  this.prefix = new PrefixTreeNode;
  this.prefix.index(this.raw);

  this.emit('set');
};

Buffer.prototype.insert =
Buffer.prototype.insertTextAtPoint = function(p, text, noLog) {
  if (!noLog) this.emit('before update');

  text = normalizeEOL(text);

  var length = text.length;
  var point = this.getPoint(p);
  var shift = (text.match(NEWLINE) || []).length;
  var range = [point.y, point.y + shift];
  var offsetRange = this.getLineRangeOffsets(range);

  var before = this.getOffsetRangeText(offsetRange);
  this.text.insert(point.offset, text);
  offsetRange[1] += text.length;
  var after = this.getOffsetRangeText(offsetRange);
  this.prefix.index(after);
  this.tokens.update(offsetRange, after, length);
  this.segments.clearCache(offsetRange[0]);
  if (!noLog) this.appendLog('insert', [point.offset, point.offset + text.length], text);

  if (!noLog) this.emit('update', range, shift, before, after);

  return text.length;
};

Buffer.prototype.remove =
Buffer.prototype.removeOffsetRange = function(o, noLog) {
  if (!noLog) this.emit('before update');

  var a = this.getOffsetPoint(o[0]);
  var b = this.getOffsetPoint(o[1]);
  var length = o[0] - o[1];
  var range = [a.y, b.y];
  var shift = a.y - b.y;

  var offsetRange = this.getLineRangeOffsets(range);
  var before = this.getOffsetRangeText(offsetRange);
  var text = this.text.getRange(o);
  this.text.remove(o);
  offsetRange[1] += length;
  var after = this.getOffsetRangeText(offsetRange);
  this.prefix.index(after);
  this.tokens.update(offsetRange, after, length);
  this.segments.clearCache(offsetRange[0]);
  if (!noLog) this.appendLog('remove', o, text);

  if (!noLog) this.emit('update', range, shift, before, after);
};

Buffer.prototype.appendLog = function(type, offsets, text) {
  if (type === 'insert') {
    var lastLog = this.log[this.log.length - 1];
    if (lastLog && lastLog[0] === 'insert' && lastLog[1][1] === offsets[0]) {
      lastLog[1][1] += text.length;
      lastLog[2] += text;
    } else {
      this.log.push(['insert', offsets, text]);
    }
  } else if (type === 'remove') {
    var lastLog = this.log[this.log.length - 1];
    if (lastLog && lastLog[0] === 'remove' && lastLog[1][0] === offsets[1]) {
      lastLog[1][0] -= text.length;
      lastLog[2] = text + lastLog[2];
    } else {
      this.log.push(['remove', offsets, text]);
    }
  }
};

Buffer.prototype.removeArea = function(area) {
  var offsets = this.getAreaOffsetRange(area);
  return this.removeOffsetRange(offsets);
};

Buffer.prototype.removeCharAtPoint = function(p) {
  var point = this.getPoint(p);
  var offsetRange = [point.offset, point.offset+1];
  return this.removeOffsetRange(offsetRange);
};

Buffer.prototype.get = function(range) {
  var code = this.getLineRangeText(range);

  // calculate indent for `code`
  //TODO: move to method
  var last = code.slice(code.lastIndexOf('\n'));
  var AnyChar = /\S/g;
  var y = range[1];
  var match = AnyChar.exec(last);
  while (!match && y < this.loc()) {
    var after = this.getLineText(++y);
    AnyChar.lastIndex = 0;
    match = AnyChar.exec(after);
  }
  var indent = 0;
  if (match) indent = match.index;
  var indentText = '\n' + new Array(indent + 1).join(this.syntax.tab);

  var segment = this.segments.get(range[0]);
  if (segment) {
    code = SEGMENT[segment] + '\uffba\n' + code + indentText + '\uffbe*/`';
    code = this.syntax.highlight(code);
    code = '<' + segment[0] + '>' +
      code.substring(
        code.indexOf('\uffba') + 2,
        code.lastIndexOf('\uffbe')
      );
  } else {
    code = this.syntax.highlight(code + indentText + '\uffbe*/`');
    code = code.substring(0, code.lastIndexOf('\uffbe'));
  }
  return code;
};

Buffer.prototype.getLine = function(y) {
  var line = new Line;
  var loc = this.loc();
  line.offsetRange = this.getLineRangeOffsets([y,y]);
  line.offset = line.offsetRange[0];
  line.length = line.offsetRange[1] - line.offsetRange[0] - (y < loc ? 1 : 0);
  line.point.set({ x: 0, y:y >= loc ? loc : y });
  return line;
};

Buffer.prototype.getPoint = function(p) {
  var line = this.getLine(p.y);
  var point = new Point({
    x: Math.min(line.length, p.x),
    y: line.point.y
  });
  point.offset = line.offset + point.x;
  point.point = point;
  point.line = line;
  return point;
};

Buffer.prototype.getLineRangeText = function(range) {
  var offsets = this.getLineRangeOffsets(range);
  var text = this.text.getRange(offsets);
  return text;
};

Buffer.prototype.getLineRangeOffsets = function(range) {
  var a = this.getLineOffset(range[0]);
  var b = range[1] >= this.loc()
    ? this.text.length
    : this.getLineOffset(range[1] + 1);
  var offsets = [a, b];
  return offsets;
};

Buffer.prototype.getOffsetRangeText = function(offsetRange) {
  var text = this.text.getRange(offsetRange);
  return text;
};

Buffer.prototype.getOffsetPoint = function(offset) {
  var token = this.tokens.getByOffset('lines', offset - .5);
  if (!token) return new Point()
  return new Point({
    x: offset - (offset > token.offset ? token.offset + (!!token.part.length) : 0),
    y: Math.min(this.loc(), token.index - (token.offset + 1 > offset) + 1)
  });
};

Buffer.prototype.charAt = function(offset) {
  var char = this.text.getRange([offset, offset + 1]);
  return char;
};

Buffer.prototype.getOffsetLineText = function(offset) {
  return {
    line: line,
    text: text,
  }
};

Buffer.prototype.getLineLength = function(line) {
  return this.getLine(line).length
};

Buffer.prototype.getLineText = function(y) {
  var text = this.getLineRangeText([y,y]);
  return text;
};

Buffer.prototype.getAreaText = function(area) {
  var offsets = this.getAreaOffsetRange(area);
  var text = this.text.getRange(offsets);
  return text;
};

Buffer.prototype.wordAreaAtPoint = function(p, inclusive) {
  var point = this.getPoint(p);
  var text = this.text.getRange(point.line.offsetRange);
  var words = Regexp.parse(text, WORDS);

  if (words.length === 1) {
    var area = new Area({
      begin: { x: 0, y: point.y },
      end: { x: point.line.length, y: point.y },
    });

    return area;
  }

  var lastIndex = 0;
  var word = [];
  var end = text.length;

  for (var i = 0; i < words.length; i++) {
    word = words[i];
    if (word.index > point.x - !!inclusive) {
      end = word.index;
      break;
    }
    lastIndex = word.index;
  }

  var area = new Area({
    begin: { x: lastIndex, y: point.y },
    end: { x: end, y: point.y }
  });

  return area;
};

Buffer.prototype.moveAreaByLines = function(dy, area) {
  if (area.begin.y + dy < 0 || area.end.y + dy > this.loc()) return false;

  let x = 0;
  let y = area.begin.y + dy;

  let swap_a = false;
  let swap_b = false;

  area.end.x = area.begin.x = 0;
  area.end.y = area.end.y + 1;

  if (dy > 0 && area.end.y === this.loc()) {
    if (area.begin.y === 0) {
      area.begin.x = 0;
      area.end.x = 0;
      x = Infinity;
      swap_b = true;
    } else {
      area.end.y = this.loc();
      y = area.begin.y + dy;
      x = Infinity;
      swap_b = true;
    }
  } else if (dy < 0 && area.end.y > this.loc() && y > 0) {
    area.begin.y = y;
    area.begin.x = this.getLineLength(area.begin.y);
    y = area.begin.y - 1;
    x = Infinity;
  } else if (dy < 0 && y === 0 && area.end.y > this.loc()) {
    area.begin.y -= 1;
    area.begin.x = this.getLineLength(area.begin.y);
    swap_a = true;
  }

  let offsets = this.getAreaOffsetRange(area);
  let text = this.text.getRange(offsets);

  if (swap_a) {
    text = text.slice(1) + text[0];
  }
  if (swap_b) {
    text = text.slice(-1) + text.slice(0, -1);
  }

  this.remove(offsets);
  this.insert({ x, y }, text);

  return true;
};

Buffer.prototype.getAreaOffsetRange = function(area) {
  var begin = this.getPoint(area.begin);
  var end = this.getPoint(area.end);
  var range = [
    Math.max(0, begin.offset),
    end.y < area.end.y ? end.line.offsetRange[1] : end.offset
  ];
  return range;
};

Buffer.prototype.getOffsetLine = function(offset) {
  return line;
};

Buffer.prototype.getLineOffset = function(y) {
  var offset = y < 0 ? -1 : y === 0 ? 0 : this.tokens.getByIndex('lines', y - 1) + 1;
  return offset;
};

Buffer.prototype.getLongestLine = function() {
  return this.getLongestLineLength(true)
};

Buffer.prototype.getLongestLineLength = function(withLineNumber) {
  // TODO: this should be part of the 'Parts' class
  // so lookup becomes O(1), currently lookup is O(n)
  var max = this.getLineLength(this.loc()) + 1, y = this.loc(), diff = 0, prev = -1, curr = 0;
  var parts = this.tokens.getCollection('lines').parts;
  for (var i = 0, cy = 0; i < parts.length; i++) {
    var part = parts[i];
    for (var j = 0; j < part.length; j++) {
      cy++;
      curr = part[j];
      diff = curr - prev;
      prev = curr;
      if (diff > max) {
        max = diff;
        y = cy;
      }
    }
  }
  if (withLineNumber) return {
    length: max - 1,
    lineNumber: Math.max(0, y - 1)
  }
  return max - 1 // minus the newline char
};

Buffer.prototype.loc = function() {
  return this.tokens.getCollection('lines').length;
};

Buffer.prototype.toString = function() {
  return this.text.toString();
};

function Line() {
  this.offsetRange = [];
  this.offset = 0;
  this.length = 0;
  this.point = new Point;
}

function normalizeEOL(s) {
  return s.replace(EOL, '\n');
}

function debounce(fn, ms) {
  var timeout;

  return function debounceWrap(a, b, c, d) {
    clearTimeout(timeout);
    timeout = setTimeout(fn.bind(this, a, b, c, d), ms);
    return timeout;
  }
}

function History(editor) {
  this.editor = editor;
  this.log = [null];
  this.needle = 1;
  this.lastNeedle = 1;
  this.timeout = true;
  this.timeStart = 0;
  this.debouncedSave = debounce(this.actuallySave.bind(this), 700);
}

History.prototype.__proto__ = Event.prototype;

History.prototype.toJSON = function () {
  return {
    log: this.log.map(commit => (commit ? {
      ...commit,
      editor: commit.editor.id,
      undo: {
        ...commit.undo,
        editor: commit.undo.editor.id
      },
      redo: {
        ...commit.redo,
        editor: commit.redo.editor.id
      }
    } : commit)),
    needle: this.needle,
    lastNeedle: this.lastNeedle
  }
};
//
History.prototype.setEditor = function (editor) {
  if (this.editor !== editor) {
    this.actuallySave(true);
  }
  this.editor = editor;
};

History.prototype.save = function (force) {
  if (this.lastNeedle === this.needle) {
    this.needle++;
    this.emit('save');
    this.saveMeta();
  }
  if (Date.now() - this.timeStart > 2000 || force) {
    this.actuallySave();
  }
  this.timeout = this.debouncedSave();
};

History.prototype.actuallySave = function (noEmit) {
  clearTimeout(this.timeout);
  this.didSave = false;
  if (this.editor.buffer.log.length) {
    this.didSave = true;
    this.log = this.log.slice(0, this.lastNeedle);
    this.log.push(this.commit());

    this.needle = ++this.lastNeedle;
    this.saveMeta();
    if (!noEmit) {
      this.emit('save');
      this.emit('change', this.editor);
    }
  } else {
    this.saveMeta();
  }
  this.timeStart = Date.now();
  this.timeout = false;
};

History.prototype.undo = function (needle) {
  if (this.timeout !== false) this.actuallySave(true);

  if (needle < 1) return

  this.lastNeedle = this.needle = needle;
  return this.checkout('undo', needle)
};

History.prototype.redo = function (needle) {
  if (this.timeout !== false) this.actuallySave(true);

  if (needle < 1) return

  this.lastNeedle = this.needle = Math.min(needle, this.log.length);
  return this.checkout('redo', needle - 1)
};

History.prototype.checkout = function (type, n) {
  let commit = this.log[n];
  if (!commit) return

  let log = commit.log;
  commit = this.log[n][type];
  commit.editor.markActive = commit.markActive;
  commit.editor.mark.set(commit.mark.copy());
  commit.editor.setCaret(commit.caret.copy());

  log = 'undo' === type
    ? log.slice().reverse()
    : log.slice();

  log.forEach(item => {
    var action = item[0];
    var offsets = item[1];
    var text = item[2];
    switch (action) {
      case 'insert':
        if ('undo' === type) {
          commit.editor.buffer.remove(offsets, true);
        } else {
          commit.editor.buffer.insert(commit.editor.buffer.getOffsetPoint(offsets[0]), text, true);
        }
        break
      case 'remove':
        if ('undo' === type) {
          commit.editor.buffer.insert(commit.editor.buffer.getOffsetPoint(offsets[0]), text, true);
        } else {
          commit.editor.buffer.remove(offsets, true);
        }
        break
    }
  });

  if (this.didSave) {
    this.emit('save');
    this.didSave = false;
  }
  this.emit('change', commit.editor);

  return commit.editor
};

History.prototype.commit = function () {
  var editor = this.meta.editor;
  var log = editor.buffer.log;
  editor.buffer.log = [];
  return {
    editor,
    log: log,
    undo: this.meta,
    redo: {
      editor: editor,
      caret: editor.caret.pos.copy(),
      mark: editor.mark.copy(),
      markActive: editor.markActive
    }
  }
};

History.prototype.saveMeta = function () {
  this.meta = {
    editor: this.editor,
    caret: this.editor.caret.pos.copy(),
    mark: this.editor.mark.copy(),
    markActive: this.editor.markActive
  };
};

var R = Regexp.create;

var NewLine = R(['newline'], 'g');

//NOTE: order matters
var syntax = Regexp.join([
  'newline',
  'comment',
  ['number', R(['special', 'number'], '')],
  'operator',
  'symbol',
  // 'params',
  'attribute',
  // 'keyword',
  ['variable', R(['variable','call'], '')],
  'keyword',
  // ['keyword', R(['operator'])],
  // 'string',
  'definition',
], 'gm');

var Indent = {
  regexp: R(['indent'], 'gm'),
  replacer: (s) => s.replace(/ {1,2}|\t/g, '<x>$&</x>')
};

var AnyChar = /\S/g;

var Blocks = Regexp.join([
  'comment',
  // 'string',
  // ['definition', R(['arguments']), '^'],
  ['property', R(['declare'])],
  ['keyword', R(['keyword'])],
  ['string', R(['string'])],
  // 'regexp',
], 'gm');

function Syntax(o) {
  o = o || {};
  this.tab = o.tab || '\t';
  this.blocks = [];
  this.blockIndex = 0;
}

Syntax.prototype.entities = entities;

Syntax.prototype.highlight = function(code, offset) {
  code += '\n`*/\n';

  // code = this.createIndents(code);
  code = this.createBlocks(code);
  // console.log(code)
  // code = entities(code);

  const pieces = [];

  let match, piece, lastPos = 0, text;
  while (match = syntax.exec(code)) {
    if (match.index > lastPos) {
      text = code.slice(lastPos, match.index);
      let blocks = this.restoreBlocks(text);
      blocks.forEach(block => {
        pieces.push([block[0], block[1], block[2] + lastPos]);
      });
    }
    piece = Object.entries(match.groups).filter(([key, value]) => value !== undefined)[0];
    piece.push(match.index);
    pieces.push(piece);
    lastPos = match.index + piece[1].length;
  }

  // code = this.restoreBlocks(code);
  // code = code.replace(Indent.regexp, Indent.replacer);
  pieces.pop();
  while (pieces.pop()[0] !== 'newline') {} // whoa
  return pieces
};

Syntax.prototype.createIndents = function(code) {
  var lines = code.split(/\n/g);
  var indent = 0;
  var match;
  var line;
  var i;

  i = lines.length;

  while (i--) {
    line = lines[i];
    AnyChar.lastIndex = 0;
    match = AnyChar.exec(line);
    if (match) indent = match.index;
    else if (indent && !line.length) {
      lines[i] = new Array(indent + 1).join(this.tab);
    }
  }

  code = lines.join('\n');

  return code;
};

Syntax.prototype.restoreBlocks = function(code) {
  var block;
  var blocks = this.blocks;
  var regexp = /\uffee/g;

  let match, lastPos = 0, text, add = 0, out = [];

  let newLineMatch, lastNewLinePos = 0;
  while (match = regexp.exec(code)) {
    if (match.index > lastPos) {
      text = code.slice(lastPos, match.index);
      if (text.length) {
        out.push(['text', text, lastPos]);
      }
      add += text.length;
    }
    block = blocks[this.blockIndex++];
    var tag = block[0];

    lastNewLinePos = 0;
    while (newLineMatch = NewLine.exec(block[1])) {
      text = block[1].slice(lastNewLinePos, newLineMatch.index);
      out.push([tag, text, lastNewLinePos + add]);
      out.push(['newline', '\n', newLineMatch.index + add]);
      lastNewLinePos = newLineMatch.index + 1;
    }

    if (!lastNewLinePos) {
      out.push([tag, block[1], match.index]);
    } else {
      out.push([tag, block[1].slice(lastNewLinePos), lastNewLinePos + add]);
    }
    add += block[1].length;
    lastPos = match.index + block[1].length;
  }

  text = code.slice(lastPos);
  if (text.length) out.push(['text', text, lastPos]);

  return out
};

Syntax.prototype.createBlocks = function(code) {
  this.blocks = [];
  this.blockIndex = 0;

  let parts = [];
  let match, piece, lastPos = 0, text;
  while (match = Blocks.exec(code)) {
    if (match.index > lastPos) {
      text = code.slice(lastPos, match.index);
      parts.push(text);
    }
    piece = Object.entries(match.groups).filter(([key, value]) => value !== undefined)[0];
    piece.push(match.index);
    this.blocks.push(piece);
    parts.push('\uffee' + ' '.repeat(piece[1].length - 1));
    lastPos = match.index + piece[1].length;
  }

  if (lastPos < code.length) parts.push(code.slice(lastPos));

  return parts.join('')

  // code = code
  //   // .replace(LongLines, (block) => {
  //   //   this.blocks.push(block);
  //   //   return '\uffec';
  //   // })
  //   .replace(Blocks, (block, a, b, c, d, e, f, g) => {
  //     console.log(block, a, b, c, d, e, f, g)
  //     this.blocks.push(block)
  //     return '\uffee' + ','.repeat(block.length - 1);
  //   });

  // return code;
};

function entities(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    ;
}

var themes = [{
  id: "dracula",
  name: "Dracula",
  highlights: {
    background: "#282a36",
    text: "#f8f8f2",
    variable: "#fff",
    attribute: "#50fa7b",
    definition: "#50fa7b",
    keyword: "#ff79c6",
    operator: "#ff79c6",
    property: "#66d9ef",
    number: "#bd93f9",
    string: "#f1fa8c",
    comment: "#6272a4",
    meta: "#f8f8f2",
    tag: "#ff79c6"
  }
}, {
  id: "duotone-light",
  name: "Duotone (Light)",
  light: true,
  highlights: {
    background: "#faf8f5",
    muted: "#e1ddd3",
    text: "#2d1f03",
    variable: "#b3985e",
    attribute: "#8c6b20",
    definition: "#738fcb",
    keyword: "#8a681c",
    operator: "#8a681c",
    property: "#b3985e",
    number: "#738fcb",
    string: "#022e8b",
    comment: "#adb1b7",
    meta: "#555",
    tag: "#2d1f03"
  }
}, {
  id: "duotone-dark",
  name: "Duotone (Dark)",
  highlights: {
    background: "#2a2734",
    text: "#afa7d4",
    variable: "#ffcc99",
    attribute: "#9a86fd",
    definition: "#eeebff",
    keyword: "#ffcc99",
    operator: "#ffad5c",
    property: "#9a86fd",
    number: "#ffcc99",
    string: "#ffb870",
    comment: "#6c6783",
    meta: "#555",
    tag: "#eeebff"
  }
}, {
  id: "material",
  name: "Material",
  highlights: {
    background: "#263238",
    text: "rgba(233, 237, 237, 1)",
    variable: "#80CBC4",
    attribute: "#FFCB6B",
    definition: "rgba(233, 237, 237, 1)",
    keyword: "rgba(199, 146, 234, 1)",
    operator: "rgba(233, 237, 237, 1)",
    property: "#80CBAE",
    number: "#F77669",
    string: "#C3E88D",
    comment: "#546E7A",
    meta: "#80CBC4",
    tag: "rgba(255, 83, 112, 1)"
  }
}, {
  id: "monokai",
  name: "Monokai",
  highlights: {
    background: "#272822",
    text: "#f8f8f2",
    variable: "#70f2f2",
    attribute: "#a6e22e",
    definition: "#fd971f",
    keyword: "#f92672",
    operator: "#fff",
    property: "#a6e22e",
    number: "#ae81ff",
    string: "#e6db74",
    comment: "#75715e",
    meta: "#555",
    tag: "#bc6283"
  }
}, {
  id: "wavepot",
  name: "Wavepot",
  highlights: {
    background: "#000", //"#151515", //"#292923",
    text: "#f0ffff", //"#f7f7f3",
    variable: "#8398d6",
    attribute: "#f2f2f2", //"#95e124",
    definition: "#616279", //"#ffa910", //ff372f",
    keyword: "#ff391f",
    operator: "#f40", //"#13bcff",
    property: "#ff391f", //"#a2a2af",
    // number: "#95e124", //"#fff", //"#f2e700", //"#fff", //"#ff69fe",
    number: '#00afff', // "#13bcff", //"#0f0", //"#ff69fe",
    string: "#f2e700",
    comment: "#6761b4",
    symbol: '#06f',// '#626288', //, '#6262f2',
    meta: "#555",
    tag: "#bc6283",
    gutter: 'rgba(0,0,0,.7)', //transparent',
    caret: '#fff',
    titlebar: '#000', //rgba(0,0,50,.2)', //'#303030',
    title: '#fff',
    scrollbar: 'rgba(120,120,255,.17)', //', //'#3f30af',
    lineNumbers: '#494183'
  }
// }, {
//   id: "wavepot",
//   name: "Wavepot",
//   highlights: {
//     background: "#222229", //"#292923",
//     text: "#e1dba9", //"#f7f7f3",
//     variable: "#41baff",
//     attribute: "#f2f2f2", //"#95e124",
//     definition: "#717279", //"#ffa910", //ff372f",
//     keyword: "#ff4831",
//     operator: "#fff",
//     property: "#ffa910", //"#a2a2af",
//     // number: "#95e124", //"#fff", //"#f2e700", //"#fff", //"#ff69fe",
//     number: "#a2a2b2", //"#ff69fe",
//     string: "#bf828a",// "#ff69fe", //"#f2e700",
//     comment: "#75612e",
//     meta: "#555",
//     tag: "#bc6283"
//   }
// }, {
//   id: "wavepot",
//   name: "Wavepot",
//   highlights: {
//     background: "#272723",
//     text: "#f2f2f2", //"#f7f7f3",
//     variable: "#33aaff",
//     attribute: "#e4e480",
//     definition: "#ff2a2f",
//     keyword: "#ff2a2f",
//     operator: "#fff",
//     property: "#a6e22e",
//     number: "#e38bbb",
//     string: "#e38bbb",
//     comment: "#75715e",
//     meta: "#555",
//     tag: "#bc6283"
//   }
}, {
  id: "night-owl",
  name: "Night Owl",
  highlights: {
    background: "#011627",
    text: "#abb2bf",
    variable: "#82AAFF",
    attribute: "#F78C6C",
    definition: "#82AAFF",
    keyword: "#c792ea",
    operator: "#c792ea",
    property: "#fff",
    number: "#F78C6C",
    string: "#ecc48d",
    comment: "#5c6370",
    meta: "#7fdbca",
    tag: "#7fdbca"
  }
}, {
  id: "nord",
  name: "Nord",
  highlights: {
    background: "#2e3440",
    text: "#d8dee9",
    variable: "#88C0D0",
    attribute: "#8FBCBB",
    definition: "#D8DEE9",
    keyword: "#81A1C1",
    operator: "#81A1C1",
    property: "#D8DEE9",
    number: "#B48EAD",
    string: "#A3BE8C",
    comment: "#4C566A",
    meta: "#81A1C1",
    tag: "#81A1C1"
  }
}, {
  id: "one-light",
  name: "One Light",
  light: true,
  highlights: {
    background: "#fafafa",
    muted: "#dbdbdc",
    text: "#383a42",
    variable: "#e06c75",
    attribute: "#d19a66",
    definition: "#4078f2",
    keyword: "#a626a4",
    operator: "#0184bc",
    property: "#4078f2",
    number: "#986801",
    string: "#50a14f",
    comment: "#a0a1a7",
    meta: "#383a42",
    tag: "#e45649"
  }
}, {
  id: "one-dark",
  name: "One Dark",
  highlights: {
    background: "#282c34",
    text: "#abb2bf",
    variable: "#e06c75",
    attribute: "#d19a66",
    definition: "#e5c07b",
    keyword: "#c678dd",
    operator: "#56b6c2",
    property: "#56b6c2",
    number: "#d19a66",
    string: "#98c379",
    comment: "#5c6370",
    meta: "#abb2bf",
    tag: "#e06c75"
  }
}, {
  id: "solarized-dark",
  name: "Solarized (Dark)",
  link: "solarized",
  highlights: {
    background: "#002b36",
    text: "#839496",
    variable: "#b58900",
    attribute: "#2aa198",
    definition: "#2aa198",
    keyword: "#cb4b16",
    operator: "#6c71c4",
    property: "#2aa198",
    number: "#d33682",
    string: "#859900",
    comment: "#586e75",
    meta: "#859900",
    tag: "#93a1a1"
  }
}, {
  id: "solarized-light",
  name: "Solarized (Light)",
  link: "solarized",
  light: true,
  highlights: {
    background: "#fdf6e3",
    muted: "#eee8d5",
    text: "#073642",
    variable: "#839496",
    attribute: "#2aa198",
    definition: "#2aa198",
    keyword: "#cb4b16",
    operator: "#6c71c4",
    property: "#2aa198",
    number: "#d33682",
    string: "#859900",
    comment: "#586e75",
    meta: "#859900",
    tag: "#93a1a1"
  }
}, {
  id: "vscode",
  name: "VSCode",
  highlights: {
    background: "#1E1E1E",
    text: "#D4D4D4",
    variable: "#9CDCFE",
    attribute: "#d19a66",
    definition: "#DCDCAA",
    keyword: "#C586C0",
    operator: "#D4D4D4",
    property: "#DCDCAA",
    number: "#B5CEA8",
    string: "#CE9178",
    comment: "#6A9955",
    meta: "#D4D4D4",
    tag: "#569cd6"
  }
}, {
  id: "winter-light",
  name: "Winter Is Coming (Light)",
  light: true,
  highlights: {
    background: "#fff",
    text: "#012339",
    variable: "#2f86d2",
    attribute: "#a44185",
    definition: "#367b42",
    keyword: "#236ebf",
    operator: "#a44185",
    property: "#367b42",
    number: "#174781",
    string: "#a44185",
    comment: "#174781",
    meta: "#555",
    tag: "#a44185",
    muted: "#e0ecf1"
  }
}, {
  id: "winter-dark",
  name: "Winter Is Coming (Dark)",
  highlights: {
    background: "#001627",
    text: "#d5deeb",
    variable: "#87aff3",
    attribute: "#c792eb",
    definition: "#87aff3",
    keyword: "#00bff8",
    operator: "#00bff8",
    property: "#7fdbca",
    number: "#8cec94",
    string: "#bdf0c0",
    comment: "#999",
    meta: "#555",
    tag: "#bf3cca"
  }
}].reduce((p, n) => {
  p[n.id] = n;
  return p
}, {});

const isWorker = typeof window === 'undefined' && typeof postMessage !== 'undefined';

const colors = {
  background: '#000',
  text: '#fff',
  mark: '#43b',
  caret: '#f4f4f4',
  gutter: '#333',
  scrollbar: '#555',
  lineNumbers: '#888',
  titlebar: '#000',
  title: '#557',
};

const theme = {
  ...colors,
  ...themes['wavepot'].highlights
};

const Open = {
  '{': 'curly',
  '[': 'square',
  '(': 'parens'
};

const Close = {
  '}': 'curly',
  ']': 'square',
  ')': 'parens'
};
const NONSPACE = /[^\s]/g;
const WORD$1 = /[\s]{2,}|[./\\\(\)"'\-:,.;<>~!@#$%^&*\|\+=\[\]{}`~\?\b ]{1}/g;
const parse = (regexp, text) => {
  regexp.lastIndex = 0;
  let word;
  const words = [];
  while (word = regexp.exec(text)) words.push(word);
  return words
};

const NEWLINE$1 = Regexp.create(['newline']);
const WORDS$1 = Regexp.create(['words'], 'g');

class PseudoWorker {
  constructor () {
    this.editor = new Editor();
    this.editor.postMessage = data => this.onmessage({ data });
    setTimeout(() => {
      this.onmessage({ data: { call: 'onready' } });
    });
  }

  postMessage (data) {
    this.editor[data.call](data);
  }
}

class Editor {
  constructor (data = {}) {
    this.postMessage = self?.postMessage.bind(self);
    this.id = data.id ?? (Math.random() * 10e6 | 0).toString(36);
    this.title = data.title ?? 'untitled';
    this.value = data.value;
    this.fontSize = data.fontSize ?? '8.4pt';
    this.pos = new Point;
    this.block = new Area;
    this.scroll = { pos: new Point, target: new Point };
    this.offsetTop = 0;
    this.subEditors = [];
    this.controlEditor = this;
    this.focusedEditor = null;
    this.buffer = new Buffer;
    this.syntax = new Syntax;
    this.drawSync = this.drawSync.bind(this);
    this.highlightBlock = this.highlightBlock.bind(this);
    // this.scrollAnim = { speed: 165, isRunning: false, animFrame: null }
    // this.scrollAnim.threshold = { tiny: 9, near: .35, mid: 1.9, far: 1 }
    // this.scrollAnim.scale = { tiny: .296, near: .42, mid: .815, far: 2.85 }
    this.scrollAnim = { speed: 166, isRunning: false, animFrame: null };
    this.scrollAnim.threshold = { tiny: 21, near: .29, mid: 1.9, far: 1 };
    this.scrollAnim.scale = { tiny: .425, near: .71, mid: .802, far: 2.65 };
    this.animScrollStart = this.animScrollStart.bind(this);
    this.animScrollTick = this.animScrollTick.bind(this);

    // uncomment below for verbose debugging
    // this.verboseDebug()
  }

  verboseDebug () {
    Object.getOwnPropertyNames(this.constructor.prototype)
      .forEach(key => {
        const method = this[key];
        const err = {};
        this[key] = (...args) => {
          Error.captureStackTrace(err);
          const parts = err.stack.split('\n').slice(0, 3).pop().trim().split(' ');
          console.log((key + `(${JSON.stringify(args[0] ?? '')})`).padEnd(30), parts[1]?.padEnd(20), parts[2]?.split(':')?.slice(-2)[0]);
          return method.call(this, ...args)
        };
      });
  }

  update () {
    this.postMessage({
      call: 'onupdate',
      ...this.controlEditor.focusedEditor.toJSON()
    });
  }

  toJSON () {
    return {
      controlEditor: { id: this.controlEditor.id },
      id: this.id,
      title: this.title,
      value: this.buffer.toString(),
    }
  }

  async setup (data, controlEditor) {
    const { pos, pixelRatio } = data;
    const { width, height } = data.outerCanvas;

    this.id = data.id ?? this.id;
    this.title = data.title ?? this.title;
    this.extraTitle = data.extraTitle ?? '';
    this.value = data.value ?? this.value;
    this.font = data.font;
    this.fontSize = data.fontSize ?? this.fontSize;
    this.autoResize = data.autoResize ?? this.autoResize;

    this.controlEditor = controlEditor ?? this.controlEditor;
    this.isSubEditor = !!this.controlEditor && this.controlEditor !== this;
    this.isLastEditor = true;

    this.buffer.on('update', () => {
      this.controlEditor.history.setEditor(this);
      this.controlEditor.history.save();
      this.updateText();
    });
    this.buffer.on('before update', () => {
      this.controlEditor.history.setEditor(this);
      this.controlEditor.history.save();
      this.updateText();
    });

    this.pos = pos;

    if (!controlEditor) {
      const fontFace = new FontFace(
        'mono',
        `local('mono'),
         url('${this.font}') format('woff2')`,
      );
      if (isWorker) {
        self.fonts.add(fontFace);
      } else {
        document.fonts.add(fontFace);
      }
      await fontFace.load();
    }

    this.canvas = { pos, width, height, pixelRatio, padding: data.padding ?? 3 };
    this.canvas.outer = this.canvas.outerCanvas = data.outerCanvas;
    this.canvas.gutter = new OffscreenCanvas(width, height);
    this.canvas.title = new OffscreenCanvas(width, height);
    this.canvas.mark = new OffscreenCanvas(width, height);
    this.canvas.back = new OffscreenCanvas(width, height);
    this.canvas.text = new OffscreenCanvas(width, height);
    this.canvas.debug = new OffscreenCanvas(width, height);
    this.canvas.scroll = { width: this.canvas.width, height: this.canvas.height };

    this.ctx = {};
    this.ctx.outer = this.canvas.outer.getContext('2d');
    this.ctx.gutter = this.canvas.gutter.getContext('2d');
    this.ctx.title = this.canvas.title.getContext('2d');
    this.ctx.mark = this.canvas.mark.getContext('2d');
    this.ctx.back = this.canvas.back.getContext('2d');
    this.ctx.text = this.canvas.text.getContext('2d');
    this.ctx.debug = this.canvas.debug.getContext('2d');
    // this.ctx.debug.scale(this.canvas.pixelRatio, this.canvas.pixelRatio)

    this.key = null;
    this.keys = new Set;

    this.applyFont(this.ctx.text);
    this.char = {};
    this.char.offsetTop = .5;
    this.char.metrics = this.ctx.text.measureText('M');
    this.char.width = this.char.metrics.width;
    this.char.height =
      (this.char.metrics.actualBoundingBoxDescent
      - this.char.metrics.actualBoundingBoxAscent)
      * 1.15; //.96 //1.68
    // this.char.metrics.emHeightDescent
    this.gutter = { padding: 7, width: 0, height: 0 };

    this.line = { padding: 3 };
    this.line.height = this.char.height + this.line.padding;

    this.char.px = {
      width: this.char.width * this.canvas.pixelRatio,
      height: this.line.height * this.canvas.pixelRatio
    };

    this.padding = { width: 0, height: this.char.px.height };

    this.sizes = { loc: -1, longestLineLength: -1 };

    this.hasFocus = false;

    this.tabSize = 2;

    this.titlebar = { height: data.titlebarHeight ??  this.char.px.height + 2.5 };
    this.canvas.title.height = Math.max(1, this.titlebar.height);

    this.scrollbar = { width: 6 };
    this.scrollbar.margin = Math.ceil(this.scrollbar.width / 2);
    this.scrollbar.view = { width: 0, height: this.canvas.height - this.titlebar.height };
    this.scrollbar.area = { width: 0, height: 0 };
    this.scrollbar.scale = { width: 0, height: 0 };

    this.view = {
      left: 0,
      top: this.titlebar.height,
      width: this.canvas.width,
      height: this.canvas.height - this.titlebar.height
    };

    this.page = {};
    this.page.lines = Math.floor(this.view.height / this.char.px.height);
    this.page.height = this.page.lines * this.char.px.height;

    this.caret = {
      pos: new Point,
      px: new Point,
      align: 0,
      width: 1,
      height: this.line.height + this.line.padding / 2 + 2
    };

    this.markActive = false;
    this.mark = new Area({
      begin: new Point({ x: -1, y: -1 }),
      end: new Point({ x: -1, y: -1 })
    });

    if (!this.isSubEditor) {
      this.history = new History(this);
      this.history.on('save', () => {
        // this.postMessage({
        //   call: 'onhistory',
        //   ...this.history.toJSON()
        // })
      });
      this.history.on('change', editor => {
        this.postMessage({
          call: 'onchange',
          ...editor.toJSON()
        });
      });
    }

    // this.title = this.title || 'drawText'
    // this.setText('')
    // this.setText('/*""*/\n//hello\nfoo(\'hello\').indexOf(\'\\t\') // foo\nhi"hello"\n// yo')
    // this.setText(this[this.title].toString()) //getPointTabs.toString()) // + this.setup.toString())
    if (this.value) {
      this.buffer.setText(this.value);
      this.updateSizes();
      this.updateText();
    } else {
      this.updateSizes();
    }
    this.setCaret({ x: 0, y: 0 });
    // this.mark.set({ begin: { x: 5, y: 6 }, end: { x: 5, y: 10 }})
    // this.markActive = true
    // this.updateMark()
    this.draw();
    // setTimeout(() => this.scrollBy(0, -6400), 10)
    // setTimeout(() => this.scrollBy(0, -27400), 10)
    // if (!this.isSubEditor && data.withSubs) {
    //   // const second = new Editor()
    //   await this.addSubEditor(new Editor('erase'))
    //   await this.addSubEditor(new Editor('addSubEditor'))
    //   await this.addSubEditor(new Editor('insert'))
    //   await this.addSubEditor(new Editor('moveByChars'))
    //   await this.addSubEditor(new Editor('onmousedown'))
    //   // this.onfocus()
    //   this.draw()
    // } else {
    //   this.draw()
    // }
    if (!controlEditor) this.postMessage({ call: 'onsetup' });
  }

  async addSubEditor (data) {
    const editor = new Editor(data);
    this.isLastEditor = false;
    this.subEditors.forEach(editor => {
      editor.isLastEditor = false;
      editor.updateSizes(true);
      editor.updateText();
    });
    await editor.setup({
      ...data,
      outerCanvas: this.canvas.outer,
      pixelRatio: this.canvas.pixelRatio,
      height: 1
    }, this);
    this.subEditors.push(editor);
    this.updateSizes(true);
    this.updateText();
    this.draw();
    this.postMessage({ ...editor.toJSON(), call: 'onadd' });
  }

  setTitle (title) {
    this.title = title;
    this.updateTitle();
    this.updateSizes(true);
    this.updateText();
    this.draw();
  }

  deleteEditor ({ id }) {
    let data;
    if (id === this.id) {
      data = this.toJSON();
      if (this.subEditors.length) {
        const editor = this.subEditors.shift();
        this.id = editor.id;
        this.title = editor.title;
        this.setText(editor.value);
      } else {
        data = null;
        this.setText('');
      }
    } else {
      const subEditor = data = this.subEditors
        .find(editor => editor.id === id);
      this.subEditors.splice(this.subEditors.indexOf(subEditor), 1);
      data = data.toJSON();
    }
    this.updateSizes(true);
    this.updateText();
    this.draw();
    if (data) this.postMessage({ ...data, call: 'onremove' });
  }

  renameEditor ({ id, title }) {
    let data, prevTitle;
    if (id === this.id) {
      prevTitle = this.title;
      this.title = title;
      this.updateTitle();
      data = this.toJSON();
    } else {
      const subEditor = this.subEditors
        .find(editor => editor.id === id);
      prevTitle = subEditor.title;
      subEditor.title = title;
      subEditor.updateTitle();
      data = subEditor.toJSON();
    }
    this.updateSizes(true);
    this.updateText();
    this.draw();
    if (data) this.postMessage({ ...data, prevTitle, call: 'onrename' });
  }

  restoreHistory (history) {
    const editors = {};
    editors[this.id] = this;
    this.subEditors.forEach(editor => {
      editors[editor.id] = editor;
    });
    history.log.forEach(item => {
      if (item) {
        item.editor = editors[item.editor];

        item.undo.editor = editors[item.undo.editor];
        item.undo.caret = new Point(item.undo.caret);
        item.undo.mark = new Area(item.undo.mark);

        item.redo.editor = editors[item.redo.editor];
        item.redo.caret = new Point(item.redo.caret);
        item.redo.mark = new Area(item.redo.mark);
      }
    });
    this.history.log = history.log;
    this.history.needle = history.needle;
    this.history.lastNeedle = history.lastNeedle;
  }

  setFile (file) {
    this.id = file.id;
    this.title = file.title;
    this.setText(file.value);
    this.postMessage({
      call: 'onchange',
      ...this.toJSON()
    });
  }

  erase (moveByChars = 0) {
    if (this.markActive && !this.mark.isEmpty()) {
      this.controlEditor.history.setEditor(this);
      this.controlEditor.history.save(true);
      const area = this.mark.get();
      this.moveCaret(area.begin);
      this.buffer.removeArea(area);
      this.markClear(true);
    } else {
      this.markClear(true);
      this.controlEditor.history.setEditor(this);
      this.controlEditor.history.save();
      if (moveByChars) this.moveByChars(moveByChars);
      // const left = line[this.caret.pos.x]
      // let line = this.buffer.getLineText(this.caret.pos.y)
      // const hasLeftSymbol = ['{','[','(','\'','"','`'].includes(left)
      this.buffer.removeCharAtPoint(this.caret.pos);
      // line = this.buffer.getLineText(this.caret.pos.y)
      // const right = line[this.caret.pos.x]
      // const hasRightSymbol = ['\'','"','`','}',']',')'].includes(right)
      // if (hasLeftSymbol && hasRightSymbol) this.buffer.removeCharAtPoint(this.caret.pos)
    }

    this.updateSizes();
    this.updateText();
    this.keepCaretInView('ease', false);
    this.draw();
  }

  align () {
    this.caret.align = this.caret.pos.x;
  }

  delete () {
    if (this.isEndOfFile()) {
      if (this.markActive && !this.isBeginOfFile()) return this.backspace()
      return
    }
    this.erase();
  }

  backspace () {
    if (this.isBeginOfFile()) {
      if (this.markActive && !this.isEndOfFile()) return this.delete()
      return
    }
    this.erase(-1);
  }

  insert (text, noRules = false) {
    if (this.markActive && !this.mark.isEmpty()) this.delete();
    this.markClear();
    // this.emit('input', text, this.caret.copy(), this.mark.copy(), this.mark.active);

    const matchSymbol = {
      '\'': '\'',
      '"': '"',
      '`': '`',
      '(': ')',
      '[': ']',
      '{': '}',
      ')': '(',
      ']': '[',
      '}': '{',
    };

    const line = this.buffer.getLineText(this.caret.pos.y);
    const right = line[this.caret.pos.x];
    let left = line[this.caret.pos.x - 1];
    const hasRightSymbol = ['\'','"','`','}',']',')'].includes(right);
    let hasMatchSymbol = hasRightSymbol && (text === right && matchSymbol[left] === right);

    let indent = 0;
    let hasLeftSymbol;

    // apply indent on enter
    if (!noRules && NEWLINE$1.test(text)) {
      left = line.slice(0, this.caret.pos.x).trim().slice(-1);
      const isEndOfLine = this.caret.pos.x >= line.trim().length - 1;
      hasLeftSymbol = ['{','[','('].includes(left);
      indent = line.match(/\S/)?.index ?? (line.length || 1) - 1;
      const isBeforeIndent = this.caret.pos.x < indent;

      if (hasLeftSymbol) indent += 2;

      // if (isEndOfLine || hasLeftSymbol) {
      if (!isBeforeIndent) {
        text += ' '.repeat(indent);
      }
      // }
    }

    if (!noRules) {
      if (hasLeftSymbol && hasRightSymbol) {
        this.buffer.insert(this.caret.pos, '\n' + ' '.repeat(indent - 2));
      }
    }

    let length = 1;

    if (noRules || (!(hasMatchSymbol))) {
      length = this.buffer.insert(this.caret.pos, text, null, true);
      this.updateSizes();
    }

    this.moveByChars(length);

    // if ('{' === text) this.buffer.insert(this.caret.pos, '}')
    // else if ('(' === text) this.buffer.insert(this.caret.pos, ')')
    // else if ('[' === text) this.buffer.insert(this.caret.pos, ']')
    // else if ('\'' === text) this.buffer.insert(this.caret.pos, '\'')
    // else if ('"' === text) this.buffer.insert(this.caret.pos, '"')
    // else if ('`' === text) this.buffer.insert(this.caret.pos, '`')

    this.updateSizes();
    this.updateText();
    this.keepCaretInView();
    this.draw();
  }

  markBegin (area) {
    if (!this.markActive) {
      this.markActive = true;
      if (area) {
        this.mark.set(area);
      } else if (area !== false || this.mark.begin.x === -1) {
        this.mark.begin.set(this.caret.pos);
        this.mark.end.set(this.caret.pos);
      }
    }
  }

  markSet () {
    if (this.markActive) {
      this.mark.end.set(this.caret.pos);
      this.updateMark();
      this.draw();
    }
  }

  markSetArea (area) {
    this.markBegin(area);
    this.updateMark();
    this.draw();
  }

  markClear (force) {
    if (this.keys.has('Shift') && !force || !this.markActive) return

    this.postMessage({ call: 'onselection', text: '' });

    this.markActive = false;
    this.mark.set({
      begin: new Point({ x: -1, y: -1 }),
      end: new Point({ x: -1, y: -1 })
    });
    this.draw();
  }

  getPointTabs ({ x, y }) {
    const line = this.buffer.getLineText(y);
    let remainder = 0;
    let tabs = 0;
    let tab;
    let prev = 0;
    while (~(tab = line.indexOf('\t', tab + 1))) {
      if (tab >= x) break
      remainder += (tab - prev) % this.tabSize;
      tabs++;
      prev = tab + 1;
    }
    remainder += tabs;
    return { tabs, remainder }
  }

  getCoordsTabs ({ x, y }) {
    const line = this.buffer.getLineText(y);

    const { tabSize } = this;

    let displayIndex = 0;
    let i = 0;
    for (i = 0; i < line.length; i++) {
      if (displayIndex >= x) break
      if (line[i] === '\t') displayIndex += tabSize;
      else displayIndex += 1;
    }

    return i
  }

  highlightBlock () {
    this.block.begin.set({ x: -1, y: -1 });
    this.block.end.set({ x: -1, y: -1 });

    const offset = this.buffer.getPoint(this.caret.pos).offset;

    const result = this.buffer.tokens.getByOffset('blocks', offset);
    if (!result) return

    const length = this.buffer.tokens.getCollection('blocks').length;

    let char = this.buffer.charAt(result);

    let open;
    let close;

    let i = result.index;
    let openOffset = result.offset;
    if (i === 0 && offset < openOffset) return

    char = this.buffer.charAt(openOffset);

    let count = openOffset >= offset - 1 && Close[char] ? 0 : 1;

    let limit = 200;

    while (i >= 0) {
      open = Open[char];
      if (Close[char]) count++;
      if (!--limit) return

      if (open && !--count) break

      openOffset = this.buffer.tokens.getByIndex('blocks', --i);
      char = this.buffer.charAt(openOffset);
    }

    if (count) return

    count = 1;

    let closeOffset;

    while (i < length - 1) {
      closeOffset = this.buffer.tokens.getByIndex('blocks', ++i);
      char = this.buffer.charAt(closeOffset);
      if (!--limit) return

      close = Close[char];
      if (Open[char] === open) count++;
      if (open === close) count--;

      if (!count) break
    }

    if (count) return

    var begin = this.buffer.getOffsetPoint(openOffset);
    var end = this.buffer.getOffsetPoint(closeOffset);

    this.block.begin.set(this.getCharPxFromPoint(begin));
    this.block.end.set(this.getCharPxFromPoint(end));
  }

  moveByWords (dx) {
    let { x, y } = this.caret.pos;
    const line = this.buffer.getLineText(y);

    if (dx > 0 && x >= line.length - 1) { // at end of line
      return this.moveByChars(+1) // move one char right
    } else if (dx < 0 && x === 0) { // at begin of line
      return this.moveByChars(-1) // move one char left
    }

    let words = parse(WORD$1, dx > 0 ? line : [...line].reverse().join``);
    let word;

    if (dx < 0) x = line.length - x;

    for (let i = 0; i < words.length; i++) {
      word = words[i];
      if (word.index > x) {
        x = dx > 0 ? word.index : line.length - word.index;
        // this.caret.align = x
        return this.moveCaret({ x, y })
      }
    }

    // reached begin/end of file
    return dx > 0
      ? this.moveEndOfLine()
      : this.moveBeginOfLine()
  }

  moveByChars (dx) {
    let { x, y } = this.caret.pos;

    if (dx < 0) { // going left
      x += dx; // move left
      if (x < 0) { // when past left edge
        if (y > 0) { // and lines above
          y -= 1; // move up a line
          x = this.buffer.getLineLength(y); // and go to the end of line
        } else {
          x = 0;
        }
      }
    } else if (dx > 0) { // going right
      x += dx; // move right
      while (x - this.buffer.getLineLength(y) > 0) { // while past line length
        if (y === this.sizes.loc) { // on end of file
          x = this.buffer.getLineLength(y); // go to end of line on last line
          break // and exit
        }
        x -= this.buffer.getLineLength(y) + 1; // wrap this line length
        y += 1; // and move down a line
      }
    }

    this.caret.align = x;
    return this.moveCaret({ x, y })
  }

  moveByLines (dy) {
    let { x, y } = this.caret.pos;

    if (dy < 0) { // going up
      if (y + dy > 0) { // when lines above
        y += dy; // move up
      } else {
        if (y === 0) { // if already at top line
          x = 0; // move caret to begin of line
          return this.moveCaret({ x, y })
        }
        y = 0;
      }
    } else if (dy > 0) { // going down
      if (y < this.sizes.loc - dy) { // when lines below
        y += dy; // move down
      } else {
        if (y === this.sizes.loc) { // if already at bottom line
          x = this.buffer.getLineLength(y); // move caret to end of line
          return this.moveCaret({ x, y })
        }
        y = this.sizes.loc;
      }
    }

    x = Math.min(this.caret.align, this.buffer.getLineLength(y));
    return this.moveCaret({ x, y })
  }

  moveBeginOfLine ({ isHomeKey = false } = {}) {
    const y = this.caret.pos.y;
    let x = 0;
    if (isHomeKey) { // home key oscillates begin of visible text and begin of line
      const lineText = this.buffer.getLineText(y);
      NONSPACE.lastIndex = 0;
      x = NONSPACE.exec(lineText)?.index ?? 0;
      if (x === this.caret.pos.x) x = 0;
    }
    this.caret.align = x;
    return this.moveCaret({ x, y })
  }

  moveEndOfLine () {
    const y = this.caret.pos.y;
    const x = this.buffer.getLine(y).length;
    this.caret.align = Infinity;
    return this.moveCaret({ x, y })
  }

  moveBeginOfFile () {
    this.caret.align = 0;
    return this.moveCaret({ x: 0, y: 0 })
  }

  moveEndOfFile () {
    const y = this.sizes.loc;
    const x = this.buffer.getLine(y).length;
    this.caret.align = x;
    return this.moveCaret({ x, y })
  }

  isBeginOfFile () {
    return this.caret.pos.x === 0 && this.caret.pos.y === 0
  }

  isEndOfFile () {
    const { x, y } = this.caret.pos;
    const last = this.sizes.loc;
    return y === last && x === this.buffer.getLineLength(last)
  }

  isBeginOfLine () {
    return this.caret.pos.x === 0
  }

  isEndOfLine () {
    return this.caret.pos.x === this.buffer.getLineLength(this.caret.pos.y)
  }

  moveCaret ({ x, y }) {
    return this.setCaret({ x, y })
  }

  scrollIntoView (target) {

  }

  getCaretPxDiff (centered = false) {
    let editor = this.controlEditor.focusedEditor;
    if (!editor) {
      this.controlEditor.setFocusedEditor(this);
      editor = this;
    }

    let left = this.canvas.gutter.width;
    let top = this.titlebar.height;
    let right = (left + (this.view.width - this.scrollbar.width - this.char.px.width));
    let bottom = this.view.height - this.char.px.height;

    // if (centered) {
    //   left = right / 2
    //   right = right / 2
    //   top = bottom / 2
    //   bottom = bottom / 2
    // }
    // this.controlEditor.ctx.debug.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // this.controlEditor.ctx.debug.fillStyle = 'rgba(255,0,0,.5)'
    // this.controlEditor.ctx.debug.fillRect(left, top, right-left, bottom-top)
    // this.drawSync()

    const x = (editor.caret.px.x * this.canvas.pixelRatio + this.canvas.gutter.width - this.scroll.pos.x);
    const y = (editor.caret.px.y * this.canvas.pixelRatio + this.titlebar.height + editor.offsetTop - editor.scroll.pos.y);

    let dx = Math.floor(
      x < left ? left - x
    : x
    > right
    ? right - x
    : 0);

    let dy = Math.floor(
      y < top ? top - y
    : y
    > bottom
    ? bottom - y
    : 0);

    if (dx !== 0 && centered) {
      left = right / 2;
      right = right / 2;
      dx =
        x < left ? left - x
      : x
      > right
      ? right - x
      : 0;
    }

    if (dy !== 0 && centered) {
      top = bottom / 2;
      bottom = bottom / 2;
      dy =
        y < top ? top - y
      : y
      > bottom
      ? bottom - y
      : 0;
    }

    return new Point({ x: dx, y: dy })
  }

  getCharPxFromPoint (point) {
    const { tabs } = this.getPointTabs(point);
    return new Point({
      x: this.char.width * (
        (point.x - tabs)
      + (tabs * this.tabSize))
      + this.gutter.padding,
      y: this.line.height
      * point.y
      + this.canvas.padding
      - this.line.padding
    })
  }

  setCaret (pos) {
    const prevCaretPos = this.caret.pos.copy();
    this.caret.pos.set(Point.low({ x:0, y:0 }, pos));
    const px = this.getCharPxFromPoint(this.caret.pos);
    const { tabs } = this.getPointTabs(this.caret.pos);
    this.caret.px.set({
      x: px.x,
      y: px.y
    });
    queueMicrotask(this.highlightBlock);
    return prevCaretPos.minus(this.caret.pos)
  }

  setCaretByMouse ({ clientX, clientY }) {
    const y = Math.max(
      0,
      Math.min(
        this.sizes.loc,
        Math.floor(
          (clientY - (
          - this.scroll.pos.y / this.canvas.pixelRatio
          + this.offsetTop / this.canvas.pixelRatio
          + this.canvas.padding
          + this.titlebar.height / this.canvas.pixelRatio
          ))
        / this.line.height
        )
      )
    );

    let x = Math.max(
      0,
      Math.round(
        (clientX - (-this.scroll.pos.x + this.canvas.gutter.width + this.gutter.padding) / this.canvas.pixelRatio)
      / this.char.width
      )
    );

    const actualIndex = this.getCoordsTabs({ x, y });

    x = Math.max(
      0,
      Math.min(
        actualIndex,
        this.buffer.getLineLength(y)
      )
    );

    this.caret.align = x;
    this.setCaret({ x, y });
    this.keepCaretInView();
  }

  setText (text) {
    this.buffer.setText(text);
    if (this.updateSizes()) this.updateText();
  }

  updateSizes (force = false) {
    let changed = false;

    const loc = this.buffer.loc();
    const longestLine = this.buffer.getLongestLine(true);
    const { tabs, remainder } = this.getPointTabs({ x: longestLine.length, y: longestLine.lineNumber });
    const longestLineLength = longestLine.length + tabs + remainder;

    if (loc !== this.sizes.loc || force) {
      changed = true;
      this.sizes.loc = loc;
      this.view.height = this.canvas.height;
      this.scrollbar.view.height = this.canvas.height - this.titlebar.height;

      this.gutter.size = (1 + this.sizes.loc).toString().length;
      this.gutter.width = this.gutter.size * this.char.width + this.gutter.padding;

      this.canvas.back.height =
      this.canvas.text.height =
        (this.canvas.padding * this.canvas.pixelRatio) * 2
      + ((1 + this.sizes.loc) * this.char.px.height);// line.height)
      // * this.canvas.pixelRatio

      if (!isWorker && this.autoResize && !this.isSubEditor) {
        this.view.height
          = this.canvas.height
          = this.canvas.outer.height
          = this.canvas.text.height
          + this.titlebar.height
          + this.canvas.padding * this.canvas.pixelRatio;
        this.page.lines = Math.floor(this.view.height / this.char.px.height);
        this.canvas.outer.style.height = (this.canvas.outer.height/this.canvas.pixelRatio) + 'px';
        this.postMessage({ call: 'onresize' });
      }

      this.subEditorsHeight =
        (this.subEditors.reduce((p, n) => p + n.canvas.text.height + this.titlebar.height, 0));

      this.canvas.scroll.height = Math.floor(
        this.subEditorsHeight
      + (!isWorker && this.autoResize
      ? 0
      : this.canvas.text.height)
      - (this.canvas.padding
      + this.caret.height
      - this.line.padding)
      * this.canvas.pixelRatio)
      + 4; // TODO: this shouldn't be needed

      // + (this.subEditors.length - 2)

      this.canvas.gutter.width =
        (this.gutter.width + this.canvas.padding)
      * this.canvas.pixelRatio;

      this.canvas.gutter.height = // TODO
        !this.isLastEditor
        ? this.canvas.text.height
        : this.canvas.scroll.height + this.view.height;

      this.scrollbar.view.width =
        this.canvas.width - this.canvas.gutter.width;

      this.view.left = this.canvas.gutter.width;
      this.view.width = this.canvas.width - this.canvas.gutter.width;

      this.padding.width = (
        this.gutter.width
      + this.gutter.padding
      + this.char.width
      ) * this.canvas.pixelRatio;

      this.ctx.gutter.scale(this.canvas.pixelRatio, this.canvas.pixelRatio);
      this.updateGutter();
    }

    if (longestLineLength !== this.sizes.longestLineLength || force) {
      changed = true;
      this.sizes.longestLineLength = longestLineLength;

      this.canvas.back.width =
      this.canvas.text.width = (
        this.sizes.longestLineLength
      * this.char.width
      + this.gutter.padding
      ) * this.canvas.pixelRatio;

      this.canvas.mark.width =
        this.canvas.text.width
      + this.char.px.width / 2;

      this.canvas.scroll.width =
        Math.max(
          0,
          this.canvas.text.width
        - this.canvas.width
        + this.canvas.gutter.width
        + this.char.px.width * 2
        );
    }

    if (changed) {
      this.scrollbar.area.width =
        this.canvas.text.width
      + this.char.px.width * 2;

      this.scrollbar.area.height = this.canvas.scroll.height;

      this.scrollbar.scale.width = this.scrollbar.view.width / this.scrollbar.area.width;
      this.scrollbar.scale.height = this.scrollbar.view.height / this.scrollbar.area.height;

      this.scrollbar.horiz = this.scrollbar.scale.width * this.scrollbar.view.width;
      this.scrollbar.vert = this.scrollbar.scale.height * this.scrollbar.view.height;

      this.ctx.text.scale(this.canvas.pixelRatio, this.canvas.pixelRatio);
      this.ctx.back.scale(this.canvas.pixelRatio, this.canvas.pixelRatio);

      this.canvas.title.width = this.canvas.width;
      this.updateTitle();

      if (this.isSubEditor) {
        this.controlEditor.updateSizes(true);
        this.controlEditor.updateText();
      }

      return true
    }
  }

  hasKeys (keys) {
    return keys.split(' ').every(key => this.keys.has(key))
  }

  getLineLength (line) {
    return this.buffer.getLine(line).length
  }

  alignCol (line) {
    return Math.min(this.caret.align, this.buffer.getLineLength(line))
  }

  applyFont (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = `normal ${this.fontSize} mono`;
  }

  updateGutter () {
    const { gutter } = this.ctx;

    // this.applyFont(gutter)
    gutter.textBaseline = 'top';
    gutter.font = `normal ${parseFloat(this.fontSize)+'pt'} mono`;

    gutter.fillStyle = theme.gutter;
    gutter.fillRect(0, 0, this.canvas.gutter.width, this.canvas.gutter.height);
    gutter.fillStyle = theme.lineNumbers;

    for (let i = 0, y = 0; i <= this.sizes.loc; i++) {
      y = this.canvas.padding + i * this.line.height + this.char.offsetTop;
      gutter.fillText(
        (1 + i).toString().padStart(this.gutter.size),
        this.canvas.padding,
        y
      );
    }
  }

  updateText () {
    const { text, back } = this.ctx;

    this.applyFont(text);
    back.clearRect(0, 0, this.canvas.text.width, this.canvas.text.height);
    text.clearRect(0, 0, this.canvas.text.width, this.canvas.text.height);
    text.fillStyle = theme.text;

    const code = this.buffer.toString();
    const pieces = this.syntax.highlight(code);
    const fh = this.line.height; //Math.ceil(this.line.height)
    let i = 0, x = 0, y = 0, lastNewLine = 0, idx = 0;
    // text.fillStyle = '#000'
    // for (const line of code.split('\n')) {
    //   y = this.canvas.padding + i * this.line.height

    //   for (let sx = 1; sx <= 2; sx++) {
    //     for (let sy = 1; sy <= 2; sy ++) {
    //       // text.fillText(string, x+sx, y)
    //       // text.fillText(string, x-sx, y)
    //       text.fillText(line, x+sx, y+sy)
    //       text.fillText(line, x+sx, y-sy)

    //       // text.fillText(string, x, y+sy)
    //       // text.fillText(string, x, y-sy)
    //       text.fillText(line, x-sx, y+sy)
    //       text.fillText(line, x-sx, y-sy)
    //     }
    //   }

    //   i++
    // }

    // i = 0, x = 0, y = 0, lastNewLine = 0
    const queue = [];
    for (const [type, string, index] of pieces.values()) {
      y = this.canvas.padding + i * this.line.height;

      idx = index;

      if (type === 'newline') {
        back.fillStyle = 'rgba(0,0,0,.7)';
        back.fillRect(0, y-1.5, this.char.width * (index - lastNewLine) + 8, fh);

        for (const [type, string, x, y] of queue) {
          text.fillStyle = theme[type];
          text.fillText(
            string
            .replaceAll('//', '/ /')
            .replaceAll('//', '/ /') // hack: adds a tiny space between / and / to bypass ligature
            , x, y + this.char.offsetTop);
        }
        queue.length = 0;

        lastNewLine = index + 1;

        // AnyChar.lastIndex = 0

        i++;
        continue
      }

      x = (index - lastNewLine) * this.char.width + this.gutter.padding;

      queue.push([type, string, x, y]);
      // // AnyChar.lastIndex = 0

      // text.fillStyle = 'rgba(0,0,0,.65)'
      // text.fillRect(x + (AnyChar.exec(string)?.index * this.char.width), y, this.char.width * string.trim().length, fh)

      // text.fillStyle = theme[type]
      // text.fillText(string, x, y)
    }

    if (queue.length) {
      back.fillStyle = 'rgba(0,0,0,.7)';
      back.fillRect(0, y-1.5, this.char.width * (idx - lastNewLine + queue[queue.length-1][1].length) + 8, fh);
      // text.fillRect(0, y, this.char.width * string.length + 4, fh)
      for (const [type, string, x, y] of queue) {
        text.fillStyle = theme[type];
        text.fillText(
          string
          .replaceAll('//', '/ /')
          .replaceAll('//', '/ /') // hack: adds a tiny space between / and / to bypass ligature
          , x, y);
      }
    }
  }

  updateMark () {
    const { mark } = this.ctx;
    const area = this.mark.get();
    const Y = area.begin.y;
    const { begin, end } = area.normalizeY();

    this.canvas.mark.height = (
      (1 + area.height) * this.line.height + this.line.padding
    ) * this.canvas.pixelRatio;

    if (area.isEmpty()) return

    mark.scale(this.canvas.pixelRatio, this.canvas.pixelRatio);

    mark.fillStyle = theme.mark;
    const r = this.canvas.pixelRatio;
    const xx = this.gutter.padding;
    const yy = 0; //this.canvas.padding / r / 2
    let ax = 0, bx = 0, ay = 0, by = 0;
    const drawMarkArea = ({ begin, end }, eax = 0, ebx = 0) => {
      ax = begin.x * this.char.width;
      bx = (end.x - begin.x) * this.char.width;
      ay = begin.y * this.line.height;
      by = this.line.height + .5;
      mark.fillRect(xx + ax + eax, yy + ay, bx - eax + ebx, by);
    };

    if (begin.y === end.y) {
      const { tabs: beginTabs } = this.getPointTabs({ x: begin.x, y: begin.y + Y });
      const { tabs: endTabs } = this.getPointTabs({ x: end.x, y: end.y + Y });
      begin.x += beginTabs * this.tabSize - beginTabs;
      end.x += endTabs * this.tabSize - endTabs;
      drawMarkArea({ begin, end });
    } else {
      for (let y = begin.y; y <= end.y; y++) {
        let lineLength = this.buffer.getLineLength(y + Y);
        const { tabs, remainder } = this.getPointTabs({ x: lineLength, y: y + Y });
        lineLength += tabs * this.tabSize - tabs;

        if (y === begin.y) {
          const { tabs, remainder } = this.getPointTabs({ x: begin.x, y: begin.y + Y });
          begin.x += tabs * this.tabSize - tabs;
          drawMarkArea({ begin, end: { x: lineLength } }, 0, this.char.width / 2);
        } else if (y === end.y) {
          const { tabs, remainder } = this.getPointTabs({ x: end.x, y: end.y + Y });
          end.x += tabs * this.tabSize - tabs;
          drawMarkArea({ begin: { x: 0, y }, end }, -this.gutter.padding);
        } else {
          drawMarkArea({ begin: { x: 0, y }, end: { x: lineLength, y }}, -this.gutter.padding, this.char.width / 2);
        }
      }
    }

    this.postMessage({ call: 'onselection', text: this.buffer.getAreaText(this.mark.get()) });
  }

  updateTitle () {
    this.ctx.title.save();
    this.ctx.title.fillStyle = theme.titlebar;
    this.ctx.title.fillRect(
      0, 0,
      this.canvas.title.width,
      this.canvas.title.height
    );
    this.applyFont(this.ctx.title);
    this.ctx.title.font = `normal 7.4pt mono`;
    this.ctx.title.scale(this.canvas.pixelRatio, this.canvas.pixelRatio);
    this.ctx.title.fillStyle = theme.title;
    this.ctx.title.fillText(
      (this.extraTitle ?? '') + this.title,
      7,
      5.4
    );
    this.ctx.title.restore();
  }

  setOffsetTop (offsetTop) {
    this.offsetTop = offsetTop;

    this.isVisible = !this.isSubEditor ||
      this.offsetTop
      + this.scroll.pos.y
      < this.canvas.height
      && this.offsetTop
      + this.scroll.pos.y
      + this.canvas.gutter.height
      + this.titlebar.height
      > 0;
  }

  clear () {
    // clear
    // this.ctx.outer.fillStyle = 'transparent' //theme.background
    // this.ctx.outer.fillRect(
    //   0,
    //   0,
    //   this.canvas.width,
    //   this.canvas.height
    // )
    Object.assign(this.canvas.outer, {
      width: this.canvas.width,
      height: this.canvas.height
    });
    // this.canvas.outer.width = this.canvas.width
    // this.canvas.outer.height = this.canvas.height

    // this.ctx.outer.clearRect(
    //   0,
    //   0,
    //   this.canvas.width,
    //   this.canvas.height
    // )
  }

  drawTitle () {
    if (this.titlebarHeight === 0) return
    // this.ctx.outer.save()
    this.ctx.outer.fillStyle = theme.titlebar;

    this.ctx.outer.drawImage(
      this.canvas.title,
      0,
      Math.max(0, this.offsetTop),
      // this.canvas.width,
      // this.titlebar.height
    );
    // this.applyFont(this.ctx.outer)
    // this.ctx.outer.scale(this.canvas.pixelRatio, this.canvas.pixelRatio)
    // this.ctx.outer.fillStyle = theme.title
    // this.ctx.outer.fillText(
    //   this.title,
    //   5,
    //   2.5 + Math.max(0, this.offsetTop / this.canvas.pixelRatio)
    // )
    // this.ctx.outer.restore()
  }

  drawBack () {
    // draw back layer

    const clipTop = Math.max(0, -this.offsetTop);

    this.ctx.outer.drawImage(
      this.canvas.back,

      this.scroll.pos.x, // sx
      this.scroll.pos.y + clipTop, // - this.offsetTop, // - this.offsetTop, // sy
      this.view.width, // sw
      this.view.height - this.offsetTop - clipTop, // sh

      this.view.left, // dx
      Math.max(0, this.view.top + this.offsetTop + clipTop), // dy
      this.view.width, // dw
      this.view.height - this.offsetTop - clipTop // dh
    );
  }

  drawText () {
    // draw text layer

    const clipTop = Math.max(0, -this.offsetTop);

    this.ctx.outer.drawImage(
      this.canvas.text,

      this.scroll.pos.x, // sx
      this.scroll.pos.y + clipTop, // - this.offsetTop, // - this.offsetTop, // sy
      this.view.width, // sw
      this.view.height - this.offsetTop - clipTop, // sh

      this.view.left, // dx
      Math.max(0, this.view.top + this.offsetTop + clipTop), // dy
      this.view.width, // dw
      this.view.height - this.offsetTop - clipTop // dh
    );
  }

  drawGutter () {
    // draw gutter layer

    const clipTop = Math.max(0, -this.offsetTop);

    this.ctx.outer.drawImage(
      this.canvas.gutter,

      0, // sx
      this.scroll.pos.y + clipTop, // sy
      this.canvas.gutter.width, // sw
      this.view.height - this.offsetTop - clipTop, // sh

      0, // dx
      Math.max(0, this.view.top + this.offsetTop + clipTop), // dy
      this.canvas.gutter.width, // dw
      this.view.height - this.offsetTop - clipTop// dh
    );
  }

  drawMark () {
    // draw mark layer
    if (this.mark.isEmpty()) return

    const { begin } = this.mark.get();
    const y = begin.y * this.char.px.height;

    const clipTop = Math.max(0,
    -(y + this.offsetTop - this.scroll.pos.y
    + this.canvas.padding * this.canvas.pixelRatio));

    const posTop =
    (-this.scroll.pos.y + this.offsetTop + y + clipTop)
    + this.titlebar.height
    + this.canvas.padding * this.canvas.pixelRatio;

    const height = this.canvas.mark.height - clipTop;

    // this.controlEditor.ctx.debug.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // this.controlEditor.ctx.debug.fillStyle = 'rgba(255,0,0,.5)'
    // this.controlEditor.ctx.debug.fillRect(0, posTop, 10, height)

    this.ctx.outer.drawImage(
      this.canvas.mark,

      this.scroll.pos.x, // sx
      clipTop, // sy
      this.canvas.mark.width,// sw
      height, // sh

      this.canvas.gutter.width, // dx
      posTop - 3, // dy
      this.canvas.mark.width, // dw
      height // dh
    );
  }

  drawCaret () {
    // draw caret
    this.ctx.outer.fillStyle = theme.caret;

    this.ctx.outer.fillRect(
    - this.scroll.pos.x
    + (this.caret.px.x
    + this.gutter.width
    + this.canvas.padding) * this.canvas.pixelRatio, // dx

    - this.scroll.pos.y
    + this.caret.px.y
    * this.canvas.pixelRatio
    + this.titlebar.height
    + this.offsetTop, // dy
      this.caret.width * this.canvas.pixelRatio, // dw
      this.caret.height * this.canvas.pixelRatio // dh
    );
  }

  drawBlock () {
    // draw block highlight
    this.ctx.outer.fillStyle = theme.caret;

    if (this.block.isEmpty()) return

    this.ctx.outer.fillRect(
    - this.scroll.pos.x
    + (this.block.begin.x
    + this.gutter.width
    + this.canvas.padding) * this.canvas.pixelRatio,

    - this.scroll.pos.y
    + this.block.begin.y
    * this.canvas.pixelRatio
    + this.titlebar.height
    + this.offsetTop
    + this.char.px.height + 1, // dy

      this.char.px.width, // dw
      1 // dh
    );

    this.ctx.outer.fillRect(
    - this.scroll.pos.x
    + (this.block.end.x
    + this.gutter.width
    + this.canvas.padding) * this.canvas.pixelRatio,

    - this.scroll.pos.y
    + this.block.end.y
    * this.canvas.pixelRatio
    + this.titlebar.height
    + this.offsetTop
    + this.char.px.height + 1, // dy

      this.char.px.width, // dw
      1 // dh
    );
  }

  drawVertScrollbar () {
    this.ctx.outer.strokeStyle = theme.scrollbar;
    this.ctx.outer.lineWidth = this.scrollbar.width;
    // this.ctx.outer.lineCap = 'round'

    const y =
      (this.scroll.pos.y / (
      (this.canvas.text.height + this.subEditorsHeight - this.canvas.height) || 1))
    * ((this.scrollbar.view.height - this.scrollbar.vert) || 1);

    if ((this.scrollbar.scale.height >= 1 && y > 2) || this.scrollbar.scale.height < 1) {
      this.ctx.outer.beginPath();
      this.ctx.outer.moveTo(this.canvas.width - this.scrollbar.margin, y);
      this.ctx.outer.lineTo(this.canvas.width - this.scrollbar.margin, y + this.scrollbar.vert);
      this.ctx.outer.stroke();
    }
  }

  drawHorizScrollbar () {
    this.ctx.outer.strokeStyle = theme.scrollbar;
    this.ctx.outer.lineWidth = this.scrollbar.width;

    const x =
      (this.scroll.pos.x / (this.canvas.scroll.width || 1))
    * ((this.scrollbar.view.width - this.scrollbar.horiz) || 1) || 0;

    const y = Math.min(
      this.canvas.gutter.height
    + this.offsetTop
    - this.scroll.pos.y
    + this.titlebar.height
    - this.scrollbar.margin,

      this.canvas.height
    - this.scrollbar.margin
    );

    if (y > this.titlebar.height - this.scrollbar.width + this.scrollbar.margin
    && this.offsetTop + this.titlebar.height < this.canvas.height
    && x + this.scrollbar.view.width - this.scrollbar.horiz > 12) {
      this.ctx.outer.beginPath();
      this.ctx.outer.moveTo(this.canvas.gutter.width + x, y);
      this.ctx.outer.lineTo(this.canvas.gutter.width + x + this.scrollbar.horiz + 1, y);
      this.ctx.outer.stroke();
    }
  }

  drawSync (noDelegate = false) {
    if (this.isSubEditor && !noDelegate) {
      this.controlEditor.drawSync();
      return
    }
    if (!this.isSubEditor) this.setOffsetTop(0);
    let offsetTop = -this.scroll.pos.y + this.canvas.gutter.height + this.titlebar.height;

    this.subEditors.forEach(editor => {
      editor.setOffsetTop(offsetTop);
      offsetTop += editor.canvas.gutter.height + editor.titlebar.height;
    });
    if (!this.isSubEditor) {
      this.clear();
      this.drawHorizScrollbar();
      this.subEditors.forEach(editor => editor.isVisible && editor.drawHorizScrollbar());
    }
    this.drawBack();
    if (this.markActive) this.drawMark();
    if (this.controlEditor.focusedEditor === this && this.hasFocus) {
      this.drawCaret();
      this.drawBlock();
    }
    if (!this.isSubEditor && this.isVisible) this.drawTitle();
    this.subEditors.forEach(editor => editor.isVisible && editor.drawTitle());
    if (!this.isSubEditor) this.drawVertScrollbar();
    this.drawText();
    this.drawGutter();
    this.subEditors.forEach(editor => editor.isVisible && editor.drawSync(true));

    if (!this.isSubEditor) {
      this.ctx.outer.drawImage(
        this.canvas.debug,
        0, 0
        // this.c
      );
      this.postMessage({ call: 'ondraw' });
    }
  }

  draw () {
    if (this.isSubEditor) {
      this.controlEditor.draw();
    } else {
      cancelAnimationFrame(this.drawAnimFrame);
      this.drawAnimFrame = requestAnimationFrame(this.drawSync);
    }
  }

  scrollTo (pos) {
    this.animScrollCancel();
    this.scroll.pos.set(Point.clamp(this.canvas.scroll, pos));
    this.scroll.target.set(this.scroll.pos);
    this.drawSync();
  }

  scrollBy (d, animType) {
    this.scroll.target.set(Point.clamp(this.canvas.scroll, this.scroll.pos.add(d)));

    if (!animType) {
      this.scrollTo(this.scroll.target);
    } else {
      this.animScrollStart(animType);
    }
  }

  animScrollCancel () {
    this.scrollAnim.isRunning = false;
    cancelAnimationFrame(this.scrollAnim.animFrame);
  }

  animScrollStart (animType = 'ease') {
    this.scrollAnim.type = animType;
    if (this.scrollAnim.isRunning) return

    this.scrollAnim.isRunning = true;
    this.scrollAnim.animFrame = requestAnimationFrame(this.animScrollTick);

    const s = this.scroll.pos;
    const t = this.scroll.target;
    if (s.equal(t)) return this.animScrollCancel()

    const d = t.minus(s);

    d.x = Math.sign(d.x) * 5;
    d.y = Math.sign(d.y) * 5;

    this.scroll.pos.set(Point.clamp(this.canvas.scroll, this.scroll.pos.add(d)));
    this.drawSync();
  }

  animScrollTick () { // TODO: branchless
    const { scale, threshold } = this.scrollAnim;
    let { speed } = this.scrollAnim;
    const d = this.scroll.target.minus(this.scroll.pos);
    const a = d.abs();

    if (a.y > this.canvas.height * threshold.far) {
      speed *= scale.far;
    }

    if (a.x < .5 && a.y < .5) {
      this.scrollTo(this.scroll.target);
    } else if (this.scroll.pos.equal(this.scroll.target)) {
      this.animScrollCancel();
    } else {
      this.scrollAnim.animFrame = requestAnimationFrame(this.animScrollTick);
      switch (this.scrollAnim.type) {
        case 'linear':
          if (a.x < speed * threshold.mid) d.x = d.x
            * (a.x < speed * threshold.near
              ? a.x < threshold.tiny
              ? scale.tiny
              : scale.near
              : scale.mid);

          else d.x = Math.sign(d.x) * speed;

          if (a.y < speed * threshold.mid) d.y = d.y
            * (a.y < speed * threshold.near
              ? a.y < threshold.tiny
              ? scale.tiny
              : scale.near
              : scale.mid);

          else d.y = Math.sign(d.y) * speed;
        break

        case 'ease':
          d.x *= 0.5;
          d.y *= 0.5;
        break
      }

      this.scroll.pos.set(
        Point.clamp(
          this.canvas.scroll,
          this.scroll.pos.add(d)
        )
      );
      this.drawSync();
    }
  }

  maybeDelegateMouseEvent (eventName, e) {
    if (this.isSubEditor) return false

    for (const editor of this.subEditors.values()) {
      if (e.clientY*2 > editor.offsetTop
      && e.clientY*2 < editor.offsetTop
      + editor.canvas.gutter.height
      + editor.titlebar.height
      ) {
        if (eventName === 'onmousedown') {
          this.controlEditor.setFocusedEditor(editor, false);
        }
        editor[eventName](e);
        return true
      }
    }

    if (this.controlEditor.focusedEditor !== this) {
      this.controlEditor.setFocusedEditor(this, false);
    }

    return false
  }

  maybeDelegateEvent (eventName, e) {
    if (this.isSubEditor) return false

    if (this.focusedEditor && this.focusedEditor !== this) {
      this.focusedEditor?.[eventName](e);
      return true
    }

    return false
  }

  oncontextmenu () {}

  onmouseenter () {}
  onmouseover () {}
  onmouseout () {}

  onmousewheel (e) {
    let { deltaX, deltaY } = e;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (!this.maybeDelegateMouseEvent('onmousewheel', e)) {
        deltaX *= 700;
        this.scrollBy({ x: deltaX, y: 0 }, 'linear');
      }
    } else {
      deltaY *= 770;
      this.scrollBy({ x: 0, y: deltaY }, 'linear');
    }
  }

  onmouseup () {}

  onmousedown (e) {
    if (!this.maybeDelegateMouseEvent('onmousedown', e)) {
      this.usedMouseRight = false;
      if (e.left) {
        this.markClear();
        this.updateMark();
        this.setCaretByMouse(e);
        this.markBegin();
        this.draw();
      } else if (e.right) {
        // this prevents clicking away from context menu
        // to create a selection
        this.usedMouseRight = true;
      }
    }
  }

  onmousemove (e) {
    if (!this.maybeDelegateEvent('onmousemove', e)) {
      if (e.left && !this.usedMouseRight) {
        this.setCaretByMouse(e);
        this.markSet();
        // if (!this.keepCaretInView()) {
        this.drawSync();
        // }
      }
    }
  }

  keepCaretInView (animType, centered) {
    const caretPxDiff = this.getCaretPxDiff(centered);
    if (this.controlEditor === this) {
      this.scrollBy({ x: -caretPxDiff.x, y: -caretPxDiff.y }, animType);
    } else {
      if (caretPxDiff.x !== 0) this.scrollBy({ x: -caretPxDiff.x, y: 0 }, animType);
      if (caretPxDiff.y !== 0) this.controlEditor.scrollBy({ x: 0, y: -caretPxDiff.y }, animType);
    }
  }

  applyCaretDiff (diff, jump = false) {
    const diffPx = new Point(diff).mul(this.char.px);
    const caretPxDiff = this.getCaretPxDiff();
    if (caretPxDiff.x !== 0) this.scrollBy({ x: -caretPxDiff.x, y: 0 });
    if (caretPxDiff.y !== 0) {
      if (jump) {
        this.controlEditor.scrollBy({ x: 0, y: -(diffPx.y || caretPxDiff.y) }, 'ease');
      } else {
        this.controlEditor.scrollBy({ x: 0, y: -caretPxDiff.y }, 'ease');
      }
    }
  }

  onkeydown (e) {
    if (this.maybeDelegateEvent('onkeydown', e)) return

    this.keys.delete(e.key.toLowerCase());
    this.keys.delete(e.key.toUpperCase());
    this.keys.add(e.key);
    this.keys.add(e.which);
    this.keys.add(e.char);
    this.key = e.key.length === 1 ? e.key : null;

    if (!e.cmdKey && this.key) return this.insert(this.key)
    if (!e.cmdKey && e.key === 'Enter') return this.insert('\n')
    if (!e.cmdKey && e.key === 'Backspace') return this.backspace()
    if (!e.cmdKey && !e.shiftKey && e.key === 'Delete') return this.delete()

    this.pressed = [e.cmdKey && 'Cmd', e.altKey && 'Alt', e.key].filter(Boolean).join(' ');

    // navigation
    if (e.shiftKey && e.key !== 'Shift') this.markBegin();
    else if (e.key !== 'Delete' && !e.cmdKey && e.key !== 'Tab') this.markClear();

    switch (this.pressed) {
      case 'Cmd z': {
        const editor = this.controlEditor.history.undo(this.controlEditor.history.needle-1);
        if (editor) this.setFocusedEditor(editor);
        this.draw();
      }
      break
      case 'Cmd y': {
        const editor = this.controlEditor.history.redo(this.controlEditor.history.needle+1);
        if (editor) this.setFocusedEditor(editor);
        this.draw();
      }
      break
      case 'Tab': {
        const tab = ' '.repeat(this.tabSize);

        let add;
        let area;
        let text;

        let prevArea = this.mark.copy();

        let clear = false;
        let caret = this.caret.pos.copy();
        let align = this.caret.align;

        let matchIndent = false;

        if (!this.markActive) {
          this.insert(tab);
          break
        } else {
          area = this.mark.get();
          area.end.y += area.end.x > 0 ? 1 : 0;
          area.begin.x = 0;
          area.end.x = 0;
          text = this.buffer.getAreaText(area);
          matchIndent = true;
        }

        if (e.shiftKey) {
          add = -2;
          text = text.replace(/^ {1,2}(.+)/gm, '$1'); // TODO: use tabSize
        } else {
          add = +2;
          text = text.replace(/^([\s]*)(.+)/gm, `$1${tab}$2`);
        }

        this.mark.set(area);
        this.insert(text);
        this.mark.set(prevArea);
        this.mark.begin.x += this.mark.begin.x > 0 ? add : 0;
        this.mark.end.x += this.mark.end.x > 0 ? add : 0;
        this.markActive = !clear;

        this.caret.align = align;

        if (matchIndent) {
          caret.x += add;
          this.caret.align += add;
        }
        this.setCaret(caret);
        this.updateMark();
        this.draw();
      }
      break
      case 'Cmd /': {
        let add;
        let area;
        let text;

        let prevArea = this.mark.copy();

        let clear = false;
        let caret = this.caret.pos.copy();
        let align = this.caret.align;

        let matchIndent = false;

        if (!this.markActive) {
          clear = true;
          this.markClear();
          this.moveBeginOfLine();
          this.markBegin();
          this.moveEndOfLine();
          this.markSet();
          area = this.mark.get();
          text = this.buffer.getAreaText(area);
          matchIndent = text.match(/\S/)?.index < caret.x;
        } else {
          area = this.mark.get();
          area.end.y += area.end.x > 0 ? 1 : 0;
          area.begin.x = 0;
          area.end.x = 0;
          text = this.buffer.getAreaText(area);
          matchIndent = true;
        }

        //TODO: should check if last line has // also
        if (text.trimLeft().substr(0,2) === '//') {
          add = -2;
          text = text.replace(/^(.*?)\/\/(.+)?/gm, '$1$2');
        } else {
          add = +2;
          text = text.replace(/^(.+)/gm, '//$1');
        }

        this.mark.set(area);
        this.insert(text);
        this.mark.set(prevArea);
        this.mark.begin.x += this.mark.begin.x > 0 ? add : 0;
        this.mark.end.x += this.mark.end.x > 0 ? add : 0;
        this.markActive = !clear;

        this.caret.align = align;

        if (matchIndent) {
          caret.x += add;
          this.caret.align += add;
        }
        this.setCaret(caret);
        this.updateMark();
        this.draw();
      }
      return
      case 'Cmd D': {
        this.align();
        const area = this.mark.get();
        if (area.isEmpty()) {
          this.buffer.insert(
            { x: 0, y: this.caret.pos.y },
            this.buffer.getLineText(this.caret.pos.y)
          + (this.caret.pos.y === this.buffer.loc() ? '\n' : '')
          );
          this.updateSizes();
          this.updateText();
          this.moveByLines(+1);
          this.markClear(true);
        } else if (area.begin.y === area.end.y) {
          const text = this.buffer.getAreaText(area);
          this.buffer.insert(this.caret.pos, text);
          this.updateSizes();
          this.updateText();
          this.moveByChars(text.length);
          this.mark.addRight(text.length);
          this.updateMark();
        } else {
          let text = '';
          let addY = 0;
          if (area.end.x > 0) {
            addY = 1;
            text = '\n';
            area.end.x = this.buffer.getLineLength(area.end.y);
          }
          area.begin.x = 0;
          text = text + this.buffer.getAreaText(area);
          this.buffer.insert(area.end, text);
          area.end.y += addY;
          this.updateSizes();
          this.updateText();
          this.moveByLines(area.height);
          this.mark.shiftByLines(area.height);
          this.updateMark();
        }
        this.keepCaretInView('ease');
        this.draw();
      }
      return

      case 'Delete': case 'Cmd x':
        if (!this.mark.isEmpty()) {
          this.delete();
        } else {
          this.markClear(true);
          this.moveBeginOfLine();
          this.markBegin();
          const diff = this.moveByLines(+1);
          // only delete content below
          if (diff.y !== 0 || diff.x !== 0) {
            this.markSet();
            this.delete();
          } else {
            this.markClear(true);
          }
        }
        break
      case 'Cmd a'          : this.markClear(true); this.moveBeginOfFile(); this.markBegin(); this.moveEndOfFile(); this.markSet(); break
      case 'Cmd Backspace'  : this.markBegin(); e.shiftKey ? this.moveBeginOfLine() : this.moveByWords(-1); this.markSet(); this.delete(); break
      case 'Cmd Delete'     : this.markBegin(); e.shiftKey ? this.moveEndOfLine() : this.moveByWords(+1); this.markSet(); this.delete(); this.align(); break
      case 'Cmd ArrowLeft'  : this.moveByWords(-1); this.align(); break
      case 'Cmd ArrowRight' : this.moveByWords(+1); this.align(); break
      case 'Cmd ArrowUp':
        if (e.shiftKey) {
          this.align();
          this.markBegin(false);
          const area = this.mark.get();
          if (!area.isEmpty() && area.end.x === 0) {
            area.end.y = area.end.y - 1;
            area.end.x = this.buffer.getLine(area.end.y).length;
          }
          if (this.buffer.moveAreaByLines(-1, area)) {
            this.updateSizes();
            this.updateText();
            this.mark.shiftByLines(-1);
            this.applyCaretDiff(this.moveByLines(-1));
            this.updateMark();
          }
        } else {
          this.scrollBy({ x: 0, y: -this.char.px.height }, 'ease');
        }
        break
      case 'Cmd ArrowDown':
        if (e.shiftKey) {
          this.align();
          this.markBegin(false);
          const area = this.mark.get();
          if (!area.isEmpty() && area.end.x === 0) {
            area.end.y = area.end.y - 1;
            area.end.x = this.buffer.getLine(area.end.y).length;
          }
          if (this.buffer.moveAreaByLines(+1, area)) {
            this.updateSizes();
            this.updateText();
            this.mark.shiftByLines(+1);
            this.applyCaretDiff(this.moveByLines(+1));
            this.updateMark();
          }
        } else {
          this.scrollBy({ x: 0, y: +this.char.px.height }, 'ease');
        }
      break

      case 'ArrowLeft':
        this.applyCaretDiff(this.moveByChars(-1));
        if (e.shiftKey) this.markSet();
      break
      case 'ArrowRight':
        this.applyCaretDiff(this.moveByChars(+1));
        if (e.shiftKey) this.markSet();
      break
      case 'ArrowUp':
        this.applyCaretDiff(this.moveByLines(-1));
        if (e.shiftKey) this.markSet();
      break
      case 'ArrowDown':
        this.applyCaretDiff(this.moveByLines(+1));
        if (e.shiftKey) this.markSet();
      break

      case 'Alt PageUp':
        this.controlEditor.moveByEditors(-1);
      break
      case 'Alt PageDown':
        this.controlEditor.moveByEditors(+1);
      break

      case 'PageUp': {
        const caretPos = this.caret.pos.copy();
        this.applyCaretDiff(this.moveByLines((-this.page.lines/2)|0), true);
        if (e.shiftKey) this.markSet();
        else {
          if (caretPos.equal(this.caret.pos)) {
            this.controlEditor.moveByEditors(-1);
          }
        }
      }
      break
      case 'PageDown': {
        const caretPos = this.caret.pos.copy();
        this.applyCaretDiff(this.moveByLines((+this.page.lines/2)|0), true);
        if (e.shiftKey) this.markSet();
        else {
          if (caretPos.equal(this.caret.pos)) {
            this.controlEditor.moveByEditors(+1);
          }
        }
      }
      break

      case 'Home':
        this.applyCaretDiff(this.moveBeginOfLine({ isHomeKey: true }));
        if (e.shiftKey) this.markSet();
      break
      case 'End':
        this.applyCaretDiff(this.moveEndOfLine());
        if (e.shiftKey) this.markSet();
      break
    }

    this.draw();
  }

  moveByEditors (y) {
    const editors = [this, ...this.subEditors];
    let index = editors.indexOf(this.focusedEditor);
    let prev = index;
    index += y;
    if (index > editors.length - 1) index = 0;
    if (index < 0) index = editors.length - 1;
    if (prev === index) return
    const editor = editors[index];
    this.setFocusedEditor(editor);
  }

  onkeyup (e) {
    if (this.maybeDelegateEvent('onkeyup', e)) return

    this.keys.delete(e.key.toLowerCase());
    this.keys.delete(e.key.toUpperCase());
    this.keys.delete(e.key);
    this.keys.delete(e.which);
    this.keys.delete(e.char);
    if (e.key === this.key) {
      this.key = null;
    }
  }

  onpaste ({ text }) {
    if (this.maybeDelegateEvent('onpaste', { text })) return
    this.insert(text, true);
  }

  onhistory ({ needle }) {
    if (needle !== this.history.needle) {
      let editor;
      if (needle < this.history.needle) {
        editor = this.history.undo(needle);
      } else if (needle > this.history.needle) {
        editor = this.history.redo(needle);
      }
      if (editor) {
        this.setFocusedEditor(editor);
      }
    }
  }

  setFocusedEditor (editor, animType = 'ease', centered = true) {
    const hasFocus = this.focusedEditor?.hasFocus;
    if (editor !== this.focusedEditor) {
      this.focusedEditor?.onblur();
      this.focusedEditor = editor;
      if (hasFocus) {
        this.postMessage({
          call: 'onfocus',
          id: editor.id,
          title: editor.title
        });
      }
    }
    if (hasFocus) {
      editor.onfocus();
    }
    editor.updateSizes();
    editor.updateText();
    editor.updateMark();
    if (animType !== false) editor.keepCaretInView(animType, centered);
    editor.draw();
  }

  onblur () {
    if (this.controlEditor.focusedEditor) {
      this.controlEditor.focusedEditor.hasFocus = false;
      this.controlEditor.focusedEditor.keys.clear();
    }
    this.controlEditor.draw();
  }

  onfocus () {
    if (this.controlEditor.focusedEditor) {
      this.controlEditor.focusedEditor.hasFocus = true;
      this.controlEditor.focusedEditor.keys.clear();
    } else {
      this.controlEditor.focusedEditor = this;
      this.controlEditor.hasFocus = true;
    }
    this.postMessage({
      call: 'onfocus',
      id: this.controlEditor.focusedEditor.id,
      title: this.controlEditor.focusedEditor.title
    });
    this.controlEditor.draw();
  }

  onresize ({ width, height }) {
    this.canvas.width = this.canvas.outer.width = width;
    this.canvas.height = this.canvas.outer.height = height;
    this.subEditors.forEach(editor => {
      editor.canvas.width = editor.canvas.outer.width = width;
      editor.canvas.height = editor.canvas.outer.height = height;
      editor.updateSizes(true);
      editor.updateText();
    });
    this.updateSizes(true);
    this.updateText();
    this.drawSync();
    postMessage({ call: 'onresize' });
  }
}

if (isWorker) {
  const editor = new Editor();
  onmessage = ({ data }) => {
    if (!(data.call in editor)) {
      console.error(data.call + ' is not a method');
    }
    editor[data.call](data);
  };
  postMessage({ call: 'onready' });
}

export default PseudoWorker;
