const Favorite  = require( '../models' ).Favorite;
const Category  = require( '../models' ).Category;

exports.allByUserId = async ( user_id ) => {
    const favorites = await Favorite.findAll( { where: { userId: user_id } } );
    return favorites;
};

exports.create = async ( data ) => {
    const favorite = await Favorite.create( data );
    return favorite;
};

exports.findOne = async ( where ) => {
    // const Favorite = await Favorite.findOne( { where: where } );
    const favorite = await Favorite.findOne({ where: where });
    return favorite;
};

exports.update = async ( params, where ) => {
    const favorite = await Favorite.update( params, where );
    return favorite;
};

exports.destroy = async ( where ) => {
    await Favorite.destroy( where );
}