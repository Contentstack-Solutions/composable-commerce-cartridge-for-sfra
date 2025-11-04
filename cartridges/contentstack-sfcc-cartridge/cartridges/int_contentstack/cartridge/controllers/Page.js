'use strict';

/**
 * Page-Show : This end point will render a content asset in full storefront page
 * @name Base/Page-Show
 * @function
 * @memberof Page
 * @param {middleware} - cache.applyDefaultCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - cid - the id of the content asset to be displayed in a full page
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */

var server = require('server');
var base = module.superModule;

server.extend(base);

var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var pageHelpers = require('*/cartridge/scripts/helpers/pageHelpers');
var cmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');
var cmsComponents = require('*/cartridge/scripts/middleware/cmsComponents');
server.append(
    'Show',
    cmsComponents.includeHeaderFooter,
    function (req, res, next) {
        var constants = require('*/cartridge/config/cmsConstants');
        var viewData = res.getViewData();
        viewData.cmsHelper = cmsHelper;
        viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
        var queryData = {};
        queryData.query = '{"sfra_content_id":"' + req.querystring.cid + '"}';
        queryData.includes = [
            'components.banner.existing_banner',
            'components.newsletter.existing_newsletter'
        ];
        queryData.context = { product: viewData.product };
        var pageData = pageHelpers.getPage(
            constants.CONTENT_PAGE,
            req,
            queryData
        );

        if (!empty(pageData)) {
            viewData.cmsData = pageData;
        }

        viewData.isLivePreview = cmsHelper.isLivePreviewEnabled();
        res.setViewData(viewData);
        next();
    },
    pageMetaData.computedPageMetaData
);

module.exports = server.exports();