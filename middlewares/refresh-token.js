'use strict';

const jwt  = require( 'jsonwebtoken' );
const { secret, refreshSecret } = require( '../config/jwt' )[ process.env.NODE_ENV || 'development' ];

module.exports = ( req, res, next ) => {
    const authHeader = req.headers.authorization;
    const refreshToken = req.body.refresh_token;

    if ( !authHeader )
        return res.status( 400 ).send({ message: 'No token provided', code: 150 });
    
    const tokenParts = authHeader.split( ' ' );
    
    if ( tokenParts.length !== 2 ) return res.status( 400 ).send({ message: 'Token error', code: 151 });

    const [ scheme, token ] = tokenParts;

    if ( ! /^Bearer$/i.test( scheme ) ) return res.status( 400 ).send({ message: 'Token type error', code: 152 });
    
    if ( token.length < 10 ) return res.status( 400 ).send({ message: 'Token invalid', code: 153 });

    jwt.verify( token, secret, ( err, decoded ) => {
        let tokenPayload;

        if ( err ) {
            if ( err.name && err.name == 'TokenExpiredError' )
                tokenPayload = jwt.decode( token ); // token is trusted
            else return res.status( 400 ).json({ message: 'Token Verify error', code: 154 });
        }
        if ( decoded ) // token valid and not expired
            return res.status( 200 ).json({ token });

        // lets verify if refreshToken is valid
        if ( ! refreshToken || refreshToken.length < 10) 
            return res.status( 400 ).json({ message: 'Refresh Token Invalid', code: 155 });
        
            jwt.verify( refreshToken, refreshSecret, ( err, refreshTokenPayload ) => {
                if ( err && err.name && err.name == 'TokenExpiredError' )
                    return res.status( 401 ).json({ message: 'Refresh Token expired. Signin again.', code: 156 });
                if ( err )
                    return res.status( 400 ).json({ message: 'Refresh Token verification failed', code: 157 });
                
                // refresh token valid
                // lets check token payload with decoded refresh token
                if ( tokenPayload.id === refreshTokenPayload.id && tokenPayload.sessid === refreshTokenPayload.sessid ) {
                    req.id  = refreshTokenPayload.id;
                    req.sessid  = refreshTokenPayload.sessid;
                    req.role = refreshTokenPayload.role;

                    return next();
                }
                return res.status( 403 ).json({ message: 'You really want do that?!', code: 158 });
            });
    });
};