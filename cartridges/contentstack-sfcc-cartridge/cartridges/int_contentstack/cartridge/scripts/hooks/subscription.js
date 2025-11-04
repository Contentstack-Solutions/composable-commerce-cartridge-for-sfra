'use strict';

/**
 * Subscribes a user to the newsletter by creating a custom object with the provided email.
 *
 * @param {string} email - The email address to subscribe to the newsletter.
 * @returns {void}
 */
function subscribe(email) {
    try {
        if (email) {
            var Transaction = require('dw/system/Transaction');
            var CustomObjectMgr = require('dw/object/CustomObjectMgr');

            Transaction.wrap(function () {
                CustomObjectMgr.createCustomObject('newsletter', email);
            });
        }
    } catch (error) {
        var Logger = require('dw/system/Logger');
        var logger = Logger.getLogger('Contentstack', 'newsletter');

        logger.warn('Error when trying create newsletter subscription. Error message: {0} - Email: {1}', error, email);
    }
}

module.exports = {
    subscribe: subscribe
};
