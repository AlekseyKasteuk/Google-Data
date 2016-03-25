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
        googleAuth.getAccessToken.bind(null, req.query.code)
    ], function (err, result) {
        res.redirect(profileRedirectUrl);
    });
};
module.exports.getUserInfo = function (req, res, next) {
    var query = "CALL google_data.get_accounts(?,?)";
    console.log(query);
    connection.query(query, [req.session.passport.user.username, encryption(req.session.passport.user.password)],
                    function (err, result) {
                        if (err || !result) { return next(); }
                        if (result.length != 3) { return next(); }
                        if (!result[0][0]) { return next(); }
                        if(!result[0][0].avatar_url) { result[0][0].avatar_url = "/avatars/unknown_user.gif" }
                        res.status(200).send({
                            info: result[0][0],
                            accounts: result[1]
                        });
                    })
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
}