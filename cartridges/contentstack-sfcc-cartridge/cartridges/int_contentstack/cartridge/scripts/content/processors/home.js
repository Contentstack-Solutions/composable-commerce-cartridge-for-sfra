'use strict';

/**
 * Process payload
 * @param {Object} payload payload
 * @return {Object} result
 */
function process(payload) {
    if (payload) {
    // iterate over payload.elements.components
        if (payload.components && payload.components.elements) {
            payload.components.elements.forEach(function (block) {
                var blockId = Object.keys(block)[0];
                var blockData = block[blockId];

                switch (blockId) {
                    case 'category_tiles':
                        // Process home block
                        var categoryTilesProcessor = require('*/cartridge/scripts/content/processors/modular-blocks/categoryTiles');
                        blockData = categoryTilesProcessor.process(blockData);
                        break;
                        // Add more cases for other blocks as needed
                    default:
                        break;
                }
                block[blockId] = blockData;
            });
        }
    }
    payload.processedBy = 'home';
    payload.processed = true;
    return payload;
}

module.exports = {
    process: process,
};
