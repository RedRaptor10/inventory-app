var express = require('express');
var router = express.Router();

// Require controller modules.
var game_controller = require('../controllers/gameController');
var publisher_controller = require('../controllers/publisherController');
var platform_controller = require('../controllers/platformController');
var genre_controller = require('../controllers/genreController');

/// GAME ROUTES ///

// GET catalog home page.
router.get('/', game_controller.index);

// GET request for creating a Game. NOTE This must come before routes that display Game (uses id).
router.get('/game/create', game_controller.game_create_get);

// POST request for creating Game.
router.post('/game/create', game_controller.game_create_post);

// GET request to delete Game.
router.get('/game/:id/delete', game_controller.game_delete_get);

// POST request to delete Game.
router.post('/game/:id/delete', game_controller.game_delete_post);

// GET request to update Game.
router.get('/game/:id/update', game_controller.game_update_get);

// POST request to update Game.
router.post('/game/:id/update', game_controller.game_update_post);

// GET request for one Game.
router.get('/game/:id', game_controller.game_detail);

// GET request for list of all Game items.
router.get('/games', game_controller.game_list);

/// PUBLISHER ROUTES ///

// GET request for creating Publisher. NOTE This must come before route for id (i.e. display publisher).
router.get('/publisher/create', publisher_controller.publisher_create_get);

// POST request for creating Publisher.
router.post('/publisher/create', publisher_controller.publisher_create_post);

// GET request to delete Publisher.
router.get('/publisher/:id/delete', publisher_controller.publisher_delete_get);

// POST request to delete Publisher.
router.post('/publisher/:id/delete', publisher_controller.publisher_delete_post);

// GET request to update Publisher.
router.get('/publisher/:id/update', publisher_controller.publisher_update_get);

// POST request to update Publisher.
router.post('/publisher/:id/update', publisher_controller.publisher_update_post);

// GET request for one Publisher.
router.get('/publisher/:id', publisher_controller.publisher_detail);

// GET request for list of all Publishers.
router.get('/publishers', publisher_controller.publisher_list);

/// PLATFORM ROUTES ///

// GET request for creating a Platform. NOTE This must come before route that displays Platform (uses id).
router.get('/platform/create', platform_controller.platform_create_get);

// POST request for creating Platform.
router.post('/platform/create', platform_controller.platform_create_post);

// GET request to delete Platform.
router.get('/platform/:id/delete', platform_controller.platform_delete_get);

// POST request to delete Platform.
router.post('/platform/:id/delete', platform_controller.platform_delete_post);

// GET request to update Platform.
router.get('/platform/:id/update', platform_controller.platform_update_get);

// POST request to update Platform.
router.post('/platform/:id/update', platform_controller.platform_update_post);

// GET request for one Platform.
router.get('/platform/:id', platform_controller.platform_detail);

// GET request for list of all Platform.
router.get('/platforms', platform_controller.platform_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

// POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);

module.exports = router;