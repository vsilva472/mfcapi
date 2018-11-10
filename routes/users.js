const express = require('express');
const router  = express.Router();

const Auth = require( '../middlewares/auth' );

const CategoryController = require( '../controllers/categories' );
const CategoryValidator  = require( '../validators/category' );

const FavoriteController = require( '../controllers/favorites' );
const FavoriteValidator  = require( '../validators/favorite' );

// CATEGORY ROUTES
router.delete( '/:user_id/categories/:category_id', [ Auth ], CategoryController.destroy );
router.put( '/:user_id/categories/:category_id', [ Auth ], CategoryController.update );
router.get( '/:user_id/categories/:category_id', [ Auth ], CategoryController.show );
router.post( '/:user_id/categories', [ Auth ].concat( CategoryValidator.create ), CategoryController.create );
router.get( '/:user_id/categories', [ Auth ] , CategoryController.index );

// FAVORITE ROUTES
router.delete( '/:user_id/favorites/:favorite_id', [ Auth ], FavoriteController.destroy );
router.put( '/:user_id/favorites/:favorite_id', [ Auth ], FavoriteController.update );
router.get( '/:user_id/favorites/:favorite_id', [ Auth ], FavoriteController.show );
router.post( '/:user_id/favorites', [ Auth ].concat( FavoriteValidator.create ), FavoriteController.create );
router.get( '/:user_id/favorites', [ Auth ] , FavoriteController.index );

module.exports = router;
