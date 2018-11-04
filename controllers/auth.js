const { validationResult }  = require( 'express-validator/check' );
const repository            = require( '../repositories/user' );

exports.signup = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );

        if ( ! errors.isEmpty() ) 
            return res.status(422).json({ errors: errors.array() });

        const user = await repository.create( req.body );

        // Todo send welcome email
        res.status( 201 ).json( { message: "Cadastro realizado com sucesso", user } )
    }
    catch ( err ) {
        res.status( 500 ).json({ message: "Erro ao cadastrar usuário", err });
    }
};