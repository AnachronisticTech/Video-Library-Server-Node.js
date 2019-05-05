var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PerformerSchema = new Schema(
    {
        name: {type: String, required: true, max: 100},
    }
);

// Virtual for performer's URL
PerformerSchema
.virtual('url')
.get(function () {
    return '/library/performer/' + this._id;
});

// Export model
module.exports = mongoose.model('Performer', PerformerSchema);
