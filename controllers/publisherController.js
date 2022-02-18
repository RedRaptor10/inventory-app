var Publisher = require('../models/publisher');

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

// Display detail page for a specific publisher.
exports.publisher_detail = function(req, res) {
    res.send('N/A');
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