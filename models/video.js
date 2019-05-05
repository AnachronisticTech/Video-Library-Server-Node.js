var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var VideoSchema = new Schema(
    {
        title: {type: String, required: true},
        filename: {type: String, required: true},
        summary: {type: String},
        tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
        performers: [{type: Schema.Types.ObjectId, ref: 'Performer'}],
        producer: {type: Schema.Types.ObjectId, ref: 'Producer'}
    }
);

// Virtual for video's URL
VideoSchema
.virtual('url')
.get(function () {
    return '/library/video/' + this._id;
});

// Export model
module.exports = mongoose.model('Video', VideoSchema);
