'use strict';

var Contentstack = require('*/cartridge/scripts/services/contentstack'); // Service for interacting with Contentstack API

/**
 * Retrieves a page entry from Contentstack based on the provided page ID.
 *
 * @param {string} pageId - The UID of the content type to fetch.
 * @param {Object} req - The request object from the controller.
 * @param {Object} queryData - Optional. An Object of related query information.
 * @returns {Object|null} The first entry of the page if found, otherwise null.
 */
function getPage (pageId, req, queryData) {
    if (!pageId) {
        return null; // Return null if no pageId is provided
    }
    queryData = queryData || {};
    var data = Contentstack.getCmsData({
        content_type_uid: pageId,
        apiSlug: 'v3/content_types/' + pageId + '/entries',
        query: queryData.query || null,
        queryType: queryData.queryType || 'default',
        includes: queryData.includes || [],
        req: req,
        request: request, // eslint-disable-line
    }, queryData.context);
    if (data && data.entries && data.entries.length > 0) {
        return data.entries[0];
    }
    return null;

};

module.exports = {
    getPage: getPage
};