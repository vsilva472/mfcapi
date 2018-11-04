module.exports = ( req, res, next ) => {
    const authHeader = req.headers.authorization;

    if ( authHeader )
        return res.status( 403 ).send({ message: 'Você já está logado' });
    
    return next();
};