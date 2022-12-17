"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserGroup.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {},
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        validate: {},
      },
    },
    {
      sequelize,
      modelName: "UserGroup",
    }
  );
  return UserGroup;
};
