const isUserAdmin = ( req ) => {
    return req.role && req.role === 'admin';
};

const isNormalUser = ( req ) => {
    return req.role && req.role === 'user';
};

const isUserLoggedIn = ( req ) => {
    return req.userId && req.role;
};

const isResourceOwner = ( req ) => {
    return (req.params && req.params.user_id && ( req.params.user_id == req.userId ) );
};

module.exports = ( req, res, next ) => {
    if ( isUserAdmin( req ) ) {
        return next();
    }
    
    if ( ! isUserLoggedIn( req ) || ! isNormalUser( req ) || ! isResourceOwner( req ) ) {
        return res.status( 403 ).json({ message: "Você não tem permissão para executar esta ação." });
    }
        
    next();
};