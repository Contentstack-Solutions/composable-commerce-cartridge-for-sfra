'use strict';

var server = require('server');
server.extend(module.superModule);

var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var pageHelpers = require('*/cartridge/scripts/helpers/pageHelpers');
var cmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');
var cmsComponents = require('*/cartridge/scripts/middleware/cmsComponents');

server.append('Show', cmsComponents.includeHeaderFooter, function (req, res, next) {
    var constants = require('*/cartridge/config/cmsConstants');
    var viewData = res.getViewData();
    viewData.cmsHelper = cmsHelper;
    viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
    var queryData = {};
    queryData.query = '{"category.data.id":"' + req.querystring.cgid + '"}';
    queryData.includes = [
        'components.banner.existing_banner',
        'components.newsletter.existing_newsletter',
    ];
    queryData.context = {category: viewData.category};
    var pageData = pageHelpers.getPage(constants.CATEGORY_PAGE, req, queryData);

    if (!empty(pageData)) {
        viewData.cmsData = pageData;
    }

    viewData.isLivePreview = cmsHelper.isLivePreviewEnabled();
    res.setViewData(viewData);

    return next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
