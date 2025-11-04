'use strict';

// Import required modules
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Site = require('dw/system/Site');
var Locale = require('dw/util/Locale');
var ContentstackManager = require('*/cartridge/scripts/content/ContentstackManager');

var getCmsLocale = function () {
    var currentLocale = Locale.getLocale(request.locale); // Get the current locale
    var language = currentLocale.language; // e.g., "en"
    var country = currentLocale.country;
    var locale =
        currentLocale && currentLocale.language && currentLocale.country
            ? (language + '-' + country).toLowerCase()
            : 'en-us'; // Default to "en-us" if locale is not found
    return locale;
};

/**
 * Appends base request data required for Contentstack API calls.
 * This includes API keys, environment, locale, and other configuration values.
 *
 * @param {Object} appendRequestData - The request data to which base data will be appended.
 * @returns {Object} The updated request data object.
 */
var appendBaseRequestData = function (appendRequestData) {
    var sitePrefs = Site.getCurrent();

    var requestData = {
        endpoint: sitePrefs.getCustomPreferenceValue('cmsApiEndpoint'),
        preview_endpoint: sitePrefs.getCustomPreferenceValue(
            'cmsPreviewApiEndpoint'
        ),
        access_token: sitePrefs.getCustomPreferenceValue('cmsAccessToken'),
        api_key: sitePrefs.getCustomPreferenceValue('cmsApiKey'),
        environment: sitePrefs.getCustomPreferenceValue('cmsEnvironment'),
        branch: sitePrefs.getCustomPreferenceValue('cmsBranch'),
        edge_api_endpoint:
            sitePrefs.getCustomPreferenceValue('cmsEdgeApiEndpoint'),
        personalize_project_uid: sitePrefs.getCustomPreferenceValue('cmsPersonalizeProjectUID'),
        preview_token: sitePrefs.getCustomPreferenceValue('cmsPreviewToken'),
        locale: getCmsLocale() // Get the current locale
    };

    // Merge the base request data with the provided request data
    if (appendRequestData) {
        Object.assign(appendRequestData, requestData);
    }
    return appendRequestData;
};

/**
 * Determines the appropriate host URL based on whether live preview is enabled.
 *
 * @param {Object} requestData - The request data object.
 * @returns {string} The host URL.
 */
var getHost = function (requestData) {
    var host = requestData.endpoint;
    if (requestData && requestData.live_preview) {
        host = requestData.preview_endpoint;
    }
    return host;
};

/**
 * Prepares the headers for the Contentstack API request.
 *
 * @param {dw.svc.Service} svc - The service instance.
 * @param {Object} requestData - The request data object.
 */
var prepareHeaders = function (svc, requestData) {
    svc.addHeader('Content-Type', 'application/json');
    svc.addHeader('api_key', requestData.api_key);
    svc.setRequestMethod(requestData.method);

    // Add headers for personalization or live preview if applicable
    if (requestData.variant) {
        svc.addHeader('x-cs-variant-uid', requestData.variant);
    }
    if (requestData && requestData.live_preview) {
        svc.addHeader('preview_token', requestData.preview_token);
        svc.addHeader('live_preview', requestData.live_preview);
        svc.addHeader('content_type', requestData.content_type_uid);
        if (requestData.preview_timestamp) {
            svc.addHeader(
                'preview_timestamp',
                decodeURIComponent(requestData.preview_timestamp)
            );
        }
    } else {
        svc.addHeader('access_token', requestData.access_token);
    }
};

/**
 * Creates a service for retrieving the personalization manifest from Contentstack.
 *
 * @param {Object} requestData - The request data object.
 * @param {Object} events - An array of events for personalization.
 * @param {string} userId - The user ID for personalization.
 * @returns {dw.svc.Service} The personalization service instance.
 */
var getPersonalizeService = function (requestData, events, userId) {
    var pageUrl = requestData.pageUrl;
    var edgeApiEndpoint = requestData.edge_api_endpoint;
    var personalizeProjectUid = requestData.personalize_project_uid;

    var body = null;
    var endpoint = edgeApiEndpoint + '/manifest';
    var method = 'GET';
    if (events && events.length > 0) {
        endpoint = edgeApiEndpoint + '/events';
        method = 'POST';
        body = JSON.stringify(events);
    }

    var personalizeService = LocalServiceRegistry.createService(
        'Contentstack.Personalize.Service',
        {
            createRequest: function (svc) {
                svc.setURL(endpoint);
                svc.addHeader('Content-Type', 'application/json');
                svc.addHeader('x-project-uid', personalizeProjectUid);
                if (userId) {
                    svc.addHeader('x-cs-personalize-user-uid', userId);
                }
                svc.addHeader('x-page-url', pageUrl);
                svc.setRequestMethod(method);
                return body;
            },
            parseResponse: function (svc, httpClient) {
                var result = {};
                try {
                    result = JSON.parse(httpClient.text);
                } catch (e) {
                    result = httpClient.text;
                }
                return result;
            },
            getRequestLogMessage: function (request) {
                return JSON.stringify(request);
            },
            getResponseLogMessage: function (response) {
                return response.text;
            }
        }
    );
    return personalizeService;
};

