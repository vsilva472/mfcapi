const express = require('express');
const router  = express.Router();

const Auth = require( '../middlewares/auth' );
const Gate = require( '../middlewares/gate' );

const CategoryController = require( '../controllers/categories' );
const CategoryValidator  = require( '../validators/category' );

const FavoriteController = require( '../controllers/favorites' );
const FavoriteValidator  = require( '../validators/favorite' );

const EntryController = require( '../controllers/entries' );
const EntryValidator  = require( '../validators/entry' );

// CATEGORY ROUTES
router.delete( '/:user_id/categories/:category_id', [ Auth ], CategoryController.destroy );
router.put( '/:user_id/categories/:category_id', [ Auth ], CategoryController.update );
router.get( '/:user_id/categories/:category_id', [ Auth ], CategoryController.show );
router.post( '/:user_id/categories', [ Auth ].concat( CategoryValidator.create ), CategoryController.create );
router.get( '/:user_id/categories', [ Auth ] , CategoryController.index );

// FAVORITE ROUTES
router.delete( '/:user_id/favorites/:favorite_id', [ Auth, Gate ], FavoriteController.destroy );
router.put( '/:user_id/favorites/:favorite_id', [ Auth, Gate ], FavoriteController.update );
router.get( '/:user_id/favorites/:favorite_id', [ Auth, Gate ], FavoriteController.show );
router.post( '/:user_id/favorites', [ Auth ].concat( FavoriteValidator.create ), FavoriteController.create );
router.get( '/:user_id/favorites', [ Auth, Gate ] , FavoriteController.index );

// ENTRIES ROUTES
router.delete( '/:user_id/entries/:entry_id', [ Auth ], EntryController.destroy );
router.put( '/:user_id/entries/:entry_id', [ Auth, Gate ].concat( EntryValidator.update ), EntryController.update );
router.get( '/:user_id/entries/:entry_id', [ Auth, Gate ], EntryController.show );
router.post( '/:user_id/entries', [ Auth, Gate ].concat( EntryValidator.create ), EntryController.create );
router.get( '/:user_id/entries', [ Auth, Gate ] , EntryController.index );

module.exports = router;
