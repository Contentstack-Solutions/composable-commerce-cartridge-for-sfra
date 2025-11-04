'use strict';

var server = require('server');
var base = module.superModule;
var cmsComponents = require('*/cartridge/scripts/middleware/cmsComponents');
var cmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');

server.extend(base);

server.append(
    'Header',
    cmsComponents.includeHeaderFooter,
    function (req, res, next) {
        var viewData = res.getViewData();
        viewData.cmsHelper = cmsHelper;
        viewData.cmsUtils = require('*/cartridge/scripts/lib/custom-utils');
        return next();
    }
);

module.exports = server.exports();
