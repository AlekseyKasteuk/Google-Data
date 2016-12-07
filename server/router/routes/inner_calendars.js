/**
 * Created by alexeykastyuk on 5/16/16.
 */
var connection = require('../../utiles/connection');
var moment = require('moment');

module.exports.createCalendar = function (req, res, next) {
    var query = "INSERT INTO Calendar (owner_id, name, color) VALUES (?,?,?)";
    connection.query(query, [req.session.passport.user.id, req.body.name, req.body.color], function (err, calendar) {
        if (err) { return next(err); }
        query = "INSERT INTO User_has_Calendar (user_id, calendar_id) VALUES (?,?)";
        connection.query(query, [req.session.passport.user.id, calendar.insertId], function (err) {
            if (err) { return next(err); }
            res.status(200).send();
        });
    })
};

module.exports.createEvent = function (req, res, next) {

    console.log("Create Events");

    var query = "INSERT INTO Event (calendar_id, description, title, created_date, start, end, all_day, color) VALUES (?,?,?,?,?,?,?,?);";

    connection.query(query, [req.body.calendar, req.body.description, req.body.summary, moment().format('YYYY-MM-DD HH:mm:ss'), req.body.start, req.body.end, req.body.all_day, req.body.color], function (err) {
        if (err) { return next(err); }
        res.status(200).send();
    })

};

module.exports.deleteCalendar = function (req, res, next) {

};

module.exports.deleteEvent = function (req, res, next) {

};