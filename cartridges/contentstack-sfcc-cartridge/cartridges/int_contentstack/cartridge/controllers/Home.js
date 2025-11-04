'use strict';

var server = require('server');
var base = module.superModule;

server.extend(base);

var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var pageHelpers = require('*/cartridge/scripts/helpers/pageHelpers');
var cmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');
var cmsComponents = require('*/cartridge/scripts/middleware/cmsComponents');

// Add or override logic in Home-Show
server.append('Show', cmsComponents.includeHeaderFooter, function (req, res, next) {
    var constants = require('*/cartridge/config/cmsConstants');
    var viewData = res.getViewData();
    viewData.cmsHelper = cmsHelper;
    viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');

    // Fetch CMS data from Contentstack
    var queryData = {};
    queryData.includes = [
        'components.banner.existing_banner',
        'components.newsletter.existing_newsletter',
    ];
    var pageData = pageHelpers.getPage(constants.HOME_PAGE, req, queryData);

    if (!empty(pageData)) {
        viewData.cmsData = pageData;
    }

    viewData.isLivePreview = cmsHelper.isLivePreviewEnabled();
    res.setViewData(viewData);
    return next();
}, pageMetaData.computedPageMetaData);


server.append(
    'ErrorNotFound',
    cmsComponents.includeHeaderFooter, function (req, res, next) {
        var constants = require('*/cartridge/config/cmsConstants');
        var viewData = res.getViewData();
        viewData.cmsHelper = cmsHelper;
        viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
        var queryData = {};
        queryData.query = '{"sfra_content_id":"error"}';
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
        res.setStatusCode(404);
        res.render('error/notFound');
        next();
    }
);

module.exports = server.exports();
