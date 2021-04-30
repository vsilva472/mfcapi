'use strict';

const Category  = require( '../models' ).Category;

exports.allByUserId = async ( user_id ) => {
    const userCategories = await Category.findAll( { where: { UserId: user_id } } );
    return userCategories;
};

exports.create = async ( data ) => {
    const category = await Category.create( data );
    return category;
};

exports.findOne = async ( where ) => {
    const category = await Category.findOne({ where: where });
    return category;
};

exports.update = async ( params, where ) => {
    const category = await Category.update( params, where );
    return category;
};

exports.destroy = async ( where ) => {
    await Category.destroy( where );
}