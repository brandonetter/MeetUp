
const { Model } = require("sequelize");
const {
  User,
  Group,
  Tools: t,
  Image,
  Venue,
  Event,
  UserEvent,
  UserGroup,
  Sequelize,
} = require("../models");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

  },

  async down(queryInterface, Sequelize) {
    // bulk delete all users
    await queryInterface.bulkDelete('Users', null, {});
    // bulk delete all events
    await queryInterface.bulkDelete('Events', null, {});
    // bulk delete all groups
    await queryInterface.bulkDelete('Groups', null, {});
    // bulk delete all images
    await queryInterface.bulkDelete('Images', null, {});
    // bulk delete all userEvents
    await queryInterface.bulkDelete('UserEvents', null, {});
    // bulk delete all userGroups
    await queryInterface.bulkDelete('UserGroups', null, {});
    // bulk delete all venues
    await queryInterface.bulkDelete('Venues', null, {});



  }
};
