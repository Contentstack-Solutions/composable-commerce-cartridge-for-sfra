'use strict';

var server = require('server');
server.extend(module.superModule);

var pageHelpers = require('*/cartridge/scripts/helpers/pageHelpers');
var constants = require('*/cartridge/config/cmsConstants');


var cmsComponents = require('*/cartridge/scripts/middleware/cmsComponents');
var cmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');
var cmsUtils = require('*/cartridge/scripts/lib/custom-utils');

/**
 * ConsentTracking-GetContent : This endpoint is called to load the consent tracking content
 * @param {querystringparameter} - cid -  The value of this is a string. This is the internal ID of the content asset used for consent message
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.append('GetContent', function (req, res, next) {
    var consentBody;
    if (req.querystring.live_preview) {
        var consentData = pageHelpers.getPage(constants.TRACKING_CONSENT, req);
        consentBody = JSON.stringify({
            body: cmsHelper.rteToHtml(consentData.consent_text),
            body_cslp: cmsUtils.cslp(consentData, 'consent_text'),
            title: consentData.heading,
            title_cslp: cmsUtils.cslp(consentData, 'heading'),
            accept: consentData.accept_button_label,
            accept_cslp: cmsUtils.cslp(consentData, 'accept_button_label'),
            decline: consentData.decline_button_label,
            decline_cslp: cmsUtils.cslp(consentData, 'decline_button_label')
        });
    } else {
        consentBody = req.session.privacyCache.get('consentBody');
    }

    if (!empty(consentBody)) {
        var cmsContent = {};
        cmsContent = JSON.parse(consentBody);
        res.render('components/content/consentModal', {
            content: cmsContent
        });
    } else {
        var ContentMgr = require('dw/content/ContentMgr');
        var ContentModel = require('*/cartridge/models/content');
        var apiContent = ContentMgr.getContent(req.querystring.cid);
        if (apiContent) {
            var content = new ContentModel(
                apiContent,
                'components/content/contentAssetInc'
            );
            if (content.template) {
                res.render(content.template, { content: content });
            }
        }
    }
    next();
});

/**
 * ConsentTracking-Check : This endpoint is called every time a storefront page is rendered
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.append('Check', cmsComponents.includeTrackingConsent, function (req, res, next) {
    var viewData = res.getViewData();
    viewData.cmsUtils = cmsUtils;
    if (!empty(cmsHelper.rteToHtml(viewData.consentData.consent_text))) {
        var consentBody = JSON.stringify({
            body: cmsHelper.rteToHtml(viewData.consentData.consent_text),
            body_cslp: cmsUtils.cslp(viewData.consentData, 'consent_text'),
            title: viewData.consentData.heading,
            title_cslp: cmsUtils.cslp(viewData.consentData, 'heading'),
            accept: viewData.consentData.accept_button_label,
            accept_cslp: cmsUtils.cslp(viewData.consentData, 'accept_button_label'),
            decline: viewData.consentData.decline_button_label,
            decline_cslp: cmsUtils.cslp(viewData.consentData, 'decline_button_label')
        });
        req.session.privacyCache.set('consentBody', consentBody);
    }
    next();
});

module.exports = server.exports();
