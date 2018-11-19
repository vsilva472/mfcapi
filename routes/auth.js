'use strict';

const express   = require('express');
const router    = express.Router();

const validator   =  require( '../validators/auth' );

const noAuth      = require( '../middlewares/no-auth' );
const controller  = require( '../controllers/auth' );

router.post( '/signup',   [ noAuth ].concat( validator.signup ), controller.Signup );
router.post( '/signin',   [ noAuth ].concat( validator.signin ), controller.Signin );
router.post( '/password/recover',   [ noAuth ].concat( validator.password_recover ), controller.PasswordRecover );
router.post( '/password/reset/:token',   [ noAuth ].concat( validator.password_reset ), controller.PasswordReset );

module.exports = router;
