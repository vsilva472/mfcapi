const { validationResult }  = require( 'express-validator/check' );
const repository = require( '../repositories/entry' );

exports.index = async ( req, res, next ) => {
    try {      
        start = new Date();
        end   = new Date()
         
        if ( req.body.start && req.body.end ) {
            start = new Date( req.body.start );
            end = new Date( req.body.end );
        }

        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);

        const entries = await repository.allByUserIdAndPeriod( req.params.user_id, start, end );
        res.status(200).json( entries );
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro Selecionar registros', error: e });
    }
};

exports.create = async ( req, res, next ) => {
    try {
        const errors    = validationResult( req );
        const { label, value, type, registeredAt, categories } = req.body;
        const UserId = req.params.user_id;
    
        if ( ! errors.isEmpty() ) 
            return res.status( 422 ).json({ errors: errors.array() });
    
        var entry = await repository.create( { label, value, type, UserId, registeredAt } );
    
        if ( categories && categories.length ) {
            await entry.setCategories( categories );
        }

        res.status(201).json({ message: 'Registro adicionado com sucesso', data: entry });
    } 
    catch ( e ) {
        console.log( e );
        res.status( 500 ).json({ message: "Não foi possível criar o registro.", error: e  });
    }
};

exports.show = async ( req, res, next ) => {
    try {
        
        const data = { id: parseInt(req.params.entry_id, 10), UserId: req.params.user_id };
        
        var entry = await repository.findOneWithCategories( data );
        
        if ( ! entry ) return res.status(200).json(null);
    
        return res.status(200).json( entry );
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro localizar esta entrada.', error: e });
    }
};

exports.update = async ( req, res, next ) => {
    try {
        const data  = { ...req.body };
        const where = { UserId: req.params.user_id, id: req.params.entry_id };

        if ( data.id ) delete data.id;
        if ( data.UserId ) delete data.UserId;
        
        await repository.update( data, { where: where } );    
        return res.status(200).json({ message: "Entrada atualizada com sucesso" });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao atualizar Entrada', error: e });
    }
};

exports.destroy = async ( req, res, next ) => {
    try {
        const where     = { UserId: req.params.user_id, id: req.params.entry_id };
        
        await repository.destroy( { where: where } );    
        return res.status(200).json({ message: "Entrada removida com sucesso." });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao remover Entrada.', error: e });
    }
}