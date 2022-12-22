"use strict";
require("dotenv").config({ path: "../../../.env" });
const { Model } = require("sequelize");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsToMany(models.Group, {
        through: models.UserGroup,
        foreignKey: "userId",
      });
    }
    static validate = {
      email: (input) => {
        if (!(typeof input === "string")) return false;

        let mailformat =
          /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        return input.match(mailformat);
      },
      username: (input) => {
        let usernameFormat = /^[a-zA-Z0-9_]{3,12}$/;
        return input.match(usernameFormat);
      },
      firstname: (input) => {
        let nameformat = /^[a-zA-Z]{2,14}$/;
        return input.match(nameformat);
      },
      uniqueAttribute: async (attribute, input) => {
        let user = await User.findOne({ where: { [attribute]: input } });
        return user != null ? true : false;
      },
    };
    validPassword(password) {
      console.log(this.email);
      console.log(this.salt);
      let hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
        .toString(`hex`);
      return this.hash === hash;
    }
    generateToken() {
      return jwt.sign({ id: this.username }, process.env.SECRET, {
        expiresIn: "1d",
      });
    }
    async addToGroup(group) {
      let success = {};
      let group_id = group.id;
      let userGroup = await sequelize.models.UserGroup.findOne({
        where: {
          userId: this.id,
          groupId: group_id,
        },
      });
      if (!userGroup) {
        await this.addGroup(group);
        success.status = true;
        return success;
      }

      success.status = false;
      if (userGroup.status === "pending") {
        success.statusCode = 400;
        success.message = "Membership has already been requested";
      }

      if (userGroup.status === "member") {
        success.statusCode = 400;
        success.message = "User is already a member of the group";
      }
      return success;
    }
    async getAllGroups() {
      let groups = await this.getGroups();
      groups = await Promise.all(
        groups.map(async (x) => {
          return await x.includePreview();
        })
      );
      groups = groups
        .filter((x) => {
          return x.UserGroup.dataValues.status != "pending";
        })
        .map((x) => {
          let { UserGroup, ...rest } = x.dataValues;
          return rest;
        });
      return groups;
    }
  }
  User.init(
    {
      firstname: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          async function(v) {
            this.errors = [];
            if (v == null) return this.errors.push("First Name is required");
            if (!User.validate.firstname(v))
              return this.errors.push("Invalid Firstname");
          },
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          function(v) {
            if (v == null) return this.errors.push("Last Name is required");
            if (!User.validate.firstname(v))
              return this.errors.push("Invalid last name");
          },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          async function(v) {
            if (v == null) return this.errors.push("Username required");
            if (!User.validate.username(v))
              return this.errors.push("Invalid username");
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          async function(value) {
            if (value == null) {
              return this.errors.push("Email is required");
            }
            if (!User.validate.email(value)) {
              return this.errors.push("Invalid email");
            }
          },
        },
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {},
        defaultValue: () => crypto.randomBytes(16).toString("hex"),
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          function(value, check = this.errors) {
            if (value == null) return this.errors.push("Password is required");
            if (check.length) {
              throw check;
            }
            this.hash = crypto
              .pbkdf2Sync(value, this.salt, 1000, 64, `sha512`)
              .toString(`hex`);
          },
        },
      },
    },
    {
      hooks: {
        // beforeValidate: async (user, options) => {
        //   console.log("BEFORE: " + JSON.stringify(user));
        // },
        afterValidate: async (user, options) => {
          if (user.email == null || user.username == null) {
            throw user.errors;
          }
          if (await User.validate.uniqueAttribute("email", user.email)) {
            user.errors.push("Email must be unique");
          }
          if (await User.validate.uniqueAttribute("username", user.username)) {
            user.errors.push("Username must be unique");
          }
          if (user.errors.length) {
            user.errors.type = "unique";
            throw user.errors;
          }
        },
      },
      defaultScope: {
        attributes: {
          exclude: ["hash", "salt", "createdAt", "updatedAt"],
        },
      },
      scopes: {
        validation: {
          attributes: {
            exclude: ["updatedAt", "createdAt"],
          },
        },
      },
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
