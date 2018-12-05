'use strict'

const models = require( '../../models' );


exports.clearTables = async () => {
    await models.sequelize.query( 'DELETE FROM `EntryCategories`' );
    await models.Category.destroy({ where: {} });
    await models.Entry.destroy({ where: {} });
    await models.Favorite.destroy({ where: {} });
    await models.User.destroy({ where: {} });
};