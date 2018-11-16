const { validationResult }  = require( 'express-validator/check' );
const jwt                   = require( 'jsonwebtoken' );

const randomDigits          = require( '../modules/random-numbers' );
const repository            = require( '../repositories/user' );
const jwtConfig             = require( '../config/jwt' );

exports.Signup = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );

        if ( ! errors.isEmpty() ) 
            return res.status(422).json({ errors: errors.array() });

        await repository.create({ 
            name: req.body.name, 
            email: req.body.email, 
            password: req.body.password 
        });

        // Todo send welcome email
        res.status( 201 ).json( { message: "Cadastro realizado com sucesso" } )
    }
    catch ( err ) {
        res.status( 500 ).json({ message: "Erro ao cadastrar usuário", err });
    }
};

exports.Signin = async ( req, res, next ) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult( req );

        if ( ! errors.isEmpty() )
            return res.status( 422 ).json( { errors: errors.array() } );

        const user = await repository.findOne( { email } );

        if ( ! user || ! await user.comparePassword( password ) ) 
            return res.status( 401 ).json( { message: 'Email e/ou Senha inválidos.' } );
        
        const token = jwt.sign({ id: user.id, role: user.role}, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );
        
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

exports.PasswordRecover = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );
        const email     = req.body.email;

        const token     = randomDigits.generate( 9999, true );
        const now       = new Date();

        const onSuccess = () => {
            return res.status( 200 ).json({ 
                message: 'Se este email existe em nossa base, Foi enviado um email com instruções para criar uma nova senha.' 
            });
        };
        
        now.setHours( now.getHours() + 1 );
        
        if ( ! errors.isEmpty() ) return res.status( 422 ).json( { errors: errors.array() } );

        const user = await repository.findOne( { email } );

        if ( ! user ) return onSuccess();

        await repository.update( user, { password_reset_token: token, password_reset_expires: now });

        // TODO send password email
        return onSuccess();
    }
    catch ( e ) {
        res.status( 500 ).json({ 
            message: 'Ocorreu um no processo de recuperação de senha.', 
            error: e
        });
    }
};

exports.PasswordReset = async ( req, res, next ) => {
    const { email, password } = req.body;
    const token = req.params.token;

    try {
        const errors = validationResult( req );
        const now    = new Date();
        
        if ( ! errors.isEmpty() ) return res.status( 422 ).json({ errors: errors.array() });

        const user = await repository.findOne( { email });

        if ( ! user ) 
            return res.status( 400 ).json({ message: 'Usuário não encontrado.' });

        if ( token !== user.password_reset_token )  
            return res.status( 400 ).json({ message: 'Token inválido' });

        if ( now > user.password_reset_expires )
            return res.status( 400 ).json({ message: 'Seu token expirou. Por favor refaça o processo para recuperar senha.' });

        await repository.update( user, { 
            password: password,
            password_reset_token: null, 
            password_reset_expires: null
         });

        // TODO send email to user notifying that your password was changed
        return res.status( 200 ).json( { message: 'Nova senha criada com sucesso.' } );
    }
    catch ( e ) {
        res.status( 500 ).json( { message: 'Erro ao reinicializar a senha', error: e } );
    }
};