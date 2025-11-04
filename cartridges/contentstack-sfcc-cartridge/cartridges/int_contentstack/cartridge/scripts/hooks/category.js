'use strict';

/**
 * Modifies the category GET response by adding a Contentstack URL object to the response document.
 *
 * @param {dw.catalog.Category} category - The category object for which URLs are generated.
 * @param {Object} document - The document object to be modified with the Contentstack URL.
 */
exports.modifyGETResponse = function (category, document) {
    try {
        var URLUtils = require('dw/web/URLUtils');
        var shortUrl = URLUtils.url('Search-Show', 'cgid', category.getID()).toString();
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
            "full": URLUtils.https('Search-Show', 'cgid', category.getID()).toString()
        };
        document.c_cs_url = csURL;
    } catch (error) {
        var Logger = require('dw/system/Logger');
        var Status = require("dw/system/Status");

        var logger = Logger.getLogger('Contentstack', 'hooks.category');
        logger.warn('Error trying to modify category response. Error message: {0} - Category: {1}', error, category.getID());

        return new Status(Status.ERROR);
    }
}