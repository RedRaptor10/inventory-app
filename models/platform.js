var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlatformSchema = new Schema({
    name: { type: String, minLength: 1, maxLength: 100, required: true }
});

PlatformSchema
.virtual('url')
.get(function() {
    return '/catalog/platform/' + this._id;
});

module.exports = mongoose.model('Platform', PlatformSchema);