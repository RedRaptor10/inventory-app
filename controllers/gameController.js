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
exports.game_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre ==='undefined')
            req.body.genre = [];
            else
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },
    // Convert the platform to an array.
    (req, res, next) => {
        if(!(req.body.platform instanceof Array)){
            if(typeof req.body.platform ==='undefined')
            req.body.platform = [];
            else
            req.body.platform = new Array(req.body.platform);
        }
        next();
    },

    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('publisher', 'Publisher must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ max: 1000 }).escape(),
    body('genre.*').escape(),
    body('platform.*').escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('qty', 'Quantity must not be empty').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Game object with escaped and trimmed data.
        var game = new Game(
          { title: req.body.title,
            publisher: req.body.publisher,
            description: req.body.description,
            genre: req.body.genre,
            platform: req.body.platform,
            price: req.body.price,
            qty: req.body.qty
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all publishers, genres, and platforms for form.
            async.parallel({
                publishers: function(callback) {
                    Publisher.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
                platforms: function(callback) {
                    Platform.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (game.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                // Mark our selected platforms as checked.
                for (let i = 0; i < results.platforms.length; i++) {
                    if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                        results.platforms[i].checked='true';
                    }
                }
                res.render('game_form', { title: 'Create Game', publishers: results.publishers, genres: results.genres, platforms: results.platforms,
                    game: game, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save game.
            game.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new game record.
                   res.redirect(game.url);
                });
        }
    }
];

// Display game delete form on GET.
exports.game_delete_get = function(req, res, next) {
    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.game==null) { // No results.
            res.redirect('/catalog/games');
        }
        // Successful, so render.
        res.render('game_delete', { title: 'Delete Game', game: results.game } );
    });
};

// Handle game delete on POST.
exports.game_delete_post = function(req, res, next) {
    async.parallel({
        game: function(callback) {
            Game.findById(req.body.gameid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success. Delete object and redirect to the list of games.
        Game.findByIdAndRemove(req.body.gameid, function deleteGame(err) {
        if (err) { return next(err); }
        // Success - go to game list
        res.redirect('/catalog/games')
        })
    });
};

// Display game update form on GET.
exports.game_update_get = function(req, res, next) {
    // Get game, publishers, genres, and platforms for form.
    async.parallel({
        game: function(callback) {
            Game.findById(req.params.id).populate('publisher').populate('genre').populate('platform').exec(callback);
        },
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
            if (err) { return next(err); }
            if (results.game==null) { // No results.
                var err = new Error('Game not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var game_g_iter = 0; game_g_iter < results.game.genre.length; game_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()===results.game.genre[game_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            // Mark our selected platforms as checked.
            for (var all_p_iter = 0; all_p_iter < results.platforms.length; all_p_iter++) {
                for (var game_p_iter = 0; game_p_iter < results.game.platform.length; game_p_iter++) {
                    if (results.platforms[all_p_iter]._id.toString()===results.game.platform[game_p_iter]._id.toString()) {
                        results.platforms[all_p_iter].checked='true';
                    }
                }
            }
            res.render('game_form', { title: 'Update Game', publishers: results.publishers, genres: results.genres,
                platforms: results.platforms, game: results.game });
        });
};

// Handle game update on POST.
exports.game_update_post = [
    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
    // Convert the platform to an array
    (req, res, next) => {
        if(!(req.body.platform instanceof Array)){
            if(typeof req.body.platform==='undefined')
            req.body.platform=[];
            else
            req.body.platform=new Array(req.body.platform);
        }
        next();
    },

    // Validate and sanitize fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('publisher', 'Publisher must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ max: 1000 }).escape(),
    body('genre.*').escape(),
    body('platform.*').escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('qty', 'Quantity must not be empty').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Game object with escaped/trimmed data and old id.
        var game = new Game(
          { title: req.body.title,
            publisher: req.body.publisher,
            description: req.body.description,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            platform: (typeof req.body.platform==='undefined') ? [] : req.body.platform,
            price: req.body.price,
            qty: req.body.qty,
            _id:req.params.id // This is required, or a new ID will be assigned
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all publishers, genres, and platforms for form.
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
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (game.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                // Mark our selected platforms as checked.
                for (let i = 0; i < results.platforms.length; i++) {
                    if (game.platform.indexOf(results.platforms[i]._id) > -1) {
                        results.platforms[i].checked='true';
                    }
                }
                res.render('game_form', { title: 'Update Game', publishers: results.publishers, genres: results.genres,
                    platforms: results.platforms, game: game, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Game.findByIdAndUpdate(req.params.id, game, {}, function (err,thegame) {
                if (err) { return next(err); }
                   // Successful - redirect to game detail page.
                   res.redirect(thegame.url);
                });
        }
    }
];