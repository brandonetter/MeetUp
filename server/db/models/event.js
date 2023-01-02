"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    getGroups = async function () {
      let groups = await sequelize.models.Group.findOne({
        where: {
          id: this.groupId,
        },
      });
      if (groups) {
        let {
          createdAt,
          updatedAt,
          about,
          organizerId,
          type,
          numMembers,

          ...rest
        } = groups?.dataValues;
        delete rest.private;
        return rest;
      }
    };
    getVenues = async function () {
      let groups = await sequelize.models.Venue.findOne({
        where: {
          id: this.venueId,
        },
      });
      if (groups) {
        let {
          createdAt,
          updatedAt,
          lat,
          lng,
          groupId,

          ...rest
        } = groups.dataValues;
        return rest;
      } else {
        return null;
      }
    };
    static addNewImage = async (data) => {
      let { userId, ...ob } = data;

      let event = await sequelize.models.UserEvent.findOne({
        where: {
          eventId: Number(ob.eventId),
          userId: userId,
        },
      });
      console.log(event);
      if (event == null) {
        throw {
          message: "User is not attending event",
          statusCode: 401,
        };
      }
      let image = await sequelize.models.Image.create(ob);
      return image;
    };
    static associate(models) {
      // define association here
      Event.belongsToMany(models.User, {
        through: models.UserEvent,
        foreignKey: { name: "eventId", allowNull: false },
        hooks: true,
      });
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
