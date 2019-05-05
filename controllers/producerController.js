var Producer = require('../models/producer');
var async = require('async');
var Video = require('../models/video');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all producers
exports.producer_list = function(req, res, next) {
    Producer.find()
        .sort([['name', 'ascending']])
        .exec(function (err, list_producers) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('producer_list', { title: 'Producer List', producer_list: list_producers });
    });
};

// Display detail page for a specific Producer.
exports.producer_detail = function(req, res, next) {
    async.parallel({
        producer: function(callback) {
            Producer.findById(req.params.id)
            .exec(callback)
        },
        producers_videos: function(callback) {
        Video.find({ 'producer': req.params.id },'title summary')
        .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.producer==null) { // No results.
            var err = new Error('Producer not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('producer_detail', { title: 'Producer Detail', producer: results.producer, producer_videos: results.producers_videos } );
    });
};

// Display Producer create form on GET.
exports.producer_create_get = function(req, res, next) {
    res.render('producer_form', { title: 'Create Producer'});
};

// Handle Producer create on POST.
exports.producer_create_post = [
    body('name').isLength({min: 1}).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    sanitizeBody('name').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('producer_form', {title: 'Create Producer', producer: req.body, errors: errors.array()});
            return;
        } else {
            var producer = new Producer({
                name: req.body.name,
            });
            producer.save(function(err) {
                if (err) {return next(err);}
                res.redirect(producer.url);
            });
        }
    }
];

// Display Producer delete form on GET.
exports.producer_delete_get = function(req, res, next) {
    async.parallel({
        producer: function(callback) {
            Producer.findById(req.params.id).exec(callback);
        },
        producers_videos: function(callback) {
            Video.find({'producer': req.params.id}).exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.producer == null) {
            res.redirect('/library/producers');
        }
        res.render('producer_delete', {title: 'Delete Producer', producer: results.producer, producer_videos: results.producers_videos});
    });
};

// Handle Producer delete on POST.
exports.producer_delete_post = function(req, res, next) {
    async.parallel({
        producer: function(callback) {
            Producer.findById(req.body.producerid).exec(callback);
        },
        producers_videos: function(callback) {
            Video.find({'producer': req.body.producerid}).exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.producers_videos.length > 0) {
            res.render('producer_delete', {title: 'Delete Producer', producer: results.producer, producer_videos: results.producer_videos});
            return;
        } else {
            Producer.findByIdAndRemove(req.body.producerid, function deleteProducer(err) {
                if (err) {return next(err);}
                res.redirect('/library/producers');
            });
        }
    });
};

// Display Producer update form on GET.
exports.producer_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Producer update GET');
};

// Handle Producer update on POST.
exports.producer_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Producer update POST');
};
