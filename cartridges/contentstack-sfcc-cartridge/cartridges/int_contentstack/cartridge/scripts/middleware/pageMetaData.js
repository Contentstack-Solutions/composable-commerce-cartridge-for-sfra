'use strict';

/**
 * Middleware to compute request pageMetaData object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function computedPageMetaData(req, res, next) {
    var viewData = res.getViewData();
    var computedMetaData = {
        title: req.pageMetaData.title,
        description: req.pageMetaData.description,
        keywords: req.pageMetaData.keywords,
        pageMetaTags: []
    };

    req.pageMetaData.pageMetaTags.forEach(function (item) {
        if (item.title) {
            computedMetaData.title = item.content;
        } else if (item.name && item.ID === 'description') {
            computedMetaData.description = item.content;
        } else if (item.name && item.ID === 'keywords') {
            computedMetaData.keywords = item.content;
        } else {
            computedMetaData.pageMetaTags.push(item);
        }
    });
    if (viewData.cmsData && viewData.cmsData.seo) {
        var metaTags = viewData.cmsData.seo;
        computedMetaData.title = metaTags.meta_title || computedMetaData.title;
        computedMetaData.description = metaTags.meta_description || computedMetaData.description;
        computedMetaData.keywords = metaTags.meta_keywords || computedMetaData.description;
        if (metaTags.meta_tags.length > 0) {
            computedMetaData.pageMetaTags = [];
            metaTags.meta_tags.forEach(function (item) {
                var meta = {};
                if (item.meta_type === 'name') {
                    meta.name = true;
                } else if (item.meta_type === 'property') {
                    meta.property = true;
                }
                meta.ID = item.meta_id;
                meta.content = item.meta_content;
                computedMetaData.pageMetaTags.push(meta);
            });
        }
        if (metaTags.meta_robots) {
            computedMetaData.pageMetaTags.push({
                name: true,
                ID: 'robots',
                content: metaTags.meta_robots
            });
        }
    }
    res.setViewData({
        CurrentPageMetaData: computedMetaData
    });
    next();
}

module.exports = {
    computedPageMetaData: computedPageMetaData
};
