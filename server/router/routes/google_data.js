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
var moment = require('moment');
var base64 = require('js-base64').Base64;
var RRule = require('rrule').RRule;

var getGoogleCredentials = function (done) {
    connection.query(googleCredentialsQuery, function (err, data) {
        if (err || !data) {  return done('getGoogleCredentials Error: ' + err); }
        if (!data.length) {  return done('getGoogleCredentials Error: ' + err); }
        data = data[0];
        done(null, data);
    });
};

var getExternalAccount = function (username) {
    return function (main, done) {
        var query = "SELECT access_token, refresh_token, id FROM google_data.get_user_external_accounts_info " +
                        "WHERE username = ? and is_current = 1 LIMIT 1";
        connection.query(query, [username], function (err, credential) {
            if (err || !credential) { return done('getExternalAccount Error: ' + err); }
            if (!credential.length) { return done('getExternalAccount Error: ' + err); }
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
        if (err || !token) { return done('refreshAccessToken Error: ' + err); }
        var update = "UPDATE External_Account SET access_token = ?, refresh_token = ? WHERE id = ?";
        connection.query(update, [token.access_token, token.refresh_token, credential.id], function (err) {
            if (err) { return done('refreshAccessToken Error: ' + err); }
            done(null, main, { access_token: token.access_token, refresh_token: token.refresh_token });
        });
    });
};

var nameFormatter = function (name) {

    if (name[0] == '"' && name[name.length - 1] == '"') {
        name = name.substring(1, name.length - 1);
    }

    name = name.split('\\').join('');

    return name;

};

var makeMessageBody = function (to, from, subject, message) {
    var str =   [   "Content-Type: text/html; charset=\"UTF-8\"\n",
                    "MIME-Version: 1.0\n",
                    "Content-Transfer-Encoding: 7bit\n",
                    "to: ", to, "\n",
                    "from: ", from, "\n",
                    "subject: ", subject, "\n\n",
                    message
                ].join('');

    return new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
};

var getAllThreads = function (count, pageToken, oauth2Client, result, labels, done) {
    google.gmail('v1').users.threads.list({ userId: 'me', auth: oauth2Client, labelIds: labels, pageToken: pageToken, maxResults: 100000 }, function (err, res) {
        if (!!err) {
            done('getAllThreads Error: ' + err);
        } else {
            count += !!res.threads ? res.threads.length : 0;
            if (!res.nextPageToken) {
                result.threadsCount = count;
                done(null, result);
            } else {
                getAllThreads(count, res.nextPageToken, oauth2Client, result, labels, done);
            }
        }
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
                google.gmail('v1').users.threads.list({ userId: 'me', auth: oauth2Client, labelIds: req.body.labels, pageToken: req.body.pageToken, maxResults: 50 }, function (err, result) {
                    if (!!err) {
                        done('getMessageThreads Error: ' + err);
                    } else {
                        done(null, oauth2Client, result);
                    }
                });
            },
            function (oauth2Client, threadsListResult, done) {
                var batch = new googleBatch();

                batch.setAuth(oauth2Client);

                if (!threadsListResult.threads) { threadsListResult.threads = []; }

                threadsListResult.threads.forEach(function (thread) {
                    batch.add(google.gmail('v1').users.threads.get({ userId: 'me', id: thread.id, format: 'metadata', googleBatch: true }));
                });

                batch.exec(function(error, responses, errorDetails){
                    if (error) {
                        done(null, {});
                    } else {
                        done(null, {
                            nextPageToken: threadsListResult.nextPageToken,
                            threads: responses.map(function (thread) {

                                thread.body.messages = thread.body.messages.map(function (message) {
                                    var payload = {};

                                    message.payload.headers.forEach(function (header) {
                                        payload[header.name.toLocaleLowerCase()] = header.value;
                                    });

                                    if (!!payload.date) {

                                        var date = moment(payload.date);

                                        if (moment().diff(date, 'day') == 0) {
                                            payload.date = 'Today';
                                        } else if (moment().diff(date, 'day') == 1) {
                                            payload.date = 'Yesterday';
                                        } else {
                                            payload.date = moment(payload.date).format('DD.MM.YY');
                                        }

                                    }

                                    message.payload = payload;

                                    return message;

                                });



                                var fromTo = {
                                    from: {},
                                    to: {}
                                };

                                thread.body.messages.forEach(function (message) {

                                    if (!!fromTo.from[message.payload.from]) {
                                        fromTo.from[message.payload.from].count++;
                                    } else {
                                        fromTo.from[message.payload.from] = {
                                            count: 1
                                        };
                                        var matches = /("?.*"?)? ?<(.+@.*)>/g.exec(message.payload.from);
                                        if (!matches) {
                                            fromTo.from[message.payload.from].email = message.payload.from;
                                        } else {
                                            fromTo.from[message.payload.from].name = !!matches[1] ? nameFormatter(matches[1].trim()) : undefined;
                                            fromTo.from[message.payload.from].email = matches[2];
                                        }
                                    }

                                    if (!!fromTo.to[message.payload.to]) {
                                        fromTo.to[message.payload.to].count++;
                                    } else {
                                        fromTo.to[message.payload.to] = {
                                            count: 1
                                        };
                                        var matches = /("?.*"?)? ?<(.+@.*)>/g.exec(message.payload.to);
                                        if (!matches) {
                                            fromTo.to[message.payload.to].email = message.payload.to;
                                        } else {
                                            fromTo.to[message.payload.to].name = !!matches[1] ? nameFormatter(matches[1].trim()) : undefined;
                                            fromTo.to[message.payload.to].email = matches[2];
                                        }
                                    }
                                });

                                var fromToArray = {
                                    from: [],
                                    to: []
                                };

                                for(var key in fromTo.from) {
                                    fromToArray.from.push(fromTo.from[key]);
                                }

                                for(var key in fromTo.to) {
                                    fromToArray.to.push(fromTo.to[key]);
                                }

                                thread.body.fromTo = fromToArray;
                                thread.body.subject = thread.body.messages[thread.body.messages.length - 1].payload.subject;
                                thread.body.snippet = thread.body.messages[thread.body.messages.length - 1].snippet;
                                thread.body.labels = (function () {
                                    var labels = [];
                                    thread.body.messages.forEach(function (msg) {
                                        msg.labelIds.forEach(function (label) {
                                            if (labels.indexOf(label) == -1) {
                                                labels.push(label);
                                            }
                                        });
                                    });
                                    return labels;
                                })();

                                return thread.body
                            })
                        }, oauth2Client);
                    }
                    batch.clear();
                });
            },
            function (result, oauth2Client, done) {
                getAllThreads(0, undefined, oauth2Client, result, req.body.labels, done);
            }
        ], function (err, result) {
            console.log(err);
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
    },

    getMessageThread: function (req, res, next) {
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
                google.gmail('v1').users.threads.get({
                    userId: 'me',
                    id: req.params.id,
                    auth: oauth2Client
                }, function (err, result) {
                    if (!!err) { return done('getMessageThread Error: ' + err); }
                    try {
                        if (result && result.messages) {
                            result.messages = result.messages.map(function (msg) {

                                var tmpPart;
                                var payloadParts = msg.payload.parts;

                                if (payloadParts) {
                                    while (!tmpPart) {
                                        payloadParts.forEach(function (part) {
                                            if (part.mimeType == 'text/html') {
                                                tmpPart = part;
                                            }
                                        });
                                        if (!tmpPart) {
                                            var flag = true;
                                            for (var i = 0; i < payloadParts.length; i++) {
                                                if (payloadParts[i].mimeType == "multipart/alternative") {
                                                    payloadParts = payloadParts[i].parts;
                                                    flag = false;
                                                    break;
                                                }
                                            }
                                            if (flag) {
                                                tmpPart = {
                                                    body: {
                                                        data: "<h1>Message error</h1>"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    tmpPart = JSON.parse(JSON.stringify(msg.payload));
                                }

                                tmpPart.body.data = base64.decode(tmpPart.body.data.replace(/-/g, '+').replace(/_/g, '/'))
                                                    .replace(new RegExp('<title>.*</title>', 'g'), '')
                                                    .replace(new RegExp('<meta .*>', 'g'), '')
                                                    .replace(new RegExp('<style>.*</style>', 'g'), '')
                                                    .replace(new RegExp('^<!DOCTYPE .*>', 'g'), '')
                                                    .replace(new RegExp('<head>.*</head>', 'g'), '');
                                msg.payload.parts = tmpPart;

                                var headers = {}, from = {};
                                msg.payload.headers.forEach(function (header) {
                                    headers[header.name.toLocaleLowerCase()] = header.value;
                                });
                                headers.date = moment(headers.date).format('DD MMMM YYYY HH:mm:ss');
                                var matches = /("?.*"?)? ?<(.+@.*)>/g.exec(headers.from);
                                if (!matches) {
                                    from.email = headers.from;
                                } else {
                                    from.name = !!matches[1] ? nameFormatter(matches[1].trim()) : undefined;
                                    from.email = matches[2];
                                }
                                headers.from = from;
                                msg.payload.headers = headers;

                                return msg;

                            });
                        }
                        done(null, result);
                    } catch (e) {
                        console.log(e);
                        done(null, result);
                    }
                });
            }
        ], function (err, result) {
            if (!!err) { return next(err); }
            res.status(200).send(result);
        });
    },

    sendMessage: function (req, res, next) {
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

                var batch = new googleBatch();

                req.body.recipients.forEach(function (recipient) {
                    batch.add(
                        google.gmail('v1').users.messages.send({
                            userId: 'me',
                            resource: {
                                raw: makeMessageBody(recipient, 'google-data-user', req.body.subject, req.body.message)
                            },
                            googleBatch: true,
                            auth: oauth2Client
                        }));
                });

                batch.exec(function(error, responses, errorDetails){
                    if (error) {
                        done(null, {err: error, err_det: errorDetails, resp: responses});
                    } else {
                        done(null, responses);
                    }
                    batch.clear();
                });

                //google.gmail('v1').users.messages.send({
                //    userId: 'me',
                //    resource: {
                //        raw: makeMessageBody(req.body.recipients[0], 'google-data-user', req.body.subject, req.body.message)
                //    },
                //    auth: oauth2Client
                //}, function (err, result) {
                //    if (err) {
                //        done(null, { err: err });
                //    } else {
                //        done(null, result);
                //    }
                //});

            }
        ], function (err, result) {
            res.status(200).send(result);
        })
    },

    getCalendars: function (req, res, next) {
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
                google.calendar('v3').calendarList.list({ auth: oauth2Client }, function (err, result) {
                    done(null, result, oauth2Client);
                });
            },
            function (googleCalendars, oauth2Client, done) {

                var batch = new googleBatch();

                batch.setAuth(oauth2Client);

                googleCalendars.items.forEach(function (calendar) {
                    //batch.add(google.calendar('v3').events.list({calendarId: encodeURIComponent(calendar.id), googleBatch: true}));
                    batch.add(google.calendar('v3').events.list({calendarId: encodeURIComponent(calendar.id), timeMax: req.query.end, timeMin: req.query.start, googleBatch: true}));
                });

                batch.exec(function (err, responses, errorDetails) {
                    console.log(err, errorDetails);
                    if (responses) {

                        var events = [];
                        
                        responses.forEach(function (evts, index) {

                            days = {};
                            var _startDate = moment(req.query.start),
                                _endDate = moment(req.query.end);
                            for (var i = 0; i < _endDate.diff(_startDate, 'd'); i++) {
                                days[_startDate.clone().add(i, 'day').format('YYYY-MM-DD')] = {
                                    events: []
                                };
                            }
                            var excludeEvents = {};
                            var insteardEvents = {};
                            var recurrenceEvents = {};
                            evts.body.items.forEach(function (item) {
                                item.backgroundColor = googleCalendars.items[index].backgroundColor;
                                item.editable = googleCalendars.items[index].accessRole == 'owner';
                                if (item.status == "cancelled") {

                                    var startTime = item.originalStartTime.dateTime ? moment(item.originalStartTime.dateTime) : moment(item.originalStartTime.date);
                                    var currentDate = _startDate.clone();

                                    var dates = [startTime.format('YYYY-MM-DD') >= currentDate.format('YYYY-MM-DD') ? startTime : currentDate];

                                    if (excludeEvents[item.recurringEventId]) {
                                        excludeEvents[item.recurringEventId].concat(dates);
                                    } else {
                                        excludeEvents[item.recurringEventId] = dates;
                                    }
                                } else {
                                    if (item.recurrence) {
                                        console.log('Recurrence', item.recurrence);
                                        var rule = new RRule(RRule.parseString(item.recurrence[0].replace(/RRULE:/g, '')));
                                        var startTime = item.start.dateTime ? item.start.dateTime : item.start.date;
                                        rule.options.dtstart = moment(startTime)._d;
                                        var recurrenceDays = rule.between(_startDate.toDate(), _endDate.toDate());
                                        recurrenceDays.forEach(function (t) {
                                            var time = moment(t).format('YYYY-MM-DD');
                                            var tmpItem = JSON.parse(JSON.stringify(item));
                                            var dates = {
                                                start: item.start.date ? item.start.date : item.start.dateTime,
                                                end: item.end.date ? item.end.date : item.end.dateTime
                                            }
                                            var diff = moment(dates.end).diff(moment(dates.start));
                                            tmpItem.start = tmpItem.start.date ? { date: moment(t).format('YYYY-MM-DD') } : { dateTime: moment(t).format('YYYY-MM-DD HH:mm:ss') };
                                            tmpItem.end = tmpItem.end.date ? { date: moment(t).add(diff).format('YYYY-MM-DD') } : { dateTime: moment(t).add(diff).format('YYYY-MM-DD HH:mm:ss') };
                                            if (recurrenceEvents[time]) {
                                                recurrenceEvents[time].push(tmpItem);
                                            } else {
                                                recurrenceEvents[time] = [tmpItem];
                                            }
                                        });
                                    } else {
                                        var startTime = item.start.dateTime ? moment(item.start.dateTime) : moment(item.start.date);

                                        var formattedItems = (function () {
                                            var items = [];

                                            var currentDate = _startDate.clone();

                                            var start = startTime.format('YYYY-MM-DD') >= currentDate.format('YYYY-MM-DD') ? startTime : currentDate;

                                            if (item.start.date) { item.start.date = start.format('YYYY-MM-DD') }
                                            else { item.start.dateTime = start.format('YYYY-MM-DD HH:mm:ss') }

                                            return [item];
                                        })();

                                        formattedItems.forEach(function (item) {
                                            var startTime = item.start.dateTime ? item.start.dateTime : item.start.date;
                                            if (item.recurringEventId) {
                                                if (insteardEvents[item.recurringEventId]) {
                                                    insteardEvents[item.recurringEventId][moment(startTime).format('YYYY-MM-DD')] = item;
                                                } else {
                                                    var tmp = {};
                                                    tmp[moment(startTime).format('YYYY-MM-DD')] = item;
                                                    insteardEvents[item.recurringEventId] = tmp;
                                                }
                                            } else {
                                                if (days[moment(startTime).format('YYYY-MM-DD')]) {
                                                    days[moment(startTime).format('YYYY-MM-DD')].events.push(item);
                                                } else {
                                                    console.log(startTime);
                                                    days[moment(startTime).format('YYYY-MM-DD')] = { events: [item] };
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            for (var key in recurrenceEvents) {
                                recurrenceEvents[key].forEach(function (e) {
                                    try {
                                        var flag = true;
                                        if (excludeEvents[e.id]) {
                                            if (excludeEvents[e.id].indexOf(key) != -1) {
                                                flag = false;
                                            }
                                        }
                                        if (insteardEvents[e.id]) {
                                            if (insteardEvents[e.id][key]) {
                                                flag = false;
                                                days[key].events.push(insteardEvents[e.id][key]);
                                            }
                                        }
                                        if (flag) {
                                            days[key].events.push(e);
                                        }
                                    } catch (ex) { console.log(ex, e) }
                                });
                            }

                            for(var key in days) {
                                events = events.concat(days[key].events);
                            }

                        });

                        events = events.map(function (e) {
                            var start = e.start.date ? moment(e.start.date) : moment(e.start.dateTime),
                                end = e.end.date ? moment(e.end.date) : moment(e.end.dateTime);
                            return {
                                data: e,
                                start: start.format(),
                                end: end.format(),
                                allDay: e.start.date,
                                title: e.summary,
                                backgroundColor: e.backgroundColor,
                                textColor: '#000',
                                borderColor: '#fff',
                                editable: !!e.editable
                            }
                        });

                        done(null, {
                            google: {
                                calendars: googleCalendars,
                                events: events
                            }
                        });
                    }
                    else {
                        if (err) { done('getCalendars Error: ' + err); }
                        else { done('No responses') }
                    }
                })
            },
            function (response, done) {
                var query = "SELECT ";
                done(null, response);
            }
        ], function (err, result) {
            if ( err ) { return next(err); }
            res.status(200).send(result);
        })
    },

    toggleThreadLabel: function (req, res, next) {

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
                var batch = new googleBatch();

                var data = req.body.data;

                data.forEach(function (d) {

                    d.googleBatch = true;
                    d.auth = oauth2Client;
                    console.log(d);
                    batch.add(google.gmail('v1').users.threads.modify(d));

                });

                batch.exec(function (err, result) {
                    console.log(arguments);
                    done(err, result);
                })
            }
        ], function (err, result) {
            //if (!!err) { return next(err); }
            res.status(200).send();
        })

    },

    removeThreads: function (req, res, next) {
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
                var batch = new googleBatch();

                //batch.setAuth(oauth2Client);

                req.body.forEach(function (id) {
                    batch.add(google.gmail('v1').users.threads.delete({
                        userId: 'me',
                        id: id,
                        googleBatch: true,
                        auth: oauth2Client
                    }));

                });

                batch.exec(function (err, result) {
                    console.log(arguments);
                    done(err, result);
                })
            }
        ], function (err, result) {
            //if (!!err) { return next(err); }
            res.status(200).send();
        })
    }

};