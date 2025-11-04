'use strict';

var pageHelpers = require('*/cartridge/scripts/helpers/pageHelpers');
var constants = require('*/cartridge/config/cmsConstants');

/**
 * Middleware to include CMS header and footer data in the view.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function includeHeaderFooter(req, res, next) {
    var queryData = {};
    queryData.includes = ['promotional_bar_configuration.existing_promotional_bar'];
    var headerData = pageHelpers.getPage(constants.HEADER, req, queryData);
    var footerData = pageHelpers.getPage(constants.FOOTER, req);
    var viewData = res.getViewData();

    if (!empty(headerData)) {
        viewData.cmsHeader = headerData;
    }
    if (!empty(footerData)) {
        viewData.cmsFooter = footerData;
    }

    res.setViewData(viewData);
    next();
}

/**
 * Middleware to include CMS tracking consent data in the view.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function includeTrackingConsent(req, res, next) {
    var consentData = pageHelpers.getPage(constants.TRACKING_CONSENT, req);
    var viewData = res.getViewData();

    if (!empty(consentData)) {
        viewData.consentData = consentData;
    }
    res.setViewData(viewData);
    next();
}

module.exports = {
    includeHeaderFooter: includeHeaderFooter,
    includeTrackingConsent: includeTrackingConsent
};
