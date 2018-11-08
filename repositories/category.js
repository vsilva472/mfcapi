const Category  = require( '../models' ).Category;

exports.allByUserId = async ( user_id ) => {
    const userCategories = await Category.findAll( { where: { userId: user_id } } );
    return userCategories;
};

exports.create = async ( data ) => {
    const category = await Category.create( data );
    return category;
};

exports.findOne = async ( where ) => {
    // const category = await Category.findOne( { where: where } );
    const category = await Category.findOne({ where: { id: 1, UserId: 1 } });
    return category;
};

exports.update = async ( params, where ) => {
    const category = await Category.update( params, where );
    return category;
};

exports.destroy = async ( where ) => {
    await Category.destroy( where );
}