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
        const { label, value, type, UserId } = req.body;
        const errors    = validationResult( req );

        if ( ! errors.isEmpty() ) 
            return res.status( 422 ).json({ errors: errors.array() });

        var favorite = await repository.create( { label, value, type, UserId } );

        res.status(201).send({ message: 'Favorito adicionado com sucesso', data: favorite });

    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro ao criar favorito', error: e });
    }
};

exports.show = async ( req, res, next ) => {
    try {
        const data = { id: parseInt(req.params.favorite_id, 10), UserId: req.params.user_id };
        var favorite = await repository.findOne( data );
        
        if ( ! favorite ) return res.status(200).json(null);
    
        return res.status(200).json({ id: favorite.id, label: favorite.label, value: favorite.value, type: favorite.type, UserId: favorite.UserId });
    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro localizar Favorito', error: e });
    }
};

exports.update = async ( req, res, next ) => {
    try {
        const data = { ...req.body };
        const where     = { UserId: req.params.user_id, id: req.params.favorite_id };
        
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
        const where     = { UserId: req.params.user_id, id: req.params.favorite_id };
        
        await repository.destroy( { where: where } );    
        return res.status(200).json({ message: "Favorito removida com sucesso." });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao remover favorito', error: e });
    }
}