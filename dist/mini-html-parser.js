;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("visionmedia-debug/index.js", function(exports, require, module){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

});
require.register("mini-html-parser/index.js", function(exports, require, module){
/**
 * Module exports
 */

var debug = require('debug')('html-parser');

/**
 * Expose `Parser`
 */

exports = module.exports = Parser;

/**
 * Simplified DOM nodes
 */

var nodes = exports.nodes = {
  comment : require('./nodes/comment'),
  element : require('./nodes/element'),
  text : require('./nodes/text')
};

/**
 * HTML5 Empty Elements
 */

var empty = { area: true, base: true, basefont: true, br: true, col: true, command: true, embed: true, frame: true, hr: true, img: true, input: true, isindex: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true };

/**
 * Special tags that can contain anything
 */

var special = { script: true, style: true };

/**
 * Attributes that autofill
 */

var autofill = { autofocus: true, autoplay: true, async: true, checked: true, controls: true, defer: true, disabled: true, hidden: true, loop: true, multiple: true, open: true, readonly: true, required: true, scoped: true, selected: true }

/**
 * Regexs
 */

var rcomment = /^<!--([\s\S]*)-->/;
var rstarttag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
var rattr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
var rendtag = /^<\/([-A-Za-z0-9_]+)[^>]*>/;
var rtext = /^[^<]+/;

/**
 * Create regex for special tags
 */

var rspecial = {};
for (var tag in special) rspecial[tag] = new RegExp('<\/' + tag + '[^>]*>', 'i');

/**
 * Create a new `Parser`
 *
 * @param {String} html
 * @return {Parser}
 * @api public
 */

function Parser(html) {
  if (!(this instanceof Parser)) return new Parser(html);
  this.html = this.original = html;
  this.tokens = [];
  this.root = this.tree = [];
  this.err = null;
  this.parent = null;
}

/**
 * Parse all the nodes
 *
 * @return {Object|Error} dom
 * @api public
 */

Parser.prototype.parse = function() {
  while (!this.err && this.advance() != 'eos');
  return this.err ? this.err : this.root;
}

/**
 * Advance to the next token
 *
 * @return {String} token
 * @api public
 */

Parser.prototype.advance = function() {
  var tok = this.eos()
    || this.comment()
    || this.endtag()
    || this.starttag()
    || this.text()
    || this.error()

  this.tokens.push(tok);
  return tok;
}

/**
 * Consume the given `len`.
 *
 * @param {Number|Array} len
 * @api private
 */

Parser.prototype.skip = function(len){
  this.html = this.html.substr(Array.isArray(len)
    ? len[0].length
    : len);
};

/**
 * End of string
 *
 * @return {String|undefined} token
 * @api private
 */

Parser.prototype.eos = function() {
  if (!this.html.length) return 'eos';
};

/**
 * Comment
 *
 * @return {String|undefined} token
 * @api private
 */

Parser.prototype.comment = function() {
  var captures;
  if (captures = rcomment.exec(this.html)) {
    this.skip(captures);
    var node = nodes.comment(captures[1]);
    debug('<!-- %s -->', captures[1]);

    // connect it to the DOM
    this.connect(node);

    return 'comment';
  }

};

/**
 * Start Tag
 *
 * @return {String|undefined} token
 * @api private
 */

Parser.prototype.starttag = function() {
  var captures;
  if (captures = rstarttag.exec(this.html)) {
    this.skip(captures);
    var name = captures[1].toLowerCase();
    var attrs = (captures[2]) ? attributes(captures[2]) : {};
    var node = nodes.element(name, attrs, this.parent);
    debug('<%s>', name)

    // connect it to the DOM
    this.connect(node);

    // handle self-closing tags
    // and special tags that can
    // contain any content
    if (special[name]) {
      node = this.special(node);
    } else if(!empty[name]) {
      this.tree = node.childNodes;
      this.parent = node;
    }

    return 'start-tag';
  }

};

/**
 * End Tag
 *
 * @return {String|undefined} token
 * @api private
 */

Parser.prototype.endtag = function() {
  var captures;
  if (captures = rendtag.exec(this.html)) {
    this.skip(captures);
    debug('</%s>', captures[1]);

    // move up a level
    if (!this.parent) return this.error('No end tag for <' + captures[1] + '>.');
    this.parent = this.parent.parentNode;
    this.tree = (this.parent) ? this.parent.childNodes : this.root;

    return 'end-tag';
  }
};

/**
 * Text Nodes
 *
 * @return {String|undefined} token
 * @api private
 */

Parser.prototype.text = function() {
  var captures;
  if (captures = rtext.exec(this.html)) {
    this.skip(captures);
    var node = nodes.text(captures[0], this.parent);
    debug(node.nodeValue);

    // connect it to the DOM
    this.connect(node);

    return 'text';
  }
};

/**
 * Handle special tags (ex. script, style)
 * that can contain any content including "<".
 *
 * @param {Object} node
 * @return {Object} node
 */

Parser.prototype.special = function(node) {
  var name = node.nodeName.toLowerCase();
  var captures = rspecial[name].exec(this.html);
  if (!captures) return this.error('No ending ' + name + ' tag.');

  // extract the contents of the tag
  var text = this.html.slice(0, captures.index);

  // connect DOM
  var textnode = nodes.text(text, node);
  node.childNodes.push(textnode);

  // skip text + length of match
  this.skip(text.length + captures[0].length);

  return node;
};

/**
 * Connect the DOM tree
 *
 * @param {Object} node
 * @return {Parser}
 * @api private
 */

Parser.prototype.connect = function(node) {
  this.tree.push(node);

  var prev = this.tree[this.tree.length - 1];
  if (prev) {
    prev.nextSibling = node;
    node.previousSibling = prev;
  }

  return this;
}

/**
 * Handle errors
 *
 * @param {String} err (optional)
 * @return {String}
 * @api private
 */

Parser.prototype.error = function(err) {
  var original = this.original;
  var ellipsis = '\u2026';
  var caret = '\u2038';
  var i = original.length - this.html.length;

  // provide a useful error
  var at = original.slice(i - 20, i) + caret + original.slice(i, i + 20)
  at = original[i - 20] ? ellipsis + at : at
  at += original[i + 20] ? ellipsis : '';

  // add the message
  var msg = err || 'Parsing error.';
  msg += ' Near: ' + at;

  // set the error
  this.err = new Error(msg);

  return 'error';
};

/**
 * Parse attributes
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function attributes(str) {
  var attrs = {};

  str.replace(rattr, function(match, name) {
    attrs[name] = arguments[2] || arguments[3] || arguments[4] || autofill[name] || '';
  });

  return attrs;
}

});
require.register("mini-html-parser/nodes/comment.js", function(exports, require, module){
/**
 * Export `comment`
 */

module.exports = comment;

/**
 * Create `comment` node
 *
 * @param {String} value
 */

function comment(value) {
  return {
    nodeType: 8,
    nodeValue: value,
    nextSibling: null,
    nodeName: '#comment',
    previousSibling: null,
    parentNode: parent || null
  };
}

});
require.register("mini-html-parser/nodes/element.js", function(exports, require, module){
/**
 * Export `element`
 */

module.exports = element;

/**
 * Create `element` node
 *
 * @param {String} tag
 */

function element(tag, attrs, parent) {
  return {
    nodeType: 1,
    childNodes: [],
    nextSibling: null,
    previousSibling: null,
    attributes: attrs || {},
    parentNode: parent || null,
    nodeName: tag.toUpperCase()
  };
}

});
require.register("mini-html-parser/nodes/text.js", function(exports, require, module){
/**
 * Export `text`
 */

module.exports = text;

/**
 * Create `text` node
 *
 * @param {String} tag
 */

function text(value, parent) {
  return {
    nodeType: 3,
    nodeValue: value,
    nodeName: '#text',
    nextSibling: null,
    previousSibling: null,
    parentNode: parent || null
  };
}

});
require.alias("visionmedia-debug/index.js", "mini-html-parser/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "mini-html-parser/deps/debug/debug.js");
require.alias("visionmedia-debug/index.js", "debug/index.js");

require.alias("mini-html-parser/index.js", "mini-html-parser/index.js");if (typeof exports == "object") {
  module.exports = require("mini-html-parser");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("mini-html-parser"); });
} else {
  this["mini-html-parser"] = require("mini-html-parser");
}})();