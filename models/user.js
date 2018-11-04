'use strict';

const bcrypt = require( 'bcrypt' );

const encryptPassword  = async function ( user ) {
  if ( user.changed( 'password' ) ) {
    const salt = await bcrypt.genSalt( 10 );
    user.password = await bcrypt.hash( user.password.toString(), salt );
  }
};


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    password_reset_token: DataTypes.STRING,
    password_reset_expires: DataTypes.DATE,
  }, {
    hooks: {
      beforeCreate: encryptPassword,
      beforeUpdate: encryptPassword
    }
  });
  User.associate = function(models) {
    // associations can be defined here
  };

  User.prototype.comparePassword = async function ( password ) {
    return await bcrypt.compare( password.toString(), this.password );
  }
  
  return User;
};