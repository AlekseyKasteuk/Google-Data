/**
 * Created by alexeykastyuk on 3/19/16.
 */
var router = require('express').Router();
var configs = require('../config');
var SessionStore = require('express-mysql-session');
var cookieParser = require('cookie-parser');
var passport = require('../utiles/local_auth');
var passportSocketIo = require("passport.socketio");
var multipartMiddleware = require('connect-multiparty')({
    uploadDir: __dirname + '/../../public/avatars'
});
var empty = function () {}

var checkAuthorization = function (sessionID, callback, data) {
    new SessionStore(configs.database)
        .get(sessionID, function (err, session) {
            if (err || !session) {
                socket.emit('authorization_faild', 'msg');
                return;
            }
            if (require('./routes/authorization').checkLogin(session.passport.user) && callback) {
                callback(data, session.passport.user);
            } else {
                socket.emit('authorization_faild', 'msg');
            }
        });
}

router.post('/login', require('./routes/authorization').login);
router.post('/logout', require('./routes/authorization').logout);
router.get('/auth/check', require('./routes/authorization').checkLoginRest);
router.post('/create/account', require('./routes/authorization').createNewAccount);
router.get('/user/info', require('./routes/profile').getUserProfile);
router.post('/profile/avatar', multipartMiddleware, require('./routes/profile').setAvatar);

router.get('/google', require('./routes/profile').googleGetUrl);
router.put('/google/update', require('./routes/profile').googleUpdateCurrentUser);
router.get('/google/authorization', require('./routes/profile').googleAccessToken);

router.post('/google/message/threads', require('./routes/google_data').getMessageThreads);
router.get('/google/message/labels', require('./routes/google_data').getMessageLabels);

module.exports = {
    socket: function (server) {
        var io = require('socket.io').listen(server);
        io.use(passportSocketIo.authorize({
            key: 'google_data',
            secret: 'google_data_secret',
            cookieParser: cookieParser,
            passport: passport,
            store: new SessionStore(configs.database),
            success: function (data, message, error, accept) {
                accept(null, true);
            },
            fail: function (data, message, error, accept) {
                accept(null, true);
            }
        }));

        io.on('connection', function (socket) {
            var sessionID = socket.request.sessionID
            socket.on('test', function (data) {
                console.log(checkAuthorization(sessionID));
            });
        });

        return io;
    },
    http: router
};