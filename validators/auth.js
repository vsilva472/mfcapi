'use strict'

const { check }     = require( 'express-validator/check' );
const repository    = require( '../repositories/user' );
const messages = {
    email: {
        invalid: 'Email inválido',
        alreadyInUse: 'Este email já está em uso. Por favor escolha outro.'
    },
    name: {
        invalid: 'O Nome deve ter entre 3 e 20 caracteres.'
    },
    password: {
        invalid: 'A senha deve ser composta de 3 a 21 caracteres.'
    },
    password_conf: {
        invalid: 'A senha e sua confirmação não são iguais.'
    }
};
exports.signup = [
    check( 'email' )
        .isEmail().withMessage( messages.email.invalid )
        .custom( async value => {
            var user = await repository.findOne( { email:value } )
			return user == null;
        }) .withMessage( messages.email.alreadyInUse ),
    
    check( 'name' )
        .isLength({min: 3, max: 20}).withMessage( messages.name.invalid ),

    check( 'password' )
        .isLength({min: 3, max: 21}).withMessage( messages.password.invalid ),

    check( 'password_conf' )
        .custom( ( value, { req } ) => {
            if ( ! value || ( value !== req.body.password ) ) return false;
            return true;
        } ).withMessage( messages.password_conf.invalid )

];

exports.signin = [
    check( 'email' )
        .isEmail().withMessage( messages.email.invalid ),
    check( 'password' )
        .isLength({min: 3, max: 21}).withMessage( messages.password.invalid ),

];

exports.password_recover = [
    check( 'email' )
        .isEmail().withMessage( messages.email.invalid )
];

exports.password_reset = [
    check( 'email' )
        .isEmail().withMessage( messages.email.invalid ),
    
    check( 'password' )
        .isLength({ min: 3, max: 21 }).withMessage( messages.password.invalid ),

    check( 'password_conf' )
        .custom( ( value, { req } ) => {
            if ( ! value || ( value !== req.body.password ) ) return false;
            return true;
        }).withMessage( messages.password_conf.invalid )
];