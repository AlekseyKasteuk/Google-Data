/**
 * Created by alexeykastyuk on 3/19/16.
 */
var connection = require('./connection');
var google = require('googleapis');
var plus = google.plus('v1');
var gmail = google.gmail('v1');
var OAuth2Client = google.auth.OAuth2;
var profileRedirectUrl = require('../config').profile_redirect_url;
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
    getAccessToken: function(code, callback) {

        connection.query(query, function (err, data) {
            if (err || !data) {
                callback(null, profileRedirectUrl);
            }
            data = data[0]
            var oauth2Client = new OAuth2Client(data.client_id, data.client_secret, data.redirect_url);
            oauth2Client.getToken(code, function(err, tokens) {
                if (err || !tokens) {
                    callback(null, profileRedirectUrl);
                }
                // insert access_token, refresh_token
                oauth2Client.setCredentials({
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token
                });

                console.log(tokens);
                oauth2Client.refreshAccessToken(function(err, tokens) {
                    if (err || !tokens) {
                        callback(null, profileRedirectUrl);
                    }
                    console.log(tokens);
                    callback(null, profileRedirectUrl)
                });
            });
        });
    },
    refreshAccessToken: function (user) {
        connection.query(query, function (err, data) {
            data = data[0];
            var oauth2Client = new OAuth2Client(data.client_id, data.client_secret, data.redirect_url);

        })
    }
}