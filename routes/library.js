var express = require('express');
var router = express.Router();

// Require controller modules.
var video_controller = require('../controllers/videoController');
var tag_controller = require('../controllers/tagController');
var producer_controller = require('../controllers/producerController');
var performer_controller = require('../controllers/performerController');

/// VIDEO ROUTES ///

// GET catalog home page.
router.get('/', video_controller.index);

// GET request for creating a Video. NOTE This must come before routes that display Video (uses id).
router.get('/video/create', video_controller.video_create_get);

// POST request for creating Video.
router.post('/video/create', video_controller.video_create_post);

// GET request to delete Video.
router.get('/video/:id/delete', video_controller.video_delete_get);

// POST request to delete Video.
router.post('/video/:id/delete', video_controller.video_delete_post);

// GET request to update Video.
router.get('/video/:id/update', video_controller.video_update_get);

// POST request to update Video.
router.post('/video/:id/update', video_controller.video_update_post);

// GET request for one Video.
router.get('/video/:id', video_controller.video_detail);

// GET request for list of all Video items.
router.get('/videos', video_controller.video_list);

/// PRODUCER ROUTES ///

// GET request for creating Producer. NOTE This must come before route for id (i.e. display producer).
router.get('/producer/create', producer_controller.producer_create_get);

// POST request for creating Producer.
router.post('/producer/create', producer_controller.producer_create_post);

// GET request to delete Producer.
router.get('/producer/:id/delete', producer_controller.producer_delete_get);

// POST request to delete Producer.
router.post('/producer/:id/delete', producer_controller.producer_delete_post);

// GET request to update Producer.
router.get('/producer/:id/update', producer_controller.producer_update_get);

// POST request to update Producer.
router.post('/producer/:id/update', producer_controller.producer_update_post);

// GET request for one Producer.
router.get('/producer/:id', producer_controller.producer_detail);

// GET request for list of all Producers.
router.get('/producers', producer_controller.producer_list);

/// PERFORMER ROUTES ///

// GET request for creating Performer. NOTE This must come before route for id (i.e. display performer).
router.get('/performer/create', performer_controller.performer_create_get);

// POST request for creating Performer.
router.post('/performer/create', performer_controller.performer_create_post);

// GET request to delete Performer.
router.get('/performer/:id/delete', performer_controller.performer_delete_get);

// POST request to delete Performer.
router.post('/performer/:id/delete', performer_controller.performer_delete_post);

// GET request to update Performer.
router.get('/performer/:id/update', performer_controller.performer_update_get);

// POST request to update Performer.
router.post('/performer/:id/update', performer_controller.performer_update_post);

// GET request for one Performer.
router.get('/performer/:id', performer_controller.performer_detail);

// GET request for list of all Performers.
router.get('/performers', performer_controller.performer_list);

/// TAG ROUTES ///

// GET request for creating a Tag. NOTE This must come before route that displays Tag (uses id).
router.get('/tag/create', tag_controller.tag_create_get);

//POST request for creating Tag.
router.post('/tag/create', tag_controller.tag_create_post);

// GET request to delete Tag.
router.get('/tag/:id/delete', tag_controller.tag_delete_get);

// POST request to delete Tag.
router.post('/tag/:id/delete', tag_controller.tag_delete_post);

// GET request to update Tag.
router.get('/tag/:id/update', tag_controller.tag_update_get);

// POST request to update Tag.
router.post('/tag/:id/update', tag_controller.tag_update_post);

// GET request for one Tag.
router.get('/tag/:id', tag_controller.tag_detail);

// GET request for list of all Tag.
router.get('/tags', tag_controller.tag_list);

module.exports = router;
