/**
 * Created by alexeykastyuk on 3/21/16.
 */
var googleAuth = require('../../utiles/google_auth');
var async = require('async');
var connection = require('../../utiles/connection');
var googleCredentialsQuery = 'SELECT client_id, client_secret, redirect_url FROM googlecredentials';
var googleBatch = require('google-batch');
var google = googleBatch.require('googleapis');
var OAuth2Client = google.auth.OAuth2;

var getGoogleCredentials = function (done) {
    connection.query(googleCredentialsQuery, function (err, data) {
        console.log(err);
        if (err || !data) {  return done(true); }
        if (!data.length) {  return done(true); }
        data = data[0];
        done(null, data);
    });
};

var getExternalAccount = function (username) {
    return function (main, done) {
        var query = "SELECT access_token, refresh_token, id FROM google_data.get_user_external_accounts_info " +
                        "WHERE username = ? and is_current = 1 LIMIT 1";
        connection.query(query, [username], function (err, credential) {
            console.log(err, credential);
            if (err || !credential) { return done(true); }
            if (!credential.length) { return done(true); }
            credential = credential[0];
            done(null, main, credential);
        });
    }
};

var refreshAccessToken = function (main, credential, done) {
    var oauth2Client = new OAuth2Client(main.client_id, main.client_secret, main.redirect_url);
    oauth2Client.setCredentials({
        refresh_token: credential.refresh_token
    });
    oauth2Client.refreshAccessToken(function(err, token) {
        console.log(err);
        if (err || !token) { return done(true); }
        var update = "UPDATE External_Account SET access_token = ?, refresh_token = ? WHERE id = ?";
        connection.query(update, [token.access_token, token.refresh_token, credential.id], function (err) {
            console.log(err);
            if (err) { return done(true); }
            done(null, main, { access_token: token.access_token, refresh_token: token.refresh_token });
        });
    });
};

module.exports = {

    getMessageThreads: function (req, res, next) {
        async.waterfall([
            getGoogleCredentials,
            getExternalAccount(req.session.passport.user.username),
            refreshAccessToken,
            function (main, credential, done) {
                var oauth2Client = new OAuth2Client(main.client_id, main.client_secret, main.redirect_url);
                oauth2Client.setCredentials({
                    refresh_token: credential.refresh_token,
                    access_token: credential.access_token
                });
                google.gmail('v1').users.threads.list({ userId: 'me', auth: oauth2Client, labelIds: req.body.labels }, function (err, result) {
                    done(null, result);
                });
            }
        ], function (err, result) {
            console.log(err, result);
            res.status(200).send(result);
        })
    },

    getMessageLabels: function (req, res, next) {
        async.waterfall([
            getGoogleCredentials,
            getExternalAccount(req.session.passport.user.username),
            refreshAccessToken,
            function (main, credential, done) {
                var oauth2Client = new OAuth2Client(main.client_id, main.client_secret, main.redirect_url);
                oauth2Client.setCredentials({
                    refresh_token: credential.refresh_token,
                    access_token: credential.access_token
                });
                google.gmail('v1').users.labels.list({ userId: 'me', auth: oauth2Client }, function (err, result) {
                    done(null, result);
                });
            }
        ], function (err, result) {
            res.status(200).send(result);
        })
    }

};