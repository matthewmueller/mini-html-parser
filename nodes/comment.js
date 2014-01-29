/**
 * Export `comment`
 */

module.exports = comment;

/**
 * Create `comment` node
 *
 * @param {String} value
 * @param {Object|null} parent
 */

function comment(value, parent) {
  return {
    nodeType: 8,
    nodeValue: value,
    nextSibling: null,
    nodeName: '#comment',
    previousSibling: null,
    parentNode: parent || null
  };
}
