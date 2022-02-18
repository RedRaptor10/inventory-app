var Platform = require('../models/platform');

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
exports.platform_detail = function(req, res) {
    res.send('N/A');
};

// Display platform create form on GET.
exports.platform_create_get = function(req, res) {
    res.send('N/A');
};

// Handle platform create on POST.
exports.platform_create_post = function(req, res) {
    res.send('N/A');
};

// Display platform delete form on GET.
exports.platform_delete_get = function(req, res) {
    res.send('N/A');
};

// Handle platform delete on POST.
exports.platform_delete_post = function(req, res) {
    res.send('N/A');
};

// Display platform update form on GET.
exports.platform_update_get = function(req, res) {
    res.send('N/A');
};

// Handle platform update on POST.
exports.platform_update_post = function(req, res) {
    res.send('N/A');
};