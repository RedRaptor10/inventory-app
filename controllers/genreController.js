var Genre = require('../models/genre');
var Game = require('../models/game');
var async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all genres.
exports.genre_list = function(req, res, next) {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function(err, list_genres) {
            if (err) return next(err)
            // Success
            res.render('genre_list', {title: 'Genres', genre_list: list_genres});
        });
};

// Display detail page for a specific genre.
exports.genre_details = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
            .exec(callback);
        },
        genre_games: function(callback) {
            Game.find({ 'genre': req.params.id })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results
            var err = new Error('Genre not found');
            err.status = 400;
            return next(err);
        }
        // Success
        res.render('genre_details', { title: results.genre.name, genre: results.genre, genre_games: results.genre_games });
    });
};

// Display genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.send('N/A');
};

// Handle genre create on POST.
exports.genre_create_post = function(req, res) {
    res.send('N/A');
};

// Display genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('N/A');
};

// Handle genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('N/A');
};

// Display genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('N/A');
};

// Handle genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('N/A');
};