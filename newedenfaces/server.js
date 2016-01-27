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

// MongoDB and models
var mongoose = require('mongoose');
var config = require('./config');
var Character = require('./models/character');

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
	console.info('Error: Could not connect to MongoDB');
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// On the client-side, a rendered HTML markup gets inserted into <div id="app"></div>
// while on the server a rendered HTML markup is sent to the index.html template where
// it is inserted into <div id="app">{{html|safe}}</div> by the Swig template engine.
app.use(function(req, res) {
	Router.match({ routes: routes.default, location: req.url }, function(err, redirectLocation, renderProps) {
		if (err) {
			res.status(500).send(err.message)
		} else if (redirectLocation) {
			res.status(302).redirect(redirectLocation.pathname + redirectLocation.search)
		} else if (renderProps) {
			var html = ReactDOM.renderToString(React.createElement(Router.RoutingContext, renderProps));
			var page = swig.renderFile('views/index.html', { html: html });
			res.status(200).send(page);
		} else {
			res.status(404).send('Page Not Found');
		}
	});
});

// Socket.io stuff
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var onlineUsers = 0;

io.sockets.on('connection', function(socket) {
	onlineUsers++;
	io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });
	socket.on('disconnect', function() {
		onlineUsers--;
		io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });
	});
});

server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});