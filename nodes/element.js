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
