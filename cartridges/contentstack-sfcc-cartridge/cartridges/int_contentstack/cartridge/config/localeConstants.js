'use strict';

var countries = require('*/cartridge/config/countries');

module.exports = {
    SUPPORTED_LOCALES_REGEX: new RegExp(countries.map(function (country) {
        return "(" + country.id.toLowerCase().replace('_', '-') + ")";
    }).join("|"))   // e.g. (en-us|es-us)     
};
