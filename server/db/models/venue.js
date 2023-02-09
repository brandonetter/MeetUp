"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static validate = {
      address: (input) => {
        if (input == null)
          return "Address must be between 5 and 100 characters";
        let nameFormat = /^[a-zA-Z0-9-\s]{5,100}$/;
        return input.match(nameFormat);
      },

      city: (input) => {
        if (input == null) return "City must be 5 characters or more";
        let aboutFormat = /^.{1,120}$/;
        return input.match(aboutFormat);
      },
      state: (input) => {
        if (input == null)
          return "State must be in 2 letter format, (e.g.: FL,RI,AK)";
        let format = /^[A-Z]{2}$/;
        return input.match(format);
      },
      lat: (input) => {
        if (input == null) return "Lat Must be a floating point decimal.";
        input = String(input);
        let format = /^-?[0-9]{1,}\.[0-9]{1,}$/;
        return input.match(format);
      },
      lng: (input) => {
        if (input == null) return "Lng Must be a floating point decimal";
        input = String(input);
        let format = /^-?[0-9]{1,}\.[0-9]{1,}$/;
        return input.match(format);
      },
      uniqueAttribute: async (attribute, input) => {
        let group = await Venue.findOne({ where: { [attribute]: input } });
        return group != null ? true : false;
      },
    };
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
      hooks: {
        beforeValidate: async (venue, options) => {
          venue.errors = [];
        },
        afterValidate: async (venue, options) => {
          let keys = Object.keys(venue.dataValues);
          keys = keys.filter((v) => {
            return (
              v != "createdAt" && v != "updatedAt" && v != "salt" && v != "id"
            );
          });
          keys.forEach((val) => {
            if (typeof Venue.validate[val] == "function") {
              if (venue[val] == null) {
                venue.errors.push(Venue.validate[val](null));
              } else if (!Venue.validate[val](venue[val])) {
                venue.errors.push(Venue.validate[val](null));
              }
            }
          });

          if (venue.errors.length) {
            throw venue.errors;
          }
        },
      },
      sequelize,
      modelName: "Venue",
    }
  );
  return Venue;
};
