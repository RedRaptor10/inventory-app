var Admin = require('../models/admin');
var Platform = require('../models/platform');
var Game = require('../models/game');
var async = require('async');
const { body, validationResult } = require('express-validator');
password = Admin.password;

// Display list of all platforms.
exports.platform_list = function(req, res) {
    Platform.find()
    .sort([['name', 'ascending']])
    .exec(function(err, list_platforms) {
        if (err) return next(err)
        // Success
        res.render('platform_list', {title: 'Platforms', platform_list: list_platforms});
    });
};

// Display detail page for a specific platform.
exports.platform_details = function(req, res) {
    async.parallel({
        platform: function(callback) {
            Platform.findById(req.params.id)
            .exec(callback);
        },
        platform_games: function(callback) {
            Game.find({ 'platform': req.params.id })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.platform == null) { // No results
            var err = new Error('Platform not found');
            err.status = 400;
            return next(err);
        }
        // Success
        res.render('platform_details', { title: results.platform.name, platform: results.platform, platform_games: results.platform_games });
    });
};

// Display platform create form on GET.
exports.platform_create_get = function(req, res, next) {
    res.render('platform_form', { title: 'Create Platform' });
};

// Handle platform create on POST.
exports.platform_create_post = [
    // Validate and sanitize the name field.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name is required.')
        .isLength({ max: 100 }).escape().withMessage('Name cannot be more than 100 characters long.'),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
  
        // Create a platform object with escaped and trimmed data.
        var platform = new Platform({
            name: req.body.name
        });
  
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('platform_form', { title: 'Create Platform', platform: platform, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid.
            // Check if Platform with same name already exists.
            Platform.findOne({ 'name': req.body.name }).exec( function(err, found_platform) {
                if (err) { return next(err); }

                if (found_platform) {
                    // Platform exists, redirect to its detail page.
                    res.redirect(found_platform.url);
                }
                else {
                    platform.save(function (err) {
                        if (err) { return next(err); }
                        // Platform saved. Redirect to platform detail page.
                        res.redirect(platform.url);
                    });
                }
            });
        }
    }
];

// Display platform delete form on GET.
exports.platform_delete_get = function(req, res) {
    async.parallel({
        platform: function(callback) {
            Platform.findById(req.params.id).exec(callback)
        },
        platform_games: function(callback) {
            Game.find({ 'platform': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.platform == null) { // No results.
            res.redirect('/catalog/platforms');
        }
        // Success.
        res.render('platform_delete', { title: 'Delete Platform', platform: results.platform, platform_games: results.platform_games } );
    });
};

// Handle platform delete on POST.
exports.platform_delete_post = [
    // Validate password
    body('admin-password').custom((value) => {
        if (value !== password) {
            throw new Error('Wrong password.');
        }
        return true;
    }),

    (req, res) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            async.parallel({
                platform: function(callback) {
                    Platform.findById(req.params.id).exec(callback)
                },
                platform_games: function(callback) {
                    Game.find({ 'platform': req.params.id }).exec(callback)
                },
            }, function(err, results) {
                if (err) { return next(err); }
                if (results.platform == null) { // No results.
                    res.redirect('/catalog/platforms');
                }
                // Success.
                res.render('platform_delete', { title: 'Delete Platform', platform: results.platform,
                    platform_games: results.platform_games, errors: errors.array() });
            });
        } else {
            async.parallel({
                platform: function(callback) {
                Platform.findById(req.body.platformid).exec(callback)
                },
                platform_games: function(callback) {
                Game.find({ 'platform': req.body.platformid }).exec(callback)
                },
            }, function(err, results) {
                if (err) { return next(err); }
                // Success
                if (results.platform_games.length > 0) {
                    // Platform has games. Render in same way as for GET route.
                    res.render('platform_delete', { title: 'Delete Platform', platform: results.platform, platform_games: results.platform_games } );
                    return;
                }
                else {
                    // Platform has no games. Delete object and redirect to the list of platforms.
                    Platform.findByIdAndRemove(req.body.platformid, function deletePlatform(err) {
                        if (err) { return next(err); }
                        // Success. Go to platform list
                        res.redirect('/catalog/platforms')
                    })
                }
            });
        }
    }
];

// Display platform update form on GET.
exports.platform_update_get = function(req, res, next) {
    // Get platform for form.
    async.parallel({
        platform: function(callback) {
            Platform.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.platform == null) { // No results.
            var err = new Error('Platform not found');
            err.status = 404;
            return next(err);
        }
        // Success
        res.render('platform_form', { title: 'Update Platform', platform: results.platform });
    });
};

// Handle platform update on POST.
exports.platform_update_post = [
    // Validate and sanitize fields.
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('admin-password').custom((value) => {
        if (value !== password) {
            throw new Error('Wrong password.');
        }
        return true;
    }),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Platform object with escaped/trimmed data and old id.
        var platform = new Platform({
            name: req.body.name,
            _id:req.params.id // This is required, or a new ID will be assigned
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('platform_form', { title: 'Update Platform', platform: platform, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            // Check if Platform with same name already exists.
            Platform.findOne({ 'name': req.body.name }).exec( function(err, found_platform) {
                if (err) { return next(err); }

                if (found_platform) {
                    // Platform exists, redirect to its detail page.
                    res.redirect(found_platform.url);
                }
                else {
                    Platform.findByIdAndUpdate(req.params.id, platform, {}, function(err, theplatform) {
                        if (err) { return next(err); }
                        // Success. Redirect to platform detail page.
                        res.redirect(theplatform.url);
                    });
                }
            });
        }
    }
];