var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProducerSchema = new Schema(
    {
        name: {type: String, required: true, max: 100},
    }
);

// Virtual for producer's URL
ProducerSchema
.virtual('url')
.get(function () {
    return '/library/producer/' + this._id;
});

// Export model
module.exports = mongoose.model('Producer', ProducerSchema);
