/**
 * Created by alexeykastyuk on 3/21/16.
 */
var googleAuth = require('../../utiles/google_auth');
var async = require('async');
var connection = require('../../utiles/connection');
var profileRedirectUrl = require('../../config').profile_redirect_url;
var encryption = require('../../utiles/encryption');

module.exports.googleGetUrl = function (req, res) {
    async.waterfall([
        googleAuth.getUrl
    ], function (err, result) {
        res.redirect(result);
    });
};
module.exports.googleAccessToken = function (req, res) {
    async.waterfall([
        googleAuth.getAccessToken.bind(null, req)
    ], function (err, result) {
        res.redirect(profileRedirectUrl + "?account=google");
    });
};
module.exports.getUserProfile = function (req, res, next) {
    console.log(req.query);
    switch (req.query.profile) {
        case "internal":
            var query = "SELECT username, first_name, last_name, birth_date, avatar_url, email FROM get_user_internal_info " +
                "WHERE username = ? AND password = ?";
            connection.query(query, [req.session.passport.user.username, encryption(req.session.passport.user.password)],
                function (err, result) {
                    console.log(err, result);
                    if (err || !result) { return next(); }
                    if (!result.length) { return next(); }
                    result = result[0];
                    if(!result.avatar_url) { result.avatar_url = "/avatars/unknown_user.gif" }
                    res.status(200).send(result);
                });
            break;
        case "google":
            var query = "SELECT id, access_token, refresh_token, is_current FROM get_user_external_accounts_info " +
                "WHERE username = ? AND password = ? AND name = 'Google'";
            connection.query(query, [req.session.passport.user.username, encryption(req.session.passport.user.password)],
                function (err, result) {
                    if (err || !result) { return next(); }
                    googleAuth.getProfiles(res, result);
                });
            break;
        default:
            res.status(404).send("Unknown service");
            break;
    }
};

module.exports.setAvatar = function (req, res, next) {
    var query = "UPDATE User SET avatar_url = ? WHERE username = ? and password = ?";
    connection.query(query,
            [req.files.file.path.split('Google_Data/public')[1],
            req.session.passport.user.username,
            encryption(req.session.passport.user.password)], function (err) {
            if (err) { return next() }
            res.status(200).send(req.files.file.path.split('Google_Data/public')[1]);
        });
};

module.exports.googleUpdateCurrentUser = function (req, res, next) {
    var query = "UPDATE External_Account SET is_current = 0 WHERE user_id = (SELECT id FROM User WHERE username = ? LIMIT 1)";
    connection.query(query, [req.session.passport.user.username], function (err) {
        if (err) { return next(); }
        if (req.body.id > 0) {
            query = "UPDATE External_Account SET is_current = 1 WHERE id = ?";
            connection.query(query, [req.body.id], function (err) {
                if (err) { return next(); }
                res.status(200).send('Done');
            });
        }
    });
};

module.exports.updateInternalProfile = function (req, res, next) {
    var query = "UPDATE User SET first_name = ?, last_name = ?, birth_date = ?, email = ? WHERE username = ?";

    connection.query(query, [req.body.first_name, req.body.last_name, req.body.birth_date, req.body.email, req.session.passport.user.username], function (err, result) {
        console.log(err, result);
        res.status(200).send();
    });
};