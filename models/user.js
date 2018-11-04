'use strict';

const bcrypt = require( 'bcrypt' );


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    hooks: {
      beforeCreate: async function ( user ) {
        const salt = await bcrypt.genSalt( 10 );
        user.password = await bcrypt.hash( user.password.toString(), salt );
      }
    }
  });
  User.associate = function(models) {
    // associations can be defined here
  };

  User.prototype.comparePassword = async function ( password ) {
    return await bcrypt.compare( password, this.password );
  }
  return User;
};