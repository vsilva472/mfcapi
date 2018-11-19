'use strict';

const { check }     = require( 'express-validator/check' );

exports.create = [
    check( 'label' )
        .isLength({min: 3, max: 25})
        .withMessage( 'O nome da categoria deve ter entre 3 e 25 caracteres' ),

    check( 'color' )
        .matches(/^#[A-Fa-f0-9]{6}$/)
        .withMessage( 'Cor inválida.' )

];