"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserEvent.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
    },
    {
      sequelize,
      modelName: "UserEvent",
    }
  );
  return UserEvent;
};
