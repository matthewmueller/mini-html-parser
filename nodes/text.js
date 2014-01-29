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
    parentNode: parent || null
  };
}
