'use strict';

/**
 * Modifies the product GET response by adding a Contentstack URL object to the response document.
 *
 * @param {dw.catalog.Product} product - The product object for which the response is being modified.
 * @param {Object} document - The response document to be modified.
 */
exports.modifyGETResponse = function (product, document) {
    try {        
        var URLUtils = require('dw/web/URLUtils');        
        var shortUrl = URLUtils.url('Product-Show', 'pid', product.getID()).toString();
        var Site = require('dw/system/Site');
        var siteId = Site.getCurrent().getID();

        // This is to remove th the prefix for urls as it's already included in the Contentstack environment url settings
        var prefixToRemove = '/s/' + siteId;
        shortUrl = shortUrl.replace(prefixToRemove, '');
        var constants = require('*/cartridge/config/localeConstants');
        shortUrl = shortUrl.replace(constants.SUPPORTED_LOCALES_REGEX, '');
        shortUrl = shortUrl.replace(/\/{2,}/, '/');

        var csURL = {            
            "short": shortUrl,
            "full": URLUtils.https('Product-Show', 'pid', product.getID()).toString()
        };
        document.c_cs_url = csURL;
    } catch (error) {
        var Logger = require('dw/system/Logger');
        var Status = require("dw/system/Status");

        var logger = Logger.getLogger('Contentstack', 'hooks.product');
        logger.warn('Error trying to modify product response. Error message: {0} - Product: {1}', error, product.getID());

        return new Status(Status.ERROR);
    }
}