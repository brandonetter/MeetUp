"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Group.init(
    {
      organizerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      about: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {},
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      numMembers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
    },
    {
      sequelize,
      modelName: "Group",
    }
  );
  return Group;
};
