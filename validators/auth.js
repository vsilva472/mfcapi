'use strict'

const { check }     = require( 'express-validator/check' );
const repository    = require( '../repositories/user' );

exports.signup = [
    check( 'email' )
        .isEmail().withMessage( 'Email inválido' )
        .custom( async value => {
            var user = await repository.findOne( { email:value } )
			return user == null;
        }) .withMessage('Email já está em uso'),
    
    check( 'name' )
        .isLength({min: 3, max: 20}).withMessage('O Nome deve ter entre 3 e 20 caracteres.'),

    check( 'password' )
        .isLength({min: 3, max: 21}).withMessage('A senha deve ser composta de 3 a 21 caracteres.'),

    check( 'password_conf' )
        .custom( ( password_conf, { req } ) => {
            return password_conf === req.body.password;
        } ).withMessage('A senha e sua confirmação não são iguais.')

];

exports.signin = [
    check( 'email' )
        .isEmail().withMessage( 'Email inválido' ),
    check( 'password' )
        .isLength({min: 3, max: 21}).withMessage('A senha deve ser composta de 3 a 21 caracteres.'),

];

exports.password_recover = [
    check( 'email' )
        .isEmail().withMessage( 'Email inválido' )
];

exports.password_reset = [
    check( 'email' )
        .isEmail().withMessage( 'Email inválido' ),
    
    check( 'password' )
        .isLength({ min: 3, max: 21 }).withMessage('A senha deve ser composta de 3 a 21 caracteres.'),

    check( 'password_conf' )
        .custom( ( password_conf, { req } ) => {
            return password_conf === req.body.password;
        }).withMessage('A senha e sua confirmação não são iguais.')
];