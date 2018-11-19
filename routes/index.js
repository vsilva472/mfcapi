'use strict';

const express = require( 'express' );
const router  = express.Router();
const version = require( '../package.json' )[ 'version' ];

router.get( '/', ( req, res, next ) => {
  res.status( 200 ).json({ message: `Hello My Financial Control Api v${version}` });
});

router.post( '/', ( req, res, next ) => {
  res.status( 200 ).json({ message: `Hello My Financial Control Api v${version}` });
});

module.exports = router;
