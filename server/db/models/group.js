"use strict";
const { Model } = require("sequelize");
const { User } = require("./user");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static addNewImage = async (data) => {
      let { userId, ...ob } = data;

      let group = await sequelize.models.Group.findOne({
        where: {
          id: Number(ob.groupId),
          organizerId: userId,
        },
      });
      if (group == null) {
        throw {
          message: "Group couldn't be found",
          statusCode: 404,
        };
      }
      let image = await sequelize.models.Image.create(ob);
      return image;
    };
    static validate = {
      name: (input) => {
        if (input == null) return "Name must be 60 characters or less";
        let nameFormat = /^[a-zA-Z0-9\s]{1,60}$/;
        return input.match(nameFormat);
      },

      about: (input) => {
        if (input == null) return "About must be 50 characters or more";
        let aboutFormat = /^.{50,1200}$/;
        return input.match(aboutFormat);
      },
      type: (input) => {
        if (input == null) return "Type must be 'Online' or 'In person'";
        let format = /^Online$|^In person$/;
        return input.match(format);
      },
      private: (input) => {
        if (input == null) return "Private must be a boolean";
        return typeof input === "boolean";
      },
      city: (input) => {
        if (input == null) return "City is required";
        return 1;
      },
      state: (input) => {
        if (input == null) return "State is required";
        return 1;
      },
      uniqueAttribute: async (attribute, input) => {
        let group = await Group.findOne({ where: { [attribute]: input } });
        return group != null ? true : false;
      },
    };
    addOrganizer = async function () {
      let user = await sequelize.models.User.findOne({
        where: { id: this.organizerId },
      });
      let { email, username, ...organizerData } = user.dataValues;
      this.dataValues.Organizer = organizerData;
      //return organizerData;
    };
    confirmJoin = async function (userId) {
      let usergroup = await sequelize.models.UserGroup.findOne({
        where: {
          userId: userId,
          groupId: this.id,
        },
      });

      usergroup.status = "member";
      console.log(usergroup);
      this.numMembers += 1;
      await this.save();
      await usergroup.save();
    };
    static associate(models) {
      Group.belongsToMany(models.User, {
        through: models.UserGroup,
        foreignKey: "groupId",
      });
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
        allowNull: true,
        validate: {
          async validate(value) {
            if (await Group.validate.uniqueAttribute("name", value)) {
              return this.errors.push("Group Name Already Taken");
            }
          },
        },
      },
      about: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {},
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {},
      },
      private: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        validate: {},
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {},
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {},
      },
      numMembers: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          valid(value) {
            if (value === null) this.numMembers = 0;
          },
        },
      },
    },
    {
      hooks: {
        beforeValidate: async (group, options) => {
          group.errors = [];
        },
        afterValidate: async (group, options) => {
          console.log(group.city, "-=---=-=--==-=");
          let keys = Object.keys(group.dataValues);
          keys = keys.filter((v) => {
            return (
              v != "createdAt" && v != "updatedAt" && v != "salt" && v != "id"
            );
          });
          keys.forEach((val) => {
            if (typeof Group.validate[val] == "function") {
              if (group[val] == null) {
                group.errors.push(Group.validate[val](null));
              } else if (!Group.validate[val](group[val])) {
                group.errors.push(Group.validate[val](null));
              }
            }
          });

          if (group.errors.length) {
            throw group.errors;
          }
        },
      },
      sequelize,
      modelName: "Group",
    }
  );
  return Group;
};
