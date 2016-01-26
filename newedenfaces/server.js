// Babel ES6/JSX Compiler
require('babel-register');

// React stuff
var swig = require('swig');
var React = require('react');
// React.renderToString now lives in the react-dom/server package
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var routes = require('./app/routes')

// Node stuff
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});