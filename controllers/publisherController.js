var Publisher = require('../models/publisher');
var Game = require('../models/game');
var async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all publishers.
exports.publisher_list = function(req, res, next) {
    Publisher.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_publishers) {
        if (err) return next(err)
        // Success
        res.render('publisher_list', {title: 'Publishers', publisher_list: list_publishers});
    });
};

// Display detail page for a specific Publisher.
exports.publisher_details = function(req, res, next) {
    async.parallel({
        publisher: function(callback) {
            Publisher.findById(req.params.id)
            .exec(callback)
        },
        publisher_games: function(callback) {
            Game.find({ 'publisher': req.params.id }, 'name description')
            .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error
        if (results.publisher==null) { // No results
            var err = new Error('Publisher not found');
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('publisher_details', { title: results.publisher.name, publisher: results.publisher, publisher_games: results.publisher_games });
    });
};

// Display publisher create form on GET.
exports.publisher_create_get = function(req, res) {
    res.send('N/A');
};

// Handle publisher create on POST.
exports.publisher_create_post = function(req, res) {
    res.send('N/A');
};

// Display publisher delete form on GET.
exports.publisher_delete_get = function(req, res) {
    res.send('N/A');
};

// Handle publisher delete on POST.
exports.publisher_delete_post = function(req, res) {
    res.send('N/A');
};

// Display publisher update form on GET.
exports.publisher_update_get = function(req, res) {
    res.send('N/A');
};

// Handle publisher update on POST.
exports.publisher_update_post = function(req, res) {
    res.send('N/A');
};