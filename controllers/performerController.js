var Performer = require('../models/performer');
var Video = require('../models/video');
var async = require('async');

const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Performer.
exports.performer_list = function(req, res, next) {
    // Display list of all VideoInstances.
    
    Performer.find()
        .populate('performer')
        .exec(function (err, list_performers) {
          if (err) { return next(err); }
          // Successful, so render
          res.render('performer_list', { title: 'Performer List', performer_list: list_performers });
        });
};

// Display detail page for a specific Performer.
exports.performer_detail = function(req, res, next) {
    async.parallel({
        performer: function(callback) {
            Performer.findById(req.params.id)
              .exec(callback);
        },

        performer_videos: function(callback) {
            Video.find({ 'performer': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.performer==null) { // No results.
            var err = new Error('Performer not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('performer_detail', { title: 'Performer Detail', performer: results.performer, performer_videos: results.performer_videos } );
    });
};

// Display Performer create form on GET.
exports.performer_create_get = function(req, res, next) {
    res.render('performer_form', {title: 'Create Performer'});
};

// Handle Performer create on POST.
exports.performer_create_post = [
    body('name', 'Performer name required').isLength({min: 1}).trim(),
    sanitizeBody('name').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var performer = new Performer({name: req.body.name});
        if (!errors.isEmpty()) {
            res.render('performer_form', {title:'Create Performer', performer: performer, errors: errors.array()});
            return;
        } else {
            Performer.findOne({'name': req.body.name})
                .exec(function(err, found_performer) {
                    if (err) {return next(err);}
                    if (found_performer) {
                        res.redirect(found_performer.url);
                    } else {
                        performer.save(function(err) {
                            res.redirect(performer.url);
                        });
                    }
                });
        }
    }
];

// Display Performer delete form on GET.
exports.performer_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Performer delete GET');
};

// Handle Performer delete on POST.
exports.performer_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Performer delete POST');
};

// Display Performer update form on GET.
exports.performer_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Performer update GET');
};

// Handle Performer update on POST.
exports.performer_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Performer update POST');
};
