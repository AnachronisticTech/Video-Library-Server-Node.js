var Video = require('../models/video');
var Tag = require('../models/tag');
var Producer = require('../models/producer');
var async = require('async');
var fs = require('fs');
var ydl = require('youtube-dl');

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
            // res.render('video_list', {title: 'Video list', video_list: list_videos});
            res.send(list_videos);
        });
};

// Display detail page for a specific video.
exports.video_detail = function(req, res, next) {
    async.parallel({
        video: function(callback) {

            Video.findById(req.params.id)
              .populate('tags')
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
        // res.render('video_detail', { title: 'Title', video: results.video } );
        res.send(results.video);
    });
};

// Provide link to video file
exports.video_file_get = function(req, res, next) {
    async.parallel({
        video: function(callback) {

            Video.findById(req.params.id)
              .populate('tags')
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
        // res.render('video_detail', { title: 'Title', video: results.video } );
        res.sendFile(results.video.filename, {root: './public/new_videos/'});
    });

}

// Display video create form on GET.
exports.video_create_get = function(req, res, next) {
    async.parallel({
        tags: function(callback) {
            Tag.find(callback);
        },
        producers: function(callback) {
            Producer.find(callback);
        }
    }, function(err, results) {
        if (err) {return next(err);}
        res.render('video_form', {title: 'Create Video', producers: results.producers, tags: results.tags});
    });
};

// Handle video create on POST.
exports.video_create_post = [
    body('link', 'Link must not be empty').isLength({min: 1}).trim(),
    // sanitizeBody('*').escape(),
    (req, res, next) => {
        // const errors = validationResult(req);
        var link = decodeURI(req.body.link);
        var filename = '';
        var dl = ydl(link, ['--format=18', '-i']); // <-- SETTINGS FOR YOUTUBE-DL HERE
        dl.on('info', function(info) {
            console.log('Download started');
            console.log('filename: ' + info._filename);
            filename = info._filename;
            console.log('size: ' + info.size);
            var video = new Video({
                title: filename,
                filename: filename,
                tags: [],
            });
            video.save(function(err) {
                if (err) {return next(err);}
                res.redirect(video.url);
            });
        })
        dl.pipe(fs.createWriteStream('./public/new_videos/tmp.mp4'));
        dl.on('end', function() {
            console.log('Download complete');
            console.log('filename: '+filename);
            fs.rename('./public/new_videos/tmp.mp4','./public/new_videos/'+filename, function(err) {
                if (err) {console.log('Could not rename: '+err);}
            });
        })
        // var video = new Video({
        //     title: filename,
        //     filename: filename,
        // });
        // if (!errors.isEmpty()) {
        //     async.parallel({
        //         tags: function(callback) {
        //             Tag.find(callback);
        //         }
        //     }, function(err, results) {
        //         if (err) {return next(err);}
        //         for (let i = 0; i < results.tags.length; i++) {
        //             if (video.tag.indexOf(results.tags[i]._id) > -1) {
        //                 results.tags[i].checked = 'true';
        //             }
        //         }
        //         res.render('video_form', {title: 'Create Video', tags: results.tags, video: video, errors: errors.array()});
        //     });
        //     return;
        // } else {
            // video.save(function(err) {
            //     if (err) {return next(err);}
            //     res.redirect(video.url);
            // });
        // }
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
            Video.findById(req.params.id).populate('tags').exec(callback);
        },
        tags: function(callback) {
            Tag.find(callback);
        },
        producers: function(callback) {
            Producer.find(callback);
        }
    }, function(err, results) {
        if (err) {return next(err);}
        if (results.video == null) {
            var err = new Error('Video not found');
            err.status = 404;
            return next(err);
        }
        for (var all_g_iter = 0; all_g_iter < results.tags.length; all_g_iter++) {
            for (var video_g_iter = 0; video_g_iter < results.video.tags.length; video_g_iter++) {
                if (results.tags[all_g_iter]._id.toString() == results.video.tags[video_g_iter]._id.toString()) {
                    results.tags[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('video_update', {title: 'Update Video', tags: results.tags, producers: results.producers, video: results.video});
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
    sanitizeBody('title').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('producer').escape(),
    sanitizeBody('tags.*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        // if (typeof req.body.producer !== 'undefined' && !Producer.findById(req.body.producer)) {
        //     var producer = new Producer({
        //         name: req.body.producer,
        //     });
        //     producer.save(function(err) {
        //         if (err) {return next(err);}
        //     });
        // }
        var video = new Video({
            title: req.body.title,
            summary: req.body.summary,
            tags: (typeof req.body.tag === 'undefined') ? [] : req.body.tag,
            _id: req.params.id
        });
        if (!errors.isEmpty()) {
            async.parallel({
                tags: function(callback) {
                    Tag.find(callback);
                }
            }, function(err, results) {
                if (err) {return next(err);}
                // if (!typeof results.tags === 'undefined') {
                    for (let i = 0; i < results.tags.length; i++) {
                        if (video.tag.indexOf(results.tags[i]._id) > -1) {
                            results.tags[i].checked = 'true';
                        }
                    }
                // }
                res.render('video_update', {title: 'Update Video', tags: results.tags, video: video, errors: errors.array()});
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
