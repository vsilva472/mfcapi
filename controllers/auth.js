'use strict';

const { validationResult }  = require( 'express-validator/check' );
const jwt                   = require( 'jsonwebtoken' );

const randomDigits          = require( '../modules/random-numbers' );
const repository            = require( '../repositories/user' );
const jwtConfig             = require( '../config/jwt' );
const mailer                = require( '../modules/mailer' );

exports.Signup = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );

        if ( ! errors.isEmpty() ) 
            return res.status(422).json({ errors: errors.array() });

        const user = await repository.create({ 
            name: req.body.name, 
            email: req.body.email, 
            password: req.body.password 
        });

        mailer.send( user.email, 'Bem-vindo(a)!', 'welcome', {
            email: user.email,
            name: user.name
        }, ( error, info ) => {});

        res.status( 201 ).json( { message: "Cadastro realizado com sucesso" } );
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
        
        const sessid = randomDigits.generate( 9999999, true );
        const token = jwt.sign({ id: user.id, role: user.role, sessid}, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );
        const refresh_token = jwt.sign({ id: user.id, role:user.role, sessid}, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshTTL } );
        const payload = jwt.decode( refresh_token );

        await repository.saveSessid( user.id, sessid, payload.exp * 1000);
        
        res.status( 200 ).json({ user: {
            id: user.id,
            name: user.name,
            email: user.email,
        }, token, refresh_token });
    }
    catch ( e ) {
        console.log(e);
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

        mailer.send( user.email, 'Recuperar Senha', 'password-recover', {
            email: user.email,
            name: user.name,
            token: token
        }, ( error, info ) => {
            if ( error ) {
                return res.status( 500 ).json({ message: 'Não foi possível enviar o email de recuperação de senha.' });
            }
            onSuccess();
        });
    }
    catch ( e ) {
        res.status( 500 ).json({ 
            message: 'Ocorreu um erro no processo de recuperação de senha. Por favor tente novamente mais tarde', 
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

        await repository.removeRefreshTokens({ UserId: user.id });

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

exports.RefreshToken = async ( req, res, next ) => {
    try {
        const { id, role, sessid } = req;
        const refreshTokenFromDd = await repository.findRefreshToken({ UserId: id, sessid });

        if ( ! refreshTokenFromDd || refreshTokenFromDd.sessid != sessid ) {
            return res.status( 401 ).json({ message: "The give refresh token is not allowed", code: 159 });
        }

        const token = jwt.sign({ id, role: role, sessid}, jwtConfig.secret, { expiresIn: jwtConfig.ttl } );
        res.status( 200 ).json( { token } );
    }
    catch ( err ) { 
        res.status( 500 ).json( { message: "Error while try to refresh token" } );
    }
};

exports.SignOut = async ( req, res, next ) => {
    try {
        const UserId = req.userId;
        const sessid = req.sessid;
        const payload = { UserId, sessid };

        await repository.removeRefreshTokens( payload );

        return res.status( 200 ).json({ message: 'Successful signout' });

    } catch ( err ) {
        console.log( err );
        res.status( 500 ).json({ message: 'Error while logout. Please try again.' });
    }
};