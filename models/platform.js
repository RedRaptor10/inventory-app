var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlatformSchema = new Schema(
    {
        title: {type: String, minLength: 3, maxLength: 100, required: true}
    }
);

PlatformSchema
.virtual('url')
.get(function() {
    return '/catalog/platform/' + this._id;
});

module.exports = mongoose.model('Platform', PlatformSchema);