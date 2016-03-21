/**
 * Created by alexeykastyuk on 3/19/16.
 */
var passportLocal = require('../../utiles/local_auth');
var connection = require('../../utiles/connection');
var encryption = require('../../utiles/encryption');

module.exports.login = function (req, res, next) {
	//console.log(req.session);
	passportLocal.authenticate('local', function (err, user) {
		if (err) { return next(err); }

		if (!user) { return res.status(404).send('There is no such user.'); }

		req.logIn(user, function (err) {

			if (err) { return next(err); }
			return res.status(200).end();

		});

	})(req, res, next);
};

module.exports.checkLogin = function (user) {
	try {
		var query = "SELECT id FROM User WHERE username = ? AND password = ? LIMIT 1";
		connection.query(query, [user.username, user.password], function(err, user) {
			if (err || !user.length) { throw new Error('No user'); }
		})
	} catch (e) {
		//console.log(e)
		return false;
	}
	return true;
};

module.exports.checkLoginRest = function (req, res, next) {
	try {
		console.log(req.session)
		var query = "SELECT first_name, last_name, username, birth_date, avatar_url FROM User WHERE username = ? AND password = ? LIMIT 1";
		connection.query(query, [req.session.passport.user.username, req.session.passport.user.password], function(err, user) {
			if (err || !user.length) { throw new Error('No user'); }
			user = user[0];
			if (!user.avatar_url) { user.avatar_url = "/avatars/unknown_user.gif" }
			res.status(200).send(user);
		})
	} catch (e) {
		res.status(401).send('Authorization failed');
	}
};

module.exports.logout = function (req, res) {
	console.log(req);
	req.logout();
	res.status(200).end();
};

module.exports.createNewAccount = function (req, res, next) {
	try {
		console.log(req.body);
		var query = "INSERT INTO User (first_name, last_name, username, password, birth_date) VALUES (?,?,?,?,?)";
		connection.query(query, [req.body.first_name, req.body.last_name, req.body.username, encryption(req.body.password), req.body.birth_date], function (err) {
			console.log(err);
			if (err) { res.status(400).send('Error in creation new account.') }
			res.status(200).end();
		})
	} catch (e) {
		next();
	}
};