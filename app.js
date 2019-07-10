const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const db = require('./db/connection');

const indexRouter = require('./routes/index');

const app = express();

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
 
const sessionStore = new MySQLStore({
    host        : process.env.DB_HOST,
    port        : 3306,
    user        : process.env.DB_USER,
    password    : process.env.DB_PASS,
    database    : process.env.DB_NAME
}, db);
 
app.use(session({
    cookie: {maxAge: 315360000000},
    secret: process.env.SESSION_COOKIE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.disable('x-powered-by')
app.use(logger('dev'));
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(new Error('404'));
});

// error handler
app.use(function(err, req, res, next) {
    if(err.message === '404') {
        res.status(404);
        res.sendFile(path.join(__dirname, '/public/error/404.html'));
    } else
        next(err);
});

module.exports = app;
