const { check }     = require( 'express-validator/check' );

exports.create = [
    check( 'label' )
        .isLength({min: 3, max: 20})
        .withMessage( 'O nome deve ter entre 3 e 20 caracteres.' ),

    check( 'type' )
        .isBoolean()
        .withMessage( 'Tipo de operação inválido.' ),

    check( 'price' )
        .isFloat()
        .withMessage( 'Preço inválido.' ),
    
    check( 'UserId' )
        .isInt({gt: 0})
        .withMessage( 'Usuário inválido.' ),

    check( 'CategoryId' )
        .isInt({gt: 0})
        .withMessage( 'Categoria inválida.' )

];