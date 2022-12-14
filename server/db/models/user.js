"use strict";
const { Model } = require("sequelize");
const crypto = require("crypto");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    validPassword(password) {
      let hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
        .toString(`hex`);
      return this.password === hash;
    }
  }
  User.init(
    {
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
        defaultValue: () => crypto.randomBytes(16).toString("hex"),
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          function(value) {
            this.password = crypto
              .pbkdf2Sync(value, this.salt, 1000, 64, `sha512`)
              .toString(`hex`);
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
