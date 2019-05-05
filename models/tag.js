var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TagSchema = new Schema(
    {
        name: {type: String, min: 2, max: 100, required: true},
    }
);

// Virtual for tag's URL
TagSchema
.virtual('url')
.get(function () {
    return '/library/tag/' + this._id;
});

//Export model
module.exports = mongoose.model('Tag', TagSchema);
