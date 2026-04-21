'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      valor: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      data: {
        type: Sequelize.DATE,
        allowNull: false
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      operacao: {
        type: Sequelize.STRING,
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

    // Definir default para 'data'
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT DF_Orders_data DEFAULT GETDATE() FOR data
    `);

    // Criar enum tipo via CHECK constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT CHK_Orders_tipo CHECK (tipo IN ('acao','fii'))
    `);

    // Criar enum operacao via CHECK constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT CHK_Orders_operacao CHECK (operacao IN ('compra','venda'))
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};
