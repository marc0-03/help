const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const nunjucks = require('nunjucks');
const session = require('express-session');

require('dotenv').config();

var indexRouter = require('./routes/index');
var APIRouter = require('./routes/API');
var meepsRouter = require('./routes/meeps');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '5up3rh3m1i5', //only https
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite: true }
}))

nunjucks.configure('views', {
  autoescape: true,
  express: app
})

app.use('/', indexRouter);
app.use('/API', APIRouter);
app.use('/meeps', meepsRouter);

module.exports = app;
