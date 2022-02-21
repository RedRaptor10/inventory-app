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
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle genre create on POST.
exports.genre_create_post = [
    // Validate and sanitize the name field.
    body('name').trim().isLength({ min: 3 }).escape().withMessage('Name must be at least 3 characters long.')
        .isLength({ max: 100 }).escape().withMessage('Name cannot be more than 100 characters long.'),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ 'name': req.body.name })
          .exec( function(err, found_genre) {
             if (err) { return next(err); }
  
             if (found_genre) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_genre.url);
             }
             else {
               genre.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(genre.url);
               });
  
             }
           });
      }
    }
];

// Display genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        genre_games: function(callback) {
            Game.find({ 'genre': req.params.id }).exec(callback)
        },
      }, function(err, results) {
          if (err) { return next(err); }
          if (results.genre==null) { // No results.
              res.redirect('/catalog/genres');
          }
          // Successful, so render.
          res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_games: results.genre_games } );
      });
};

// Handle genre delete on POST.
exports.genre_delete_post = function(req, res) {
    async.parallel({
        genre: function(callback) {
          Genre.findById(req.body.genreid).exec(callback)
        },
        genre_games: function(callback) {
          Game.find({ 'genre': req.body.genreid }).exec(callback)
        },
      }, function(err, results) {
          if (err) { return next(err); }
          // Success
          if (results.genre_games.length > 0) {
              // Genre has games. Render in same way as for GET route.
              res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_games: results.genre_games } );
              return;
          }
          else {
              // Genre has no games. Delete object and redirect to the list of genres.
              Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                  if (err) { return next(err); }
                  // Success - go to genre list
                  res.redirect('/catalog/genres')
              })
          }
      });
};

// Display genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('N/A');
};

// Handle genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('N/A');
};