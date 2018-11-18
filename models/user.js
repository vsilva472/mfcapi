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
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(11)
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'user'
    },
    password_reset_token: {
      type: DataTypes.STRING(4),
      allowNull: true,
      defaultValue: null
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    hooks: {
      beforeCreate: encryptPassword,
      beforeUpdate: encryptPassword
    }
  });
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany( models.Category, {
      foreignKey: 'UserId',
      onDelete: 'RESTRICT'
    });

    User.hasMany( models.Entry, {
      foreignKey: 'UserId',
      onDelete: 'RESTRICT'
    });

    User.hasMany( models.Favorite, {
      foreignKey: 'UserId',
      onDelete: 'RESTRICT'
    });
  };

  User.prototype.comparePassword = async function ( password ) {
    return await bcrypt.compare( password.toString(), this.password );
  }
  
  return User;
};