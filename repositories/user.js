'use strict'

const models    = require( '../models' ); 
const User      = models.User;
const Token     = models.Token;

exports.create = async ( data ) => {
    const user = await User.create( data );
    return user;
};

exports.findOne = async ( params ) => {
    const user = await User.findOne( { where: params } );
    return user;
};

exports.update = async ( entity, params ) => {
    const user = ! isNaN( entity ) ? await User.findOne({ where: { id: entity } }) : entity; 
    await user.update( params );
    
    return user;
};

exports.saveSessid = async ( UserId, sessid ) => {
    const token = await Token.create({ UserId, sessid });
    return token;
};