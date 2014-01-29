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
    var node = nodes.comment(captures[1], this.parent);
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
