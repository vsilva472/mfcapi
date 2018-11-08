const jwt           = require( 'jsonwebtoken' );
const { secret }    = require( '../config/jwt' ); 

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
        if ( err )  return res.status( 401 ).send({ message: 'Token invalid' });

        req.userId = decoded.id;
        return next();
    });
};