const express = require('express');
const router  = express.Router();

const Auth = require( '../middlewares/auth' );

const CategoryController = require( '../controllers/categories' );
const CategoryValidator  = require( '../validators/category' );

// CATEGORY ROUTES
router.delete( '/:user_id/categories/:category_id', [ Auth ], CategoryController.destroy );
router.put( '/:user_id/categories/:category_id', [ Auth ], CategoryController.update );
router.get( '/:user_id/categories/:category_id', [ Auth ], CategoryController.show );
router.post( '/:user_id/categories', [ Auth ].concat( CategoryValidator.create ), CategoryController.create );
router.get( '/:user_id/categories', [ Auth ] , CategoryController.index );


module.exports = router;
