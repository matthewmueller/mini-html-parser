/**
 * Export `element`
 */

module.exports = element;

/**
 * Create `element` node
 *
 * @param {String} tag
 * @param {Object|null} attrs
 * @param {Object|null} parent
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
