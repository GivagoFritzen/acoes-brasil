'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DECLARE @constraintName NVARCHAR(200);
      SELECT @constraintName = dc.name
      FROM sys.default_constraints dc
      INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
      WHERE dc.parent_object_id = OBJECT_ID('Orders') AND c.name = 'data';

      IF @constraintName IS NOT NULL
        EXEC('ALTER TABLE Orders DROP CONSTRAINT ' + @constraintName);
    `);

    await queryInterface.changeColumn('Orders', 'data', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT DF_Orders_data DEFAULT CAST(GETDATE() AS DATE) FOR data
    `);

    await queryInterface.sequelize.query(`
      DECLARE @constraintName NVARCHAR(200);
      SELECT @constraintName = dc.name
      FROM sys.default_constraints dc
      INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
      WHERE dc.parent_object_id = OBJECT_ID('Proventos') AND c.name = 'data';

      IF @constraintName IS NOT NULL
        EXEC('ALTER TABLE Proventos DROP CONSTRAINT ' + @constraintName);
    `);

    await queryInterface.changeColumn('Proventos', 'data', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Proventos
      ADD CONSTRAINT DF_Proventos_data DEFAULT CAST(GETDATE() AS DATE) FOR data
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DECLARE @constraintName NVARCHAR(200);
      SELECT @constraintName = dc.name
      FROM sys.default_constraints dc
      INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
      WHERE dc.parent_object_id = OBJECT_ID('Orders') AND c.name = 'data';

      IF @constraintName IS NOT NULL
        EXEC('ALTER TABLE Orders DROP CONSTRAINT ' + @constraintName);
    `);

    await queryInterface.changeColumn('Orders', 'data', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Orders
      ADD CONSTRAINT DF_Orders_data DEFAULT GETDATE() FOR data
    `);

    await queryInterface.sequelize.query(`
      DECLARE @constraintName NVARCHAR(200);
      SELECT @constraintName = dc.name
      FROM sys.default_constraints dc
      INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
      WHERE dc.parent_object_id = OBJECT_ID('Proventos') AND c.name = 'data';

      IF @constraintName IS NOT NULL
        EXEC('ALTER TABLE Proventos DROP CONSTRAINT ' + @constraintName);
    `);

    await queryInterface.changeColumn('Proventos', 'data', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE Proventos
      ADD CONSTRAINT DF_Proventos_data DEFAULT GETDATE() FOR data
    `);
  },
};