'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderSellSnapshots', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('NEWID()'),
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      precoMedioAtual: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      valorAtualAcao: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      ganhos: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      teveLucro: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      data: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OrderSellSnapshots');
  },
};
