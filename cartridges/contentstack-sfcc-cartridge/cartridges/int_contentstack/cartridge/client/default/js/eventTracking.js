'use strict';



/**
 * Track a conversion event.
 */
function trackImpression(url, experiences) {
    var eventData = {
        type: 'IMPRESSION',
        experiences: experiences,        
    };
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(eventData),
        success: function (response) {
            console.log('Impression event tracked successfully:', response.events);
        },
        error: function (xhr, status, error) {
            console.error('Error tracking impression event:', error);
        }
    });
}


/**
 * Track a custom event.
 */
function trackEvent(url, eventKey, experiences) {
    var eventData = {
        type: 'EVENT',
        eventKey: eventKey,
        experiences: experiences,
    };
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(eventData),
        success: function (response) {
            console.log('Event ' + eventKey + ' tracked successfully:', response.events);
        },
        error: function (xhr, status, error) {
            console.error('Error tracking event:',eventKey,  error);
        }
    });
}

module.exports = function () {
    $('body').on('click', '*[data-event-tracking="true"]', function (event) {
        // trackConversion($(this).data('experience-id'), $(this).data('variant-id'));
        // trackEvent('CLICK', $(this).data('experience-id'), $(this).data('variant-id'));

        trackEvent($(this).data('tracking-url'), $(this).data('event-key'), $(this).data('experiences'));
    });

    $(function () {
        $('[data-tracking-impression="true"]').each(function () {
            trackImpression($(this).data('tracking-url'), $(this).data('experiences'));
        });
    });
}
