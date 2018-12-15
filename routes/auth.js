'use strict';

const express   = require('express');
const router    = express.Router();

const validator   =  require( '../validators/auth' );

const auth        = require( '../middlewares/auth' );
const noAuth      = require( '../middlewares/no-auth' );
const refreshToken= require( '../middlewares/refresh-token' );
const controller  = require( '../controllers/auth' );

router.post( '/signup',   [ noAuth ].concat( validator.signup ), controller.Signup );
router.post( '/signin',   [ noAuth ].concat( validator.signin ), controller.Signin );
router.post( '/signout',  [ auth ], controller.SignOut );
router.post( '/password/recover',   [ noAuth ].concat( validator.password_recover ), controller.PasswordRecover );
router.post( '/password/reset/:token',   [ noAuth ].concat( validator.password_reset ), controller.PasswordReset );
router.post( '/token/refresh', [ refreshToken ], controller.RefreshToken );

module.exports = router;
