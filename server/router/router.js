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
var empty = function () {};

var authModule = require('./routes/authorization');
var profileModule = require('./routes/profile');
var googleDataModule = require('./routes/google_data');
var innerCalendarModule = require('./routes/inner_calendars');

var checkAuthorization = function (sessionID, callback, data) {
    new SessionStore(configs.database)
        .get(sessionID, function (err, session) {
            if (err || !session) {
                socket.emit('authorization_faild', 'msg');
                return;
            }
            if (authModule.checkLogin(session.passport.user) && callback) {
                callback(data, session.passport.user);
            } else {
                socket.emit('authorization_faild', 'msg');
            }
        });
}

router.post('/login', authModule.login);
router.post('/logout', authModule.logout);
router.get('/auth/check', authModule.checkLoginRest);
router.post('/create/account', authModule.createNewAccount);
router.get('/user/info', profileModule.getUserProfile);
router.post('/profile/avatar', multipartMiddleware, profileModule.setAvatar);
router.put('/profile/internal/update', profileModule.updateInternalProfile);

router.get('/google', profileModule.googleGetUrl);
router.put('/google/update', profileModule.googleUpdateCurrentUser);
router.get('/google/authorization', profileModule.googleAccessToken);

router.post('/google/message/threads', googleDataModule.getMessageThreads);
router.get('/google/message/labels', googleDataModule.getMessageLabels);
router.post('/google/message/send', googleDataModule.sendMessage);

router.get('/google/thread/:id', googleDataModule.getMessageThread);
router.put('/thread/label/toggle', googleDataModule.toggleThreadLabel);
router.post('/thread/list/delete', googleDataModule.removeThreads);

router.get('/calendar/list', googleDataModule.getCalendars);

router.post('/calendar/inner/create', innerCalendarModule.createCalendar);


router.post('/events/internal/create', innerCalendarModule.createEvent);

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