"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Image.init(
    {
      preview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {},
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {},
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {},
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
      },
    },
    {
      hooks: {
        afterValidate: async (image, options) => {
          if (image.preview === true) {
            let v = await sequelize.models.Image.findOne({
              where: {
                groupId: image.groupId,
                eventId: image.eventId,
                preview: true,
              },
            });
            if (v) {
              v.preview = false;
              await v.save();
            }
          }
        },
      },
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
