var Game = require('../models/game');
var Publisher = require('../models/publisher');
var Genre = require('../models/genre');
var Platform = require('../models/platform');
var async = require('async');
const { body, validationResult } = require('express-validator');

// Home Page
exports.index = function(req, res) {
    async.parallel({
        game_count: function(callback) {
            Game.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        publisher_count: function(callback) {
            Publisher.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        },
        platform_count: function(callback) {
            Platform.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Home', error: err, data: results });
    });
};

// Display list of all games.
exports.game_list = function(req, res, next) {
    Game.find({}, 'title publisher')
        .sort({title: 1})
        .populate('publisher')
        .exec(function (err, list_games) {
            if (err) { return next(err); }
            // Successful
            res.render('game_list', { title: 'Game List', game_list: list_games });
        });
};

// Display detail page for a specific game.
exports.game_details = function(req, res, next) {
    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id)
                .populate('publisher')
                .populate('genre')
                .populate('platform')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.game==null) { // No results
            var err = new Error('Game not found');
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('game_details', { title: results.game.title, game: results.game });
    });
};

// Display game create form on GET.
exports.game_create_get = function(req, res, next) {
    // Get all publishers, genres, and platforms
    async.parallel({
        publishers: function(callback) {
            Publisher.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        platforms: function(callback) {
            Platform.find(callback);
        },
    }, function(err, results) {
        res.render('game_form', { title: 'Create Game', publishers: results.publishers,
            genres: results.genres, platforms: results.platforms });
    });
};

// Handle game create on POST.
exports.game_create_post = function(req, res) {
    res.send('N/A');
};

// Display game delete form on GET.
exports.game_delete_get = function(req, res) {
    res.send('N/A');
};

// Handle game delete on POST.
exports.game_delete_post = function(req, res) {
    res.send('N/A');
};

// Display game update form on GET.
exports.game_update_get = function(req, res) {
    res.send('N/A');
};

// Handle game update on POST.
exports.game_update_post = function(req, res) {
    res.send('N/A');
};