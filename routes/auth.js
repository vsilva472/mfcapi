const express   = require('express');
const router    = express.Router();

const validator   =  require( '../validators/auth' );

const noAuth      = require( '../middlewares/no-auth' );
const controller  = require( '../controllers/auth' );

router.post( '/signup',   [ noAuth ].concat( validator.signup ), controller.signup );

module.exports = router;
