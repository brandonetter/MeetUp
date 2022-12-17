"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Venue.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      address: {
        type: DataTypes.STRING,
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
      lat: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {},
      },
      lng: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {},
      },
    },
    {
      sequelize,
      modelName: "Venue",
    }
  );
  return Venue;
};
