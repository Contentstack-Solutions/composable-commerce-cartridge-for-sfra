'use strict';

var PROCESSORS = {
    default: require('*/cartridge/scripts/content/processors/default'),
    home: require('*/cartridge/scripts/content/processors/home'),
    product_page: require('*/cartridge/scripts/content/processors/product_page'),
};

/**
 * Processes a given payload using the appropriate processor based on the content type..
 * @param {*} payload - The data to be processed.
 * @param {string} [contentType] - The type of content that determines which processor to use.
 * @param {Object} [context] - Optional context object passed to the processor.
 * @returns {Object} The processed payload
 */
function processPayload(payload, contentType, context) {
    var result = PROCESSORS.default.process(payload, contentType);

    if (contentType) {
        var processor = PROCESSORS[contentType];
        if (processor) {
            result = processor.process(payload, contentType, context);
            var newPayload = Object.assign({}, result);
            newPayload.processedBy = contentType;
            newPayload.processed = true;
            result = newPayload;
        }
    }

    return result;
}

module.exports = {
    processPayload: processPayload,
};