/**
 * Creates a service for retrieving content from Contentstack.
 *
 * @param {Object} requestData - The request data object.
 * @returns {dw.svc.Service} The content service instance.
 */
var getContentService = function (requestData) {
    var contentstackService = LocalServiceRegistry.createService(
        'Contentstack.Content.Service',
        {
            createRequest: function (svc) {
                var host = getHost(requestData);
                prepareHeaders(svc, requestData);
                // Construct the URL for the content request
                // &include[]=categories&include[]=tags
                var includes = requestData.includes
                    ? requestData.includes
                        .map(function (include) {
                            return 'include[]=' + include;
                        })
                        .join('&')
                    : '';
                includes = includes ? '&' + includes : '';
                var url =
                    host +
                    '/' +
                    requestData.apiSlug +
                    '?environment=' +
                    requestData.environment +
                    '&locale=' +
                    requestData.locale +
                    '&query=' +
                    requestData.encodedQuery +
                    includes +
                    '&include_dimension=true&include_applied_variants=true&include_metadata=true';
                svc.setURL(url);
                return null;
            },
            parseResponse: function (svc, httpClient) {
                var result = {};
                try {
                    result = JSON.parse(httpClient.text);
                } catch (e) {
                    result = httpClient.text;
                }
                return result;
            },
            getRequestLogMessage: function (request) {
                return JSON.stringify(request);
            },
            getResponseLogMessage: function (response) {
                return response.text;
            }
        }
    );
    return contentstackService;
};

/**
 * Retrieves the personalization manifest from Contentstack.
 * @param {Object} requestData - The request data object.
 * @param {string} userId - The user ID for personalization.
 * @returns {Object|null} The personalization manifest or null if the request fails.
 */
var getPersonalizeManifest = function (requestData, userId) {
    var cmsRequestData = appendBaseRequestData(requestData);
    var personalizeService = getPersonalizeService(cmsRequestData, [], userId);
    var result = personalizeService.call();
    return result.ok ? result.object : null;
};

/**
 *  Tracks events for personalization in Contentstack.
 *  @param {Object} requestData - The request data object.
 *  @param  {string} eventType - An array of events to be tracked.
 *  @param {string} userId - The user ID for personalization.
 *  @returns {Object|null} The response object or null if the request fails.
 */
var trackEventsFromRequest = function (requestData, eventType, userId) {
    if (
        requestData.userId != null &&
        requestData.live_preview == null &&
        requestData.experiences &&
        requestData.userId
    ){
        var events = [];
        for (var j = 0; j < requestData.experiences.length; j++) {
            var experience = requestData.experiences[j];
            if (experience.activeVariantShortUid) {
                events.push({
                    type: eventType,
                    experienceShortUid: experience.shortUid,
                    variantShortUid: experience.activeVariantShortUid
                });
            }
        }

        var cmsRequestData = appendBaseRequestData(requestData);
        var personalizeService = getPersonalizeService(
            cmsRequestData,
            events,
            userId
        );
        var result = personalizeService.call();
        return result.ok ? result.object : null;
    }
    return null;
};

/**
 *  Tracks events for personalization in Contentstack. 
 *  @param {Object} events - The request data object. 
 *  @param {string} userId - The user ID for personalization.
 *  @returns {Object|null} The response object or null if the request fails.
 */
var trackEvents = function (events, userId) {    
    try{
        var cmsRequestData = appendBaseRequestData({});
        var personalizeService = getPersonalizeService(
            cmsRequestData,
            events,
            userId
        );
        var result = personalizeService.call();
        return result.ok;
    } catch(e){
        return false;
    }   
    
};

/**
 * Appends personalization data to the request data object.
 *
 * @param {Object} requestData - The request data object.
 * @param {string} userId - The user ID for personalization. 
 */
var appendPersonalizeData = function (requestData, userId) {
    // Get the personalization manifest from Contentstack
    var manifest = getPersonalizeManifest(requestData, userId);
    if (manifest && manifest.experiences && manifest.experiences.length > 0) {
        // TODO: We only have one experience for now, consider revisiting this code
        // TODO: if we need to support multiple experiences

        if (manifest.experiences && manifest.experiences.length > 0) {
            var variants = [];
            for (var i = 0; i < manifest.experiences.length; i++) {
                var experience = manifest.experiences[i];
                if (experience.activeVariantShortUid) {
                    variants.push(
                        'cs_personalize_' +
                            experience.shortUid +
                            '_' +
                            experience.activeVariantShortUid
                    );
                }
            }

            requestData.experiences = manifest.experiences;
            requestData.manifest = manifest;
            requestData.variant = variants.join(',');
            requestData.userId = userId;
        }
        // We trigger the impression here, but it can also be triggered from the isml template using JS and a fetch call or similar
        // This is clearner as there's no exposure of the token to the client side
    }
};

