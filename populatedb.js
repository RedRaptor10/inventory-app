#! /usr/bin/env node

console.log('This script populates some test items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Game = require('./models/game')
var Publisher = require('./models/publisher')
var Platform = require('./models/platform')
var Genre = require('./models/genre')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var games = []
var publishers = []
var platforms = []
var genres = []

function gameCreate(title, publisher, description, platform, genre, price, qty, cb) {
  gamedetail = { 
    title: title,
    publisher: publisher,
    description: description,
    platform: platform,
    genre: genre,
    price: price,
    qty: qty
  }

  var game = new Game(gamedetail);    
  game.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Game: ' + game);
    games.push(game)
    cb(null, game)
  }  );
}

function publisherCreate(name, description, cb) {
  publisherdetail = {name: name , description: description }
  
  var publisher = new Publisher(publisherdetail);
       
  publisher.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Publisher: ' + publisher);
    publishers.push(publisher)
    cb(null, publisher)
  }  );
}

function platformCreate(name, cb) {
  var platform = new Platform({ name: name });
       
  platform.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Platform: ' + platform);
    platforms.push(platform)
    cb(null, platform);
  }   );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function createPublishers(cb) {
    async.series([
        function(callback) {
          publisherCreate('Nintendo', 'Nintendo Co., Ltd. is a Japanese multinational video game company headquartered in Kyoto, Japan. It develops video games and video game consoles.', callback);
        },
        function(callback) {
          publisherCreate('Capcom', 'Capcom Co., Ltd. is a Japanese video game developer and publisher.', callback);
        },
        function(callback) {
          publisherCreate('Xbox Game Studios', 'Xbox Game Studios is an American video game publisher and part of Microsoft Gaming division based in Redmond, Washington.', callback);
        },
        ],
        // optional callback
        cb);
}

function createPlatforms(cb) {
  async.series([
      function(callback) {
        platformCreate('Nintendo 64', callback);
      },
      function(callback) {
        platformCreate('PlayStation 4', callback);
      },
      function(callback) {
        platformCreate('Xbox One', callback);
      },
      function(callback) {
        platformCreate('PC', callback);
      },
      ],
      // optional callback
      cb);
}

function createGenres(cb) {
  async.series([
      function(callback) {
        genreCreate('Adventure', callback);
      },
      function(callback) {
        genreCreate('Platform', callback);
      },
      function(callback) {
        genreCreate('Fighting', callback);
      },
      function(callback) {
        genreCreate('Shooter', callback);
      },
      ],
      // optional callback
      cb);
}


function createGames(cb) {
    async.parallel([
        function(callback) {
          gameCreate("Super Mario 64", publishers[0], "Super Mario 64 is a 1996 platform game for the Nintendo 64, developed by Nintendo EAD and published by Nintendo.", [platforms[0]], [genres[0], genres[1]], 25.00, 10, callback);
        },
        function(callback) {
          gameCreate("Street Fighter V", publishers[1], "Street Fighter V is a fighting game developed by Capcom and Dimps and published by Capcom for the PlayStation 4 and Microsoft Windows in 2016.", [platforms[1], platforms[3]], [genres[2]], 50.00, 100, callback);
        },
        function(callback) {
          gameCreate("Halo Infinite", publishers[2], "Halo Infinite is a 2021 first-person shooter game developed by 343 Industries and published by Xbox Game Studios.", [platforms[2], platforms[3]], [genres[3]], 60.00, 500, callback);
        }
        ],
        // optional callback
        cb);
}



async.series([
    createPublishers,
    createPlatforms,
    createGenres,
    createGames
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    }
    else {
        console.log('Gamess: ' + games);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});