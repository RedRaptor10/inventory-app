var Admin = require('../models/admin');
var Publisher = require('../models/publisher');
var Game = require('../models/game');
var async = require('async');
const { body, validationResult } = require('express-validator');
const password = Admin.password;

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
exports.publisher_create_get = function(req, res, next) {
    res.render('publisher_form', { title: 'Create Publisher'});
};

// Handle publisher create on POST.
exports.publisher_create_post = [
    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
        .isLength({ max: 100 }).escape().withMessage('Name cannot be more than 100 characters long.')
        .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
    body('description').trim().isLength({ max: 1000 }).escape().withMessage('Name cannot be more than 1000 characters long.'),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('publisher_form', { title: 'Create Publisher', publisher: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Publisher with same name already exists.
            Publisher.findOne({ 'name': req.body.name })
            .exec( function(err, found_publisher) {
                if (err) { return next(err); }

                if (found_publisher) {
                    // Publisher exists, redirect to its detail page.
                    res.redirect(found_publisher.url);
                }
                else {
                    // Create a Publisher object with escaped and trimmed data.
                    var publisher = new Publisher(
                        {
                            name: req.body.name,
                            description: req.body.description
                        });
                    publisher.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to new publisher record.
                        res.redirect(publisher.url);
                    });
                }
            });
        }
    }
];

// Display publisher delete form on GET.
exports.publisher_delete_get = function(req, res, next) {
    async.parallel({
        publisher: function(callback) {
            Publisher.findById(req.params.id).exec(callback)
        },
        publisher_games: function(callback) {
            Game.find({ 'publisher': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.publisher==null) { // No results.
            res.redirect('/catalog/publishers');
        }
        // Successful, so render.
        res.render('publisher_delete', { title: 'Delete Publisher', publisher: results.publisher, publisher_games: results.publisher_games } );
    });
};

// Handle publisher delete on POST.
exports.publisher_delete_post = [
    // Validate password
    body('admin-password').custom((value) => {
        if (value !== password) {
            throw new Error('Wrong password.');
        }
        return true;
    }),

    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            async.parallel({
                publisher: function(callback) {
                    Publisher.findById(req.params.id).exec(callback)
                },
                publisher_games: function(callback) {
                    Game.find({ 'publisher': req.params.id }).exec(callback)
                },
            }, function(err, results) {
                if (err) { return next(err); }
                if (results.publisher==null) { // No results.
                    res.redirect('/catalog/publishers');
                }
                // Successful, so render.
                res.render('publisher_delete', { title: 'Delete Publisher', publisher: results.publisher,
                    publisher_games: results.publisher_games, errors: errors.array() } );
            });
        } else {
            async.parallel({
                publisher: function(callback) {
                Publisher.findById(req.body.publisherid).exec(callback)
                },
                publisher_games: function(callback) {
                Game.find({ 'publisher': req.body.publisherid }).exec(callback)
                },
            }, function(err, results) {
                if (err) { return next(err); }
                // Success
                if (results.publisher_games.length > 0) {
                    // Publisher has games. Render in same way as for GET route.
                    res.render('publisher_delete', { title: 'Delete Publisher', publisher: results.publisher, publisher_games: results.publisher_games } );
                    return;
                }
                else {
                    // Publisher has no games. Delete object and redirect to the list of publishers.
                    Publisher.findByIdAndRemove(req.body.publisherid, function deletePublisher(err) {
                        if (err) { return next(err); }
                        // Success - go to publisher list
                        res.redirect('/catalog/publishers')
                    })
                }
            });
        }
    }
];

// Display publisher update form on GET.
exports.publisher_update_get = function(req, res, next) {
    // Get publisher for form.
    async.parallel({
        publisher: function(callback) {
            Publisher.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.publisher==null) { // No results.
                var err = new Error('Publisher not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('publisher_form', { title: 'Update Publisher', publisher: results.publisher });
        });
};

// Handle publisher update on POST.
exports.publisher_update_post = [
    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
        .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
    body('description').trim().isLength({ max: 1000 }).escape().withMessage('Name cannot be more than 1000 characters long.'),
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

        // Create a Publisher object with escaped/trimmed data and old id.
        var publisher = new Publisher(
          { name: req.body.name,
            description: req.body.description,
            _id: req.params.id // This is required, or a new ID will be assigned
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            // Get publisher for form.
            async.parallel({
                publisher: function(callback) {
                    Publisher.findById(req.params.id).exec(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                if (results.publisher==null) { // No results.
                    var err = new Error('Publisher not found');
                    err.status = 404;
                    return next(err);
                }
                // Success.
                res.render('publisher_form', { title: 'Update Publisher', publisher: results.publisher, errors: errors.array() });
                return;
            });
        }
        else {
            // Data from form is valid. Update the record.
            // Check if Publisher with same name already exists.
            Publisher.findOne({ 'name': req.body.name })
            .exec( function(err, found_publisher) {
                if (err) { return next(err); }

                if (found_publisher) {
                    // Publisher exists, redirect to its detail page.
                    res.redirect(found_publisher.url);
                }
                else {
                    Publisher.findByIdAndUpdate(req.params.id, publisher, {}, function (err, thepublisher) {
                        if (err) { return next(err); }
                        // Successful - redirect to publisher detail page.
                        res.redirect(thepublisher.url);
                    });
                }
            });
        }
    }
];