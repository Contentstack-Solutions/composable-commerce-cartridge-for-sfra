'use strict';

var focusHelper = require('base/components/focus');

/**
 * Renders a modal window that will track the users consenting to accepting site tracking policy
 */
function showConsentModal() {
    var trackingConsentData = $('.tracking-consent');
    if (!trackingConsentData.data('caonline')) {
        return;
    }

    var urlContent = trackingConsentData.data('url');
    // Append the current query string to the content URL, it already contains a '?'
    // ?cid=tracking_hint
    urlContent += window.location.search.replace('?', '&');
    var urlAccept = trackingConsentData.data('accept');
    var urlReject = trackingConsentData.data('reject');
    var textYes = trackingConsentData.data('accepttext');
    var textNo = trackingConsentData.data('rejecttext');
    var textHeader = trackingConsentData.data('heading');
    var tokenName = trackingConsentData.data('tokenname');
    var token = trackingConsentData.data('token');
    var headerCslp = trackingConsentData.data('heading-cslp');
    var acceptCslp = trackingConsentData.data('accept-cslp');
    var rejectCslp = trackingConsentData.data('reject-cslp');

    var htmlString =
        '<!-- Modal -->' +
        '<div class="modal show" id="consent-tracking" aria-modal="true" role="dialog" style="display: block;">' +
        '<div class="modal-dialog">' +
        '<!-- Modal content-->' +
        '<div class="modal-content">' +
        '<div class="modal-header"' +
        headerCslp +
        '>' +
        textHeader +
        '</div>' +
        '<div class="modal-body"></div>' +
        '<div class="modal-footer">' +
        '<div class="button-wrapper">' +
        '<button class="affirm btn btn-primary" data-url="' +
        urlAccept +
        '" autofocus data-dismiss="modal" ' +
        acceptCslp +
        '>' +
        textYes +
        '</button>' +
        '<button class="decline btn btn-primary" data-url="' +
        urlReject +
        '" data-dismiss="modal" ' +
        rejectCslp +
        '>' +
        textNo +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $.spinner().start();
    $('body').append(htmlString);

    $.ajax({
        url: urlContent,
        type: 'get',
        dataType: 'html',
        success: function (response) {
            if (response.includes('class="modal-dialog"')) {
                $('#consent-tracking').html(response);
            } else {
                $('.modal-body').html(response);
            }
            $('#consent-tracking').modal('show');
        },
        error: function () {
            $('#consent-tracking').remove();
        }
    });

    $(document).on('click', '#consent-tracking .button-wrapper button', function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        // Append the current query string to the content URL, it already contains a '?'
        // ?cid=tracking_hint
        url += window.location.search.replace('?', '&');
        var data = {};
        data[tokenName] = token;
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            dataType: 'json',
            success: function (response) {
                // Only hide modal if the operation is successful - don't want to give a false impression
                if (response.success) {
                    $('#consent-tracking').remove();
                    $.spinner().stop();
                }
            },
            error: function (err) {
                // Expected error response is for CSRF failure, which will include a redirect to CSRF-Fail
                if (err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                }
            }
        });
    });
}

module.exports = function () {
    if ($('.consented').length === 0 && $('.tracking-consent').hasClass('api-true')) {
        showConsentModal();
    }

    if ($('.tracking-consent').hasClass('api-true')) {
        $('.tracking-consent').click(function () {
            showConsentModal();
        });
    }

    $('body').on('shown.bs.modal', '#consent-tracking', function () {
        $('#consent-tracking').siblings().attr('aria-hidden', 'true');
        $('#consent-tracking .affirm').focus();
    });

    $('body').on('hidden.bs.modal', '#consent-tracking', function () {
        $('#consent-tracking').siblings().attr('aria-hidden', 'false');
    });

    $('body').on('keydown', '#consent-tracking', function (e) {
        var focusParams = {
            event: e,
            containerSelector: '#consent-tracking',
            firstElementSelector: '.affirm',
            lastElementSelector: '.decline',
            nextToLastElementSelector: '.affirm'
        };
        focusHelper.setTabNextFocus(focusParams);
    });
};
