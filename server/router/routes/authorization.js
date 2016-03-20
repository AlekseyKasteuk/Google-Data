/**
 * Created by alexeykastyuk on 3/19/16.
 */
var passportLocal = require('../../utiles/local_auth');
var googleAuth = require('../../utiles/google_auth');
var connection = require('../../utiles/connection');
var encryption = require('../../utiles/encryption');
var async = require('async');

module.exports.login = function (req, res, next) {
	//console.log(req.session);
	passportLocal.authenticate('local', function (err, user) {
		if (err) { return next(err); }

		if (!user) { return res.status(401).end(); }

		req.logIn(user, function (err) {

			if (err) { return next(err); }

			return res.status(200).end();

		});

	})(req, res, next);
}

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
}

module.exports.logout = function (req, res) {
	console.log(req);
	req.logout();
	res.status(200).end();
}

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
		res.redirect('/#/');
	});
}