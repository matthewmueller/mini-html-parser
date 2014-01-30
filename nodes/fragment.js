/**
 * Export `fragment`
 */

module.exports = fragment;

/**
 * Create `fragment` node
 *
 * @return {Object} fragment
 */

function fragment() {
  return {
    nodeType: 11,
    childNodes: [],
    parentNode: null,
    nextSibling: null,
    previousSibling: null,
    nodeName: '#fragment'
  };
}
