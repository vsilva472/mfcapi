const { check }     = require( 'express-validator/check' );

exports.create = [
    check( 'label' )
        .isLength({min: 3, max: 20})
        .withMessage( 'O nome deve ter entre 3 e 20 caracteres.' ),

    check( 'type' )
        .isBoolean()
        .withMessage( 'Tipo de operação inválido.' ),

    check( 'value' )
        .isFloat()
        .withMessage( 'Preço inválido.' ),
    
    check( 'UserId' )
        .isInt({gt: 0})
        .withMessage( 'Usuário inválido.' ),
    
    check( 'registeredAt' )
        .custom( value => {
            return ! isNaN(Date.parse( value ));
        })
        .withMessage( 'Data inválida.' ),

    check( 'categories' )
        .optional()
        .isArray()
        .withMessage( 'Categoria(s) inválida(s).' )
        .custom( values => {
            if ( ! values.isLength ) return true;
            values.forEach( element => {
                if ( isNaN( element ) ) return false;
            });
            return true;
        })
        .withMessage( 'Algumas categorias enviadas são inválidas.' )

];