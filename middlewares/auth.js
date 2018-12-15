'use strict';

const jwt           = require( 'jsonwebtoken' );
const { secret }    = require( '../config/jwt' )[ process.env.NODE_ENV || 'development' ];

module.exports = ( req, res, next ) => {
    const authHeader = req.headers.authorization;

    if ( !authHeader )
        return res.status( 401 ).send({ message: 'No token provided' });
    
    const tokenParts = authHeader.split( ' ' );
    
    if ( ! tokenParts.length === 2 ) return res.status( 401 ).send({ message: 'Token error' });

    const [ scheme, token ] = tokenParts;

    if ( ! /^Bearer$/i.test( scheme ) ) return res.status( 401 ).send({ message: 'Token type error' });
    
    if ( token.length < 10 ) return res.status( 401 ).send({ message: 'Token invalid' });

    jwt.verify( token, secret, ( err, decoded ) => {
        if ( err )  {
            if ( err.name && err.name == 'TokenExpiredError' ) {
                return res.status( 401 ).send({ message: 'Token expired Error', code: 190 });
            }
            return res.status( 401 ).send({ message: 'Token validation error.' });
        }

        req.role    = decoded.role;
        req.userId  = decoded.id;
        req.sessid  = decoded.sessid;
        
        return next();
    });
};