var express = require('express');
var configs = require('./server/config');
var SessionStore = require('express-mysql-session');
var session = require('express-session')({
    key: 'google_data',
    secret: 'google_data_secret',
    resave: true,
    cookie: {
        path: "/",
        httpOnly: true,
        maxAge: null
    },
    saveUninitialized: true,
    store: new SessionStore(configs.database)
});
var app = express();
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('./server/utiles/local_auth');
var errorHandler = require('./server/utiles/error');
var routes = require('./server/router/router');
var bodyParser = require('body-parser');


app.use(express.static('./public'));

app.use(morgan('dev'));

app.use(cookieParser());

app.use(
    session
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

var PORT = 8866;
var server = app.listen(PORT, function (err) {
	console.log("Server run on port:", PORT);
});

routes.socket(server)

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    next();
});
app.use(errorHandler);
app.use('/', require('./server/router/routes/authorization').loginCheck, routes.http);

