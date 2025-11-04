'use strict';

var server = require('server');
server.extend(module.superModule);

server.replace('Start', function (req, res, next) {
    // Option 1: Redirect to Home-Show
    // return res.redirect(URLUtils.url('Home-Show'));

    // Option 2: Call Home-Show controller directly (advanced — not always recommended)
    var homeController = require('*/cartridge/controllers/Home');
    return homeController.Show(req, res, next);
});

module.exports = server.exports();
