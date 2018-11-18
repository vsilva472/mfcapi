'use strict'

const models = require( '../../models' );


exports.clearTables = async () => {
    await models.sequelize.query( 'DELETE FROM `entrycategories`' );
    await models.Category.destroy({ where: {} });
    await models.Entry.destroy({ where: {} });
    await models.User.destroy({ where: {} });
};