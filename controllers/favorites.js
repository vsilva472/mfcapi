const { validationResult }  = require( 'express-validator/check' );
const repository = require( '../repositories/favorite' );

exports.index = async ( req, res, next ) => {
    try {
        const favorites = await repository.allByUserId( req.userId );
        res.status(200).json( favorites );
    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro', error: e });
    }
};

exports.create = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );
        const role      = req.role;
        const UserId    = parseInt(req.params.user_id, 10);
        const authenticatedUserId = req.userId;

        if ( ! errors.isEmpty() ) 
            return res.status( 422 ).json({ errors: errors.array() });

        const { label, value, type } = req.body;

        if ( authenticatedUserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });
    
        const favorite = await repository.create( { label, value, type, UserId } );

        res.status(201).send({ message: 'Favorito adicionado com sucesso', data: favorite });

    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao criar favorito', error: e });
    }
};

exports.show = async ( req, res, next ) => {
    try {
        const id        = parseInt(req.params.favorite_id, 10);
        const role      = req.role;
        const UserId    = parseInt(req.params.user_id, 10);

        // select resource
        const resource = await repository.findOne( { id } );

        // resource not found
        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Recurso não existe." });

        // user not is owner of resource neither is an admin
        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });
    
        return res.status(200).json({ id: resource.id, label: resource.label, value: resource.value, type: resource.type, UserId: resource.UserId });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro localizar Favorito', error: e });
    }
};

exports.update = async ( req, res, next ) => {
    try {
        const data = { ...req.body };
        const UserId = req.params.user_id;
        const where  = { UserId, id: req.params.favorite_id };
        const role = req.role;

        // select resource
        const resource = await repository.findOne( { id: req.params.favorite_id } );

        // resource not found
        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Recurso não existe." });

        // user not is owner of resource neither is an admin
        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });
        
        await repository.update( data, { where: where } );    
        return res.status(200).json({ message: "Favorito atualizado com sucesso" });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao atualizar favorito', error: e });
    }
};

exports.destroy = async ( req, res, next ) => {
    try {
        const role          = req.role;
        const UserId        = parseInt(req.params.user_id, 10);
        const favoriteId    = parseInt(req.params.favorite_id, 10);
    
        // select resource
        const resource = await repository.findOne( { id: favoriteId } );
        
        // resource not found
        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Recurso não existe." });

        // user not is owner of resource neither is an admin
        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });

        await repository.destroy( { where: { UserId, id: favoriteId } } );
        res.status(200).json({ message: "Favorito removida com sucesso." });
    }
    catch ( e ) {
        //console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao remover favorito', error: e });
    }
}