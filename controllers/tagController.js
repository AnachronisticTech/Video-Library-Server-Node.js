var Tag = require('../models/tag');
var Video = require('../models/video');
var async = require('async');

const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Tag.
exports.tag_list = function(req, res, next) {
    // Display list of all VideoInstances.
    
    Tag.find()
        .populate('tag').select('name')
        .exec(function (err, list_tags) {
            if (err) { return next(err); }
            // Successful, so render
            // res.render('tag_list', { title: 'Tag List', tag_list: list_tags });
            res.send(list_tags);
        });
};

// Display detail page for a specific Tag.
exports.tag_detail = function(req, res, next) {
    async.parallel({
        tag: function(callback) {
            Tag.findById(req.params.id)
              .exec(callback);
        },

        tag_videos: function(callback) {
            Video.find({ 'tags': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.tag==null) { // No results.
            var err = new Error('Tag not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('tag_detail', { title: 'Tag Detail', tag: results.tag, tag_videos: results.tag_videos } );
    });
};

// Display Tag create form on GET.
exports.tag_create_get = function(req, res, next) {
    res.render('tag_form', {title: 'Create Tag'});
};

// Handle Tag create on POST.
exports.tag_create_post = [
    body('name', 'Tag name required').isLength({min: 1}).trim(),
    sanitizeBody('name').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var tag = new Tag({name: req.body.name});
        if (!errors.isEmpty()) {
            res.render('tag_form', {title:'Create Tag', tag: tag, errors: errors.array()});
            return;
        } else {
            Tag.findOne({'name': req.body.name})
                .exec(function(err, found_tag) {
                    if (err) {return next(err);}
                    if (found_tag) {
                        res.redirect(found_tag.url);
                    } else {
                        tag.save(function(err) {
                            res.redirect(tag.url);
                        });
                    }
                });
        }
    }
];

// Display Tag delete form on GET.
exports.tag_delete_get = function(req, res, next) {
    async.parallel({
        tag: function(callback) {
            Tag.findById(req.params.id).exec(callback);
        },
        tags_videos: function(callback) {
            Video.find({'tag': req.params.id}).exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.tag == null) {
            res.redirect('/library/tags');
        }
        res.render('tag_delete', {title: 'Delete Tag', tag: results.tag, tag_videos: results.tags_videos});
    });
};

// Handle Tag delete on POST.
exports.tag_delete_post = function(req, res, next) {
    async.parallel({
        tag: function(callback) {
            Tag.findById(req.body.tagid).exec(callback);
        },
        tags_videos: function(callback) {
            Video.find({'tag': req.body.tagid}).exec(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.tags_videos.length > 0) {
            res.render('tag_delete', {title: 'Delete Tag', tag: results.tag, tag_videos: results.tag_videos});
            return;
        } else {
            Tag.findByIdAndRemove(req.body.tagid, function deleteTag(err) {
                if (err) {return next(err);}
                res.redirect('/library/tags');
            });
        }
    });
};

// Display Tag update form on GET.
exports.tag_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Tag update GET');
};

// Handle Tag update on POST.
exports.tag_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Tag update POST');
};
