/**
 * Created by alexeykastyuk on 3/19/16.
 */
var connection = require('./connection');
var googleBatch = require('google-batch');
var google = googleBatch.require('googleapis');
var plus = google.plus('v1');
var gmail = google.gmail('v1');
var OAuth2Client = google.auth.OAuth2;
var profileRedirectUrl = require('../config').profile_redirect_url;
var encryption = require('./encryption');
var async = require('async');
var query = 'SELECT client_id, client_secret, redirect_url FROM googlecredentials';

module.exports = {
    getUrl: function (callback) {
        connection.query(query, function (err, data) {
            if (err || !data) {
                callback(null, '/#/configuration_error');
            }
            data = data[0]
            var oauth2Client = new OAuth2Client(data.client_id, data.client_secret, data.redirect_url);
            var scopes = [
                'https://www.googleapis.com/auth/plus.me',
                'https://www.googleapis.com/auth/plus.login',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/tasks',
                'https://mail.google.com/',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/gmail.labels',
                'https://www.googleapis.com/auth/gmail.compose',
                'https://www.googleapis.com/auth/gmail.insert'
            ];

            var url = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes
            });

            callback(null, url);
        });
    },
    getAccessToken: function(req, callback) {
        var code = req.query.code;
        console.log(code);
        connection.query(query, function (err, data) {
            if (err || !data) {
                callback(null, profileRedirectUrl);
            }
            data = data[0];
            var oauth2Client = new OAuth2Client(data.client_id, data.client_secret, data.redirect_url);
            oauth2Client.getToken(code, function(err, tokens) {
                if (err || !tokens) {
                    callback(null, profileRedirectUrl);
                }
                oauth2Client.setCredentials({
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token
                });
                plus.people.get({userId: 'me', auth: oauth2Client}, function (err, result) {
                    if (err) { callback(null, profileRedirectUrl); }
                    var insert = "CALL add_new_external_account(?,?,?,?,?,?)";
                    connection.query(insert,    [req.session.passport.user.username,
                                                encryption(req.session.passport.user.password),
                                                tokens.access_token, tokens.refresh_token, result.id, 'Google'], function (err, result) {
                        console.log(err, result);
                        callback(null, profileRedirectUrl);
                    });
                    callback(null, profileRedirectUrl);
                });
            });
        });
    },
    getProfiles: function (res, credentials) {
        connection.query(query, function (err, data) {
            if (err || !data) { res.status(500).send('Google Account credationals was lost'); }
            if (!data[0]) { res.status(500).send('Google Account credationals was lost'); }
            data = data[0];
            async.parallel(credentials.map(function (credential) {
                return function (callback) {
                    var oauth2Client = new OAuth2Client(data.client_id, data.client_secret, data.redirect_url);
                    oauth2Client.setCredentials({
                        refresh_token: credential.refresh_token
                    });
                    console.log(oauth2Client);
                    oauth2Client.refreshAccessToken(function(err, token) {
                        if (err || !token) { callback(null, {}); return; }
                        var update = "UPDATE External_Account SET access_token = ?, refresh_token = ? WHERE id = ?";
                        connection.query(update, [token.access_token, token.refresh_token, credential.id], function (err) {
                            if (err) { callback(null, {}); }
                            oauth2Client.setCredentials({
                                refresh_token: token.refresh_token,
                                access_token: token.access_token
                            });
                            plus.people.get({userId: 'me', auth: oauth2Client}, function (err, user) {

                                if (err || !user) { callback(null, { error: 'Error with getting user' }); return; }

                                var result = {
                                    id: credential.id,
                                    email: user.emails[0].value,
                                    displayName: user.displayName,
                                    avatar: user.image.url,
                                    link: user.url,
                                    isCurrent: !!(credential.is_current - 0)
                                };

                                callback(null, result);

                            });
                        });
                    });
                }
            }), function (err, results) {

                res.status(200).send(results)
            });

            //var batch = new googleBatch();
            //credentials.forEach(function (c) {
            //    batch.add(plus.people.get({userId: 'me', googleBatch : true,
            //        auth: new OAuth2Client(data.client_id, data.client_secret, data.redirect_url).setCredentials({
            //            access_token: c.access_token,
            //            refresh_token: c.refresh_token
            //        })}));
            //});
            //batch.exec(function (error, responses, errorDetails) {
            //    console.log(error, responses);
            //    res.status(200).send([]);
            //})
        });
    }
};