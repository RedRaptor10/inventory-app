var Genre = require('../models/genre');

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
exports.genre_detail = function(req, res) {
    res.send('N/A');
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