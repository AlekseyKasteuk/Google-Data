/**
 * Created by alexeykastyuk on 3/21/16.
 */
var googleAuth = require('../../utiles/google_auth');
var async = require('async');
var connection = require('../../utiles/connection');

var methods = {
    googleGetUrl: function (req, res) {
        async.waterfall([
            googleAuth.getUrl
        ], function (err, result) {
            res.redirect(result);
        });
    },
    googleAccessToken: function (req, res) {
        async.waterfall([
            googleAuth.getAccessToken.bind(null, req.query.code)
        ], function (err, result) {
            res.redirect('/#/');
        });
    }
};

module.exports = function (method, req, res, next) {
    try {
        var query = "SELECT id FROM User WHERE username = ? and password = ? LIMIT 1";
        connection.query(query, [req.session.passport.user.username, req.session.passport.user.password],
            function (err, user) {

                if (err || !user) {
                    res.redirect('/#/');
                    return;
                }
                if (!user.length) {
                    res.redirect('/#/');
                    return;
                }

                methods[method](req, res, next);

        })
    } catch (e) {
        res.redirect('/#/');
    }
};