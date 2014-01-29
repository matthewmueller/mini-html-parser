
# mini-html-parser

  Mini html parser for webworkers / node. Parses and builds a simplified DOM tree in one go. Intended for well-formed HTML.

## Installation

  With node.js:

    npm install mini-html-parser

  In the browser (with [component](http://component.io)):

    $ component install matthewmueller/mini-html-parser

  * Development: `16kb`
  * Minified + gzipped: `4kb`

## Example

```js
var html = '<h1>some title</h1><p>this is a <em>post</em> from <a href="http://mat.io">mat.io</a>.</p>';
var parser = parser(html);
var dom = parser.parse();
```

## API

### Parser(html)

  Create a parser with the following `html` string.

### Parser#parse()

  Parse the html string returning a simplified DOM object. The DOM object contains the following DOM nodes below. If the parser fails to parse the HTML string, parse will return an `Error` object.

#### element:

```
{
  nodeName: 'A',
  nodeType: 1,
  childNodes: [...],
  previousSibling: ...,
  nextSibling: ...,
  parentNode: ...
}
```

#### text:

```
{
  nodeName: '#text',
  nodeType: 3,
  nodeValue: '...',
  previousSibling: ...,
  nextSibling: ...,
  parentNode: ...
}
```

#### comment:

```
{
  nodeName: '#comment',
  nodeType: 8,
  nodeValue: '...',
  previousSibling: ...,
  nextSibling: ...,
  parentNode: ...
}
```

## TODO

- handle other node types (doctype, etc.)
- benchmark

## This library won't parse X...

This is not a full-blown XML parser. It's error handling is minimal and is best suited for well-formed HTML. For more information read this: http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454

## Credits

A lot of the regular expressions and inspiration came from John Resig's [Pure Javascript HTML Parser](http://ejohn.org/blog/pure-javascript-html-parser/).

## License

  MIT

