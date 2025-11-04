'use strict';

/**
 * Process payload
 * @param {Object} payload payload
 * @return {Object} result
 */
function process(payload) {
    var p = payload || {};
    p.processed = true;
    p.processedBy = 'default';
    return p;
}

module.exports = {
    process: process,
};