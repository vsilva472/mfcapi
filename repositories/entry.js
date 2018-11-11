const Entry     = require( '../models' ).Entry;
const Category  = require( '../models' ).Category;

exports.allByUserIdAndPeriod = async ( userId, start, end ) => {
    const entries = await Entry.findAll({
        where: {
            UserId: userId,
            registeredAt: {
                '$between': [start, end],
            }
        }
    });

    return entries;
};

exports.create = async ( data ) => {
    const entry = await Entry.create( data );
    return entry;
};

exports.findOne = async ( where ) => {
    const entry = await Entry.findOne({ where: where });
    return entry;
};

exports.findOneWithCategories = async ( where ) => {
    const entry = await Entry.findOne({ where: where, include: [ Category ] });
    return entry;
};

exports.update = async ( params, where ) => {
    const entry = await Entry.update( params, where );
    return entry;
};

exports.destroy = async ( where ) => {
    await Entry.destroy( where );
}