/**
 * Constructs the request data object based on the type of request.
 * @param {Object} apiData - The API data object containing necessary parameters.
 * @param {string} type - The type of request (e.g., "url", "taxonomy").
 * @param {Object} req - The local request object.
 * @param {Object} request - The global controller request object.
 * @returns {Object} The constructed request data object.
 */
var getRequestData = function (apiData, type, req, request) {
    var sitePrefix = '/s/' + Site.current.ID;
    var result = Object.assign({}, apiData);
    result = Object.assign(result, {
        pageUrl:
            'https://' +
            req.httpHeaders.get('x-is-host') +
            req.httpHeaders.get('x-is-path_info') +
            '?' +
            req.httpHeaders.get('x-is-query_string'), // Get the URL from the request headers
        queryType: type,
        method: 'GET'
    });

    // TODO: REVIEW THIS FOR BETTER DESIGN
    switch (type) {
        case 'product-url':
            // Content Type Based Queries
            var slugUrl = req.httpHeaders
                .get('x-is-path_info')
                .replace(sitePrefix, ''); // Get the URL from the request headers
            result = Object.assign(result, {
                query: '{"url":"' + slugUrl + '"}'
            });
            break;

        // TODO: PARAMETERIZE THIS
        case 'taxonomy':
            // Taxonomy-Based Queries
            result = Object.assign(result, {
                queryType: 'taxonomy',
                query: '{ "taxonomies.page_types" : "pdp", "_content_type_uid": "product_page" }',
                apiSlug: apiData.apiSlug || 'v3/taxonomies'
            });
            break;

        default:
            // Default to Content Type Based Queries
            result = Object.assign(result, {
                queryType: 'content_type',
                query: apiData.query,
                content_type_uid: apiData.content_type_uid,
                apiSlug:
                    apiData.apiSlug ||
                    'v3/content_types/' + apiData.content_type_uid
            });
            break;
    }

    // Encode and decode the query for safe transmission
    if (result.query) {
        var decodedQuery = decodeURIComponent(result.query);
        result.encodedQuery = encodeURIComponent(decodedQuery);
    }

    // Merge additional query string parameters, but we keep the original content type uid
    if (req.querystring) {
        var originalContentTypeUid = result.content_type_uid;
        result = Object.assign(result, req.querystring);
        result.content_type_uid = originalContentTypeUid;
    }

    var userId;
    if (request.httpCookies && request.httpCookies['cs-personalize-user-uid']) {
        // Retrieve user ID from cookies for personalization
        userId = request.httpCookies['cs-personalize-user-uid'].value;
    }
    appendPersonalizeData(result, userId);
    return result;
};

// Exported functions for interacting with Contentstack
module.exports = {
    /**
     * Retrieves CMS data from Contentstack.
     *
     * @param {Object} queryData - The request data object.
     * @param {Object} context - Optional context object for processing.
     * @returns {Object|null} The CMS data or null if the request fails.
     */
    getCmsData: function (queryData, context) {
        var requestData = getRequestData(
            queryData,
            queryData.queryType,
            queryData.req,
            queryData.request
        );
        var cmsRequestData = appendBaseRequestData(requestData);
        var contentstackService = getContentService(cmsRequestData);
        var result = contentstackService.call(cmsRequestData);
        var payload = result.ok ? result.object : null;
        // Enrich the payload
        if (payload && payload.entries && payload.entries.length > 0) {
            var cmsHelper = require('*/cartridge/scripts/helpers/cmsHelper');
            for (var i = 0; i < payload.entries.length; i++) {
                var entry = payload.entries[i];
                if (
                    cmsHelper.isLivePreviewEnabled() &&
                    !queryData.disableLivePreviewTags
                ) {
                    // Add editable tags for live preview
                    var lpUtils = require('*/cartridge/scripts/lib/contentstack-utils');
                    lpUtils.addEditableTags(
                        entry,
                        requestData.content_type_uid,
                        false,
                        requestData.locale
                    );
                }
                // Enrich each entry in the payload
                entry = ContentstackManager.processPayload(
                    entry,
                    requestData.content_type_uid,
                    context
                );
                payload.entries[i] = entry;
                if (entry._applied_variants) {
                    // trackEventsFromRequest(requestData, 'IMPRESSION', requestData.userId);
                    // Augment the entry object with experiences
                    entry.$exp = requestData.variant.replace(/cs_personalize_/g, '');
                }
            }
        }

        return payload;
    },

    // Utility function to append base request data
    appendBaseRequestData: appendBaseRequestData,
    getRequestData: getRequestData,
    getCmsLocale: getCmsLocale,
    trackEventsFromRequest: trackEventsFromRequest,
    trackEvents: trackEvents

};
