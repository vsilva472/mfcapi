const { validationResult }  = require( 'express-validator/check' );

const repository            = require( '../repositories/user' );

const jwt                   = require( 'jsonwebtoken' );
const jwtConfig             = require( '../config/jwt' );

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

exports.signin = async ( req, res, next ) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult( req );

        if ( ! errors.isEmpty() )
            return res.status( 422 ).json( { errors: errors.array() } );

        const user = await repository.findOne( { email } );

        if ( ! user || ! await user.comparePassword( password ) ) 
            return res.status( 401 ).json( { message: 'Email e/ou Senha inválidos.' } );

        const token     = jwt.sign({ id: user.id }, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );
        
        res.status( 200 ).json({ user: {
            id: user.id,
            name: user.name,
            email: user.email
        }, token });
    }
    catch ( e ) {
        res.status( 500 ).send( { message: e } );
    }
};