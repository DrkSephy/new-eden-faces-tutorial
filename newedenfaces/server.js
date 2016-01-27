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
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('underscore');

// MongoDB and models
var mongoose = require('mongoose');
var config = require('./config');
var Character = require('./models/character');

var app = express();

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB');
});

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * POST /api/characters
 * Adds new character to the database.
*/
app.post('/api/characters', function(req, res, next) {
  var gender = req.body.gender;
  var characterName = req.body.name;
  var characterIdLookupUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + characterName;

  var parser = new xml2js.Parser();

  async.waterfall([
    function(callback) {
      request.get(characterIdLookupUrl, function(err, request, xml) {
        if (err) return next(err);
        parser.parseString(xml, function(err, parsedXml) {
          if (err) return next(err);
          try {
            var characterId = parsedXml.eveapi.result[0].rowset[0].row[0].$.characterID;

            Character.findOne({ characterId: characterId }, function(err, character) {
              if (err) return next(err);

              if (character) {
                return res.status(409).send({ message: character.name + ' is already in the database.' });
              }

              callback(err, characterId);
            });
          } catch (e) {
            return res.status(400).send({ message: 'XML Parse Error' });
          }
        });
      });
    },
    
    function(characterId) {
      var characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

      request.get({ url: characterInfoUrl }, function(err, request, xml) {
        if (err) return next(err);
        parser.parseString(xml, function(err, parsedXml) {
          if (err) return res.send(err);
          try {
            var name = parsedXml.eveapi.result[0].characterName[0];
            var race = parsedXml.eveapi.result[0].race[0];
            var bloodline = parsedXml.eveapi.result[0].bloodline[0];

            var character = new Character({
              characterId: characterId,
              name: name,
              race: race,
              bloodline: bloodline,
              gender: gender,
              random: [Math.random(), 0]
            });

            character.save(function(err) {
              if (err) return next(err);
              res.send({ message: characterName + ' has been added successfully!' });
            });
          } catch (e) {
            res.status(404).send({ message: characterName + ' is not a registered citizen of New Eden.' });
          }
        });
      });
    }
  ]);
});


/**
 * GET /api/characters
 * Returns 2 random characters of the same gender that have not been voted yet.
*/
app.get('/api/characters', function(req, res, next) {
  var choices = ['Female', 'Male'];
  var randomGender = _.sample(choices);

  Character.find({random: { $near: [Math.random(), 0]}})
    .where('voted', false)
    .where('gender', randomGender)
    .limit(2)
    .exec(function(err, characters) {
      if(err) return next(err);

      if(characters.length === 2) {
        return res.send(characters);
      }

      var oppositeGender = _.first(_.without(choices, randomGender));

      Character
        .find({ random: { $near: [Math.random(), 0]}})
        .where('voted', false)
        .where('gender', oppositeGender)
        .limit(2)
        .exec(function(err, characters) {
          if (err) return next(err);

          if (characters.length === 2) {
            return res.send(characters);
          }

          Character.update({}, { $set: { voted: false } }, {multi: true }, function(err) {
            if (err) return next(err);
            res.send([]);
          });
        });
    })
});

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