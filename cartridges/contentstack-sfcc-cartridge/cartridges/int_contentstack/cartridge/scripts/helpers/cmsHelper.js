'use strict';

var lpUtils = require('*/cartridge/scripts/lib/contentstack-utils');
var Site = require('dw/system/Site');
var sitePrefs = Site.getCurrent();

var renderOption = {
    span: function(node, next) {
        return next(node.children);
    }
};

var rteToHtml = function (doc) {
    var fakeEntry = {
        uid: 'fake',
        field: doc,
    };

    lpUtils.jsonToHTML({
        entry: fakeEntry,
        paths: ['field'],
        renderOption: renderOption,
    });
    return fakeEntry.field;
};

var isLivePreviewEnabled = function () {
    var System = require('dw/system/System');
    var instance = System.getInstanceType();

    if (instance === System.PRODUCTION_SYSTEM || !sitePrefs.getCustomPreferenceValue('cmsEnableLivePreview')) {
        return false;
    }

    return true;
}

module.exports = Object.assign(
    {
        rteToHtml: rteToHtml,
        api_key: sitePrefs.getCustomPreferenceValue('cmsApiKey'),
        environment: sitePrefs.getCustomPreferenceValue('cmsEnvironment'),
        livePreviewUtilsURL: sitePrefs.getCustomPreferenceValue('livePreviewUtilsURL'),
        isLivePreviewEnabled: isLivePreviewEnabled
    },
    lpUtils
);
