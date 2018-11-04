const jwt           = require( 'jsonwebtoken' );
const { secret }    = require( '../config/auth' ); 

module.exports = ( req, res, next ) => {
    const authHeader = req.headers.authorization;

    if ( !authHeader )
        return res.status( 401 ).send({ message: 'No token provided' });
    
    const tokenParts = authHeader.split( ' ' );

    if ( ! tokenParts.length === 2 ) return res.status( 401 ).send({ message: 'Token error' });

    const [ scheme, token ] = parts;

    if ( ! /^Bearer$/i.test( scheme ) ) return res.status( 401 ).send({ message: 'Token type error' });
    
    if ( token.length < 10 ) return res.status( 401 ).send({ message: 'Token invalid' });

    jwt.verify( token, secret, ( err, decoded ) => {
        if ( err )  return res.status( 401 ).send({ message: 'Token invalid' });

        req.user_id = decoded.id;
        return next();
    });
};