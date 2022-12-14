"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Event.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      venueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {},
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {},
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {},
      },
      numAttending: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
    },
    {
      sequelize,
      modelName: "Event",
    }
  );
  return Event;
};
