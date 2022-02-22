var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublisherSchema = new Schema(
    {
        name: {type: String, minLength: 1, maxLength: 100, required: true},
        description: {type: String, maxLength: 1000}
    }
);

PublisherSchema
.virtual('url')
.get(function() {
    return '/catalog/publisher/' + this._id;
});

module.exports = mongoose.model('Publisher', PublisherSchema);