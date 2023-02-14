"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
console.log(process.env);
const config = require(__dirname + "/../../config/database.json")[env];
const db = {};
// dotEnv

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(config.url, config);
} else {
  config.storage = "../" + config.storage;
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Tools = {
  tidy: function (model, body) {
    let keys = Object.keys(model.tableAttributes);
    keys = keys.filter((v) => {
      return (
        v != "createdAt" &&
        v != "updatedAt" &&
        v != "salt" &&
        v != "id" &&
        v != "numMembers" &&
        v != "numAttending"
      );
    });
    let ob = {};
    keys.forEach((val) => {
      if (body[val] === 0 || body[val] === false) {
        ob[val] = body[val];
        return;
      }
      ob[val] = body[val] || null;
    });
    return ob;
  },
  tidyError: function (e, res, type) {
    if (!e.type) {
      res.statusCode = 400;
      return {
        message: "Validation Error",
        statusCode: "400",
        errors: e.errors?.[0].message || e,
      };
    }
    console.log(e);
    res.statusCode = 403;
    return { message: `${type} Already Exists`, statusCode: 403, errors: e };
  },
};
module.exports = db;
