'use strict';

const jwtConfig = require( '../config/jwt' );

module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(11)
    },
    UserId: {
      type: DataTypes.INTEGER(11),
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    sessid: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    expiresAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
  }, {});

  Token.associate = function(models) {
    // associations can be defined here
    Token.belongsTo(models.User, {
      foreignKey: 'UserId',
      onDelete: 'CASCADE'
    });
  };

  return Token;
};