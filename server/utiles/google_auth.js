/**
 * Created by alexeykastyuk on 3/19/16.
 */
var connection = require('./connection');
var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var query = 'SELECT client_id, client_secret, redirect_url FROM googlecredentials';

module.exports = {
    getUrl: function (callback) {
        connection.query(query, function (err, data) {
            data = data[0]
            var oauth2Client = new OAuth2Client(data.client_id, data.client_secret, data.redirect_url);
            var scopes = [
                'https://www.googleapis.com/auth/calendar'
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
            data = data[0]
            var oauth2Client = new OAuth2Client(data.client_id, data.client_secret, data.redirect_url);
            oauth2Client.getToken(code, function(err, tokens) {
                console.log(tokens);
                callback(null, tokens);
            });
        });
    }
}