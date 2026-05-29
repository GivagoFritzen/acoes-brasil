'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Proventos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      data: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()')
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      instituicao: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      precoUnitario: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      valorLiquido: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('GETDATE()')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('GETDATE()')
      }
    });

    // Criar enum tipo via CHECK constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE Proventos
      ADD CONSTRAINT CHK_Proventos_tipo CHECK (tipo IN ('dividendo','rendimento','jurosSobreCapitalProprio'))
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Proventos');
  }
};
