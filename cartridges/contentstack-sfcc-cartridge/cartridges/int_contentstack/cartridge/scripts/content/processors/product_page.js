'use strict';

/**
 * Processes a given payload using the appropriate processor based on the content type.
 * @param {*} payload - The data to be processed.
 * @param {string} [contentType] - The type of content that determines which processor to use.
 * @param {Object} [context] - Optional context object passed to the processor.
 * @returns {Object} The processed payload
 */
function process(payload, contentType, context) {
    if (
        payload &&
    payload.components &&
    payload.components.elements &&
    payload.components.elements.length === 0
    ) {
    // TODO: This might be a bug in the CMS, as it should not return an empty array
    // Need to inject a fallback product details block
        payload.components.elements.push({
            default_product_details: {
                override_default_product_details: [
                    {
                        product_name: '',
                        product_description: '',
                        product_images: [],
                        isDescriptionPlainText: true,
                        highlights: {
                            fresh: false,
                            sale: false,
                            fresh_text: '',
                            sale_text: '',
                        },
                    },
                ],
            },
        });
    }
    var defaultModularBlocksProcessor = require('*/cartridge/scripts/content/processors/modular-blocks');
    return defaultModularBlocksProcessor.process(payload, contentType, context);
}

module.exports = {
    process: process,
};
