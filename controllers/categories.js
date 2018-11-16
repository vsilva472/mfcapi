'use strict';

const { validationResult }  = require( 'express-validator/check' );
const repository = require( '../repositories/category' );

exports.index = async ( req, res, next ) => {
    try {
        const categories = await repository.allByUserId( req.params.user_id );
        res.status(200).json(categories);
    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro', error: e });
    }
};

exports.show = async ( req, res, next ) => {
        const id        = parseInt(req.params.category_id, 10);
        const role      = req.role;
        const UserId    = parseInt(req.params.user_id, 10);

        const resource = await repository.findOne( { id } );

        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Categoria não encontrada" });

        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });
    
        return res.status(200).json( resource );
};

exports.create = async ( req, res, next ) => {
        try {
            const UserId    = req.params.user_id;
            const errors    = validationResult( req );
            const role      = req.role;
            
            const { label, color }      = req.body;
            const authenticatedUserId   = req.userId;

            if ( ! errors.isEmpty() ) 
                return res.status( 422 ).json({ errors: errors.array() });

            if ( authenticatedUserId != UserId && role !== 'admin' ) 
                return res.status( 403 ).json({ message: "Você não tem permissão para isso." });

            var category = await repository.create({ label, color, UserId: req.userId });
            res.status(201).send({ message: 'Categoria criada com sucesso', data: category });
        }
        catch ( e ) {
            console.log( 'awui' );
            return res.status( 500 ).json({ message: 'Erro ao criar categoria', error: e });
        }
};

exports.update = async ( req, res, next ) => {
    try {
        const id        = req.params.category_id;
        const UserId    = req.params.user_id;
        const where     = { UserId, id };
        const role      = req.role;

        const { label, color }  = req.body;
        const resource          = await repository.findOne( { id } );

        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Categoria não encontrada." });

        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });
        
        await repository.update( { label, color }, { where: where } );  
         
        return res.status( 200 ).json({ message: "Categoria atualizada com sucesso" });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao atualizar categoria', error: e });
    }
};

exports.destroy = async ( req, res, next ) => {
    try {
        const id            = parseInt(req.params.category_id, 10);
        const UserId        = parseInt(req.params.user_id, 10);
        const role          = req.role;
        const where         = { UserId, id };
    
        const resource = await repository.findOne( { id } );
    
        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Categoria não encontrada." });

        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." })
        
        await repository.destroy( { where: where } );    
        return res.status(200).json({ message: "Categoria removida com sucesso." });
    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro ao remover categoria', error: e });
    }
}