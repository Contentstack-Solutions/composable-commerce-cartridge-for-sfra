'use strict';

var server = require('server');
var Contentstack = require('*/cartridge/scripts/services/contentstack'); // Service for interacting with Contentstack API

server.post('TrackEvent', server.middleware.https, function (req, res, next) {
    
    try {
        if (!request.httpCookies || !request.httpCookies['cs-personalize-user-uid']
        ) {
            res.setStatusCode(400);
            res.json({ success: false, message: 'Missing required personalize cookies' });
            return next();
        }
        var payload = JSON.parse(req.body || '{}');
        if(!payload || !payload.type){
            res.setStatusCode(400);
            res.json({ success: false, message: 'Missing or invalid payload' });
            return next();
        }
        // Optional: validate required params
        var type = payload.type.toUpperCase() || 'UNKNOWN';
        var events = [];
        var success = false;
        var userId;

        switch(type){
            case 'IMPRESSION':
                if(!payload.experiences){
                    res.setStatusCode(400);
                    res.json({ success: false, message: 'Missing or invalid experiences array' });
                    return next();
                }
                var experiences = payload.experiences.split(',');
                events = [];
                for (var i = 0; i < experiences.length; i++) {
                    var experience = experiences[i];
                    var parts = experience.split('_');
                    var experienceShortUid = parts[0];
                    var variantShortUid = parts[1] || null;
                    events.push({
                        type: 'IMPRESSION',
                        experienceShortUid: experienceShortUid,
                        variantShortUid:variantShortUid,
                    });
                }
                
                // Retrieve user ID from cookies for personalization
                userId = request.httpCookies['cs-personalize-user-uid'].value;
                success = Contentstack.trackEvents(events, userId);
                res.setStatusCode(success ? 200 : 500);
                res.json({
                    success: success,
                    message: success ? 'Events tracked successfully' : 'Failed to track events',
                    events: events
                });
                return next();
                
            case 'EVENT':
                if(!payload.eventKey || typeof payload.eventKey !== 'string'){
                    res.setStatusCode(400);
                    res.json({ success: false, message: 'Missing or invalid eventKey' });
                    return next();
                }
                events = [{
                    type: 'EVENT',
                    eventKey: payload.eventKey,
                }];
                
                
                // Retrieve user ID from cookies for personalization
                userId = request.httpCookies['cs-personalize-user-uid'].value;
                success = Contentstack.trackEvents(events, userId);
                res.setStatusCode(success ? 200 : 500);
                res.json({
                    success: success,
                    message: success
                        ? 'Event tracked successfully'
                        : 'Failed to track event',
                    events: events
                });
                return next();                
                
            default:
                res.setStatusCode(400);
                res.json({ success: false, message: 'Invalid event type: ' + type });
                return next();
        }
        res.setStatusCode(500);
        res.json({ success: false, message: 'Unable to complete event tracking ' + type });
        return next();
    } catch (e) {
        res.setStatusCode(400);
        res.json({ success: false, message: 'Invalid JSON body' });
        return next();
    }
});

module.exports = server.exports();
