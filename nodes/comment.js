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
