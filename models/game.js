var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema(
    {
        title: {type: String, minLength: 1, maxLength: 100, required: true},
        publisher: {type: Schema.Types.ObjectId, ref: 'Publisher', required: true},
        description: {type: String, maxLength: 1000},
        genre: [{type: Schema.Types.ObjectId, ref: 'Genre', required: true}],
        platform: [{type: Schema.Types.ObjectId, ref: 'Platform', required: true}],
        price: {type: Schema.Types.Decimal128, required: true},
        qty: {type: Number, required: true},
        posterId: {type: String}
    }
);

GameSchema
.virtual('url')
.get(function() {
    return '/catalog/game/' + this._id;
});

module.exports = mongoose.model('Game', GameSchema);