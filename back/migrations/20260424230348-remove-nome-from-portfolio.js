'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Portfolios', 'nome');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Portfolios', 'nome', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });
  }
};
