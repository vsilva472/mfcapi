'use stric';

const { validationResult }  = require( 'express-validator/check' );

const repository            = require( '../repositories/entry' );

const onlyUnique  = ( arr ) => {
    return arr.filter((v,i,a)=>a.indexOf(v)==i);
};

exports.index = async ( req, res, next ) => {
    try {      
        const start = new Date();
        const end   = new Date();
        const role  = req.role; 
        
        const authUserId    = req.userId;
        const UserId        = req.params.user_id;

        if ( req.body.start && req.body.end ) {
            start = new Date( req.body.start );
            end = new Date( req.body.end );
        }

        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);

        if ( authUserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });

        const entries = await repository.allByUserIdAndPeriod( req.params.user_id, start, end );
        res.status(200).json( entries );
    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro Selecionar registros', error: e });
    }
};

exports.show = async ( req, res, next ) => {
    try {
        const id        = parseInt(req.params.entry_id, 10);
        const role      = req.role;
        const UserId    = parseInt(req.params.user_id, 10);

        const resource = await repository.findOneWithCategories({ id });

        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Recurso não existe." });

        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });
            
        return res.status(200).json( resource );
    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro localizar esta entrada.', error: e });
    }
};

exports.create = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );
        const { label, value, type, registeredAt, categories } = req.body;
        const UserId = req.params.user_id;
    
        if ( ! errors.isEmpty() ) 
            return res.status( 422 ).json({ errors: errors.array() });
    
        if ( categories ) {
            const unique_categories = onlyUnique( categories );
            const entry = await repository.create( { label, value, type, UserId, registeredAt } );      
            await entry.setCategories( unique_categories );
            
            return res.status(201).json({ message: 'Registro adicionado com sucesso 1', data: entry });
        }

        const entry = await repository.create( { label, value, type, UserId, registeredAt } );
        res.status(201).json({ message: 'Registro adicionado com sucesso', data: entry });
    } 
    catch ( e ) {
        console.log( e );
        res.status( 500 ).json({ message: "Não foi possível criar o registro.", error: e  });
    }
};

exports.update = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );
        const id        = parseInt(req.params.entry_id, 10);
        const role      = req.role;
        const UserId    = parseInt(req.params.user_id, 10);

        const { label, value, type, registeredAt, categories } = req.body;
        const data = {};
        
        if ( ! errors.isEmpty() ) 
            return res.status( 422 ).json({ errors: errors.array() });

        const resource = await repository.findOne( { id } );

        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Não conseguimos localizar a entrar para atualizá-la." });

        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });

        if ( label ) data.label = label;
        if ( value ) data.value = value;
        if ( type ) data.type = type;
        if ( registeredAt ) data.registeredAt = registeredAt;

        await repository.update( data, { where: { id, UserId } } );    

        if ( categories ) {
            const unique_categories = onlyUnique( categories );
            await resource.setCategories( unique_categories );
        }
    
        return res.status(200).json({ message: "Entrada atualizada com sucesso" });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao atualizar Entrada', error: e });
    }
};

exports.destroy = async ( req, res, next ) => {
    try {
        const role      = req.role;
        const UserId    = parseInt(req.params.user_id, 10);
        const id        = parseInt(req.params.entry_id, 10);
    
        const resource = await repository.findOne( { id } );
        
        if ( ! resource ) 
            return res.status( 400 ).json({ message: "Entrada não encontrada." });

        if ( resource.UserId != UserId && role !== 'admin' ) 
            return res.status( 403 ).json({ message: "Você não tem permissão para isso." });

        await repository.destroy( { where: { UserId, id } } );
        
        res.status(200).json({ message: "Entrada removida com sucesso." });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao remover Entrada.', error: e });
    }
}