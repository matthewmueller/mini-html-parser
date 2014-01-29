/**
 * Export `text`
 */

module.exports = text;

/**
 * Create `text` node
 *
 * @param {String} tag
 * @param {Object|null} parent
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
