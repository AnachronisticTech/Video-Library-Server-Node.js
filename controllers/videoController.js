var Video = require('../models/video');
var Tag = require('../models/tag');
var Producer = require('../models/producer');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = function(req, res) {
    async.parallel({
        video_count: function(callback) {
            Video.countDocuments({}, callback);
        },
        producer_count: function(callback) {
            Producer.countDocuments({}, callback);
        },
        tag_count: function(callback) {
            Tag.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', {title: 'Library Home', error: err, data: results});
    });
};

// Display list of all videos.
exports.video_list = function(req, res, next) {
    Video.find()
        .sort([['title', 'ascending']])
        .exec(function (err, list_videos) {
            if (err) { return next(err); }
            res.render('video_list', {title: 'Video list', video_list: list_videos});
        });
};

// Display detail page for a specific video.
exports.video_detail = function(req, res, next) {
    async.parallel({
        video: function(callback) {

            Video.findById(req.params.id)
              .populate('tag')
              .exec(callback);
        },
        video_instance: function(callback) {

          VideoInstance.find({ 'video': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.video==null) { // No results.
            var err = new Error('Video not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('video_detail', { title: 'Title', video: results.video, video_instances: results.video_instance } );
    });
};

// Display video create form on GET.
exports.video_create_get = function(req, res, next) {
    async.parallel({
        tags: function(callback) {
            Tag.find(callback);
        },
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('video_form', {title: 'Create Video', producers: results.producers, tags: results.tags});
    });
};

// Handle video create on POST.
exports.video_create_post = [
    (req, res, next) => {
        if (!(req.body.tag instanceof Array)) {
            if (typeof req.body.tag === 'undefined') {
                req.body.tag = [];
            } else {
                req.body.tag = new Array(req.body.tag);
            }
        }
        next();
    },
    sanitizeBody('tag.*').escape(),
    body('title', 'Title must not be empty').isLength({min: 1}).trim(),
    body('summary', 'Summary must not be empty').isLength({min: 1}).trim(),
    sanitizeBody('*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var video = new Video({
            title: req.body.title,
            summary: req.body.summary,
            tag: req.body.tag
        });
        if (!errors.isEmpty()) {
            async.parallel({
                tags: function(callback) {
                    Tag.find(callback);
                }
            }, function(err, results) {
                if (err) {return next(err);}
                for (let i = 0; i < results.tags.length; i++) {
                    if (video.tag.indexOf(results.tags[i]._id) > -1) {
                        results.tags[i].checked = 'true';
                    }
                }
                res.render('video_form', {title: 'Create Video', tags: results.tags, video: video, errors: errors.array()});
            });
            return;
        } else {
            video.save(function(err) {
                if (err) {return next(err);}
                res.redirect(video.url);
            });
        }
    }
];

// Display video delete form on GET.
exports.video_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Video delete GET');
};

// Handle video delete on POST.
exports.video_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Video delete POST');
}

// Display video update form on GET.
exports.video_update_get = function(req, res, next) {
    async.parallel({
        video: function(callback) {
            Video.findById(req.params.id).populate('tag').exec(callback);
        },
        tags: function(callback) {
            Tag.find(callback);
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.video == null) {
            var err = new Error('Video not found');
            err.status = 404;
            return next(err);
        }
        for (var all_g_iter = 0; all_g_iter < results.tags.length; all_g_iter++) {
            for (var video_g_iter = 0; video_g_iter < results.video.tag.length; video_g_iter++) {
                if (results.tags[all_g_iter]._id.toString() == results.video.tag[video_g_iter]._id.toString()) {
                    results.tags[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('video_form', {title: 'Update Video', tags: results.tags, video: results.video});
    });
};

// Handle video update on POST.
exports.video_update_post = [
    (req, res, next) => {
        if (!(req.body.tag instanceof Array)) {
            if (typeof req.body.tag === 'undefined') {
                req.body.tag = [];
            } else {
                req.body.tag = new Array(req.body.tag);
            }
        }
        next();
    },
    body('title','Title must not be empty').isLength({min: 1}).trim(),
    body('summary','Summary must not be empty').isLength({min: 1}).trim(),
    sanitizeBody('title').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('tag.*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var video = new Video({
            title: req.body.title,
            summary: req.body.summary,
            tag: (typeof req.body.tag === 'undefined') ? [] : req.body.tag,
            _id: req.params.id
        });
        if (!errors.isEmpty()) {
            async.parallel({
                tags: function(callback) {
                    Tag.find(callback);
                }
            }, function(err, results) {
                if (err) {return next(err);}
                for (let i = 0; i < results.tags.length; i++) {
                    if (video.tag.indexOf(results.tags[i]._id) > -1) {
                        results.tags[i].checked = 'true';
                    }
                }
                res.render('video_form', {title: 'Update Video', tags: results.tags, video: video, errors: errors.array()});
                return;
            });
        } else {
            Video.findByIdAndUpdate(req.params.id, video, {}, function(err, thevideo) {
                if (err) {return next(err);}
                res.redirect(thevideo.url);
            })
        }
    }
];
