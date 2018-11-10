const { validationResult }  = require( 'express-validator/check' );
const repository = require( '../repositories/category' );

exports.index = async ( req, res, next ) => {
    try {
        const categories = await repository.allByUserId( req.userId );
        //console.log( categories );
        res.status(200).json(categories);
    }
    catch ( e ) {
        return res.status( 500 ).json({ message: 'Erro', error: e });
    }
};

exports.create = async ( req, res, next ) => {
        try {
            const { label, color } = req.body;
            const errors    = validationResult( req );

            if ( ! errors.isEmpty() ) 
                return res.status( 422 ).json({ errors: errors.array() });

            var category = await repository.create({ label, color, UserId: req.userId });
            res.status(201).send({ message: 'Categoria criada com sucesso', data: category });

        }
        catch ( e ) {
            console.log( 'awui' );
            return res.status( 500 ).json({ message: 'Erro ao criar categoria', error: e });
        }
};

exports.show = async ( req, res, next ) => {
    try {
        var category = await repository.findOne({ id: parseInt(req.params.id, 10), UserId: req.userId });
        
        if ( category ) {
            return res.status(200).json({ id: category.id, label: category.label, color: category.color });
        }
        return res.status(200).json(null);
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro localizar categoria', error: e });
    }
};

exports.update = async ( req, res, next ) => {
    try {
        const { label, color } = req.body;
        const where     = { UserId: req.params.user_id, id: req.params.category_id };
        
        await repository.update( { label, color }, { where: where } );    
        return res.status(200).json({ message: "Categoria atualizada com sucesso" });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao atualizar categoria', error: e });
    }
};

exports.destroy = async ( req, res, next ) => {
    try {
        const where     = { UserId: req.params.user_id, id: req.params.category_id };
        
        await repository.destroy( { where: where } );    
        return res.status(200).json({ message: "Categoria removida com sucesso." });
    }
    catch ( e ) {
        console.log( e );
        return res.status( 500 ).json({ message: 'Erro ao remover categoria', error: e });
    }
}