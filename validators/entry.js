'use strict';

const { check }     = require( 'express-validator/check' );
const categoryRepository = require( '../repositories/category' );
const checkCategoriesOwner = async ( values, { req } ) => {
    const categories = await Promise.all( values.map( async id => {
        let category = await categoryRepository.findOne( { id } );
        if ( ! category ) return 0;

        return category.UserId;
    } ) );

    const otherUserCategories = categories.filter( cat => {
        return cat != req.params.user_id;
    });

    return ! otherUserCategories.length;
};

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
            return values.every( element => {
                return !isNaN( element );
            });
        })
        .withMessage( 'Algumas categorias enviadas são inválidas.' )

        .custom( checkCategoriesOwner )
        .withMessage('Você não pode associar a uma entrada uma categoria de outro usuário.')
];

exports.update = [
    check( 'label' )
        .isLength({min: 3, max: 20})
        .withMessage( 'O nome deve ter entre 3 e 20 caracteres.' ),

    check( 'type' )
        .isBoolean()
        .withMessage( 'Tipo de operação inválido.' ),

    check( 'value' )
        .isFloat()
        .withMessage( 'Preço inválido.' ),
    
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
            return values.every( element => {
                return !isNaN( element );
            });
        })
        .withMessage( 'Algumas categorias enviadas são inválidas.' )

        .custom( checkCategoriesOwner )
        .withMessage('Você não pode associar a uma entrada uma categoria de outro usuário.')
        
];