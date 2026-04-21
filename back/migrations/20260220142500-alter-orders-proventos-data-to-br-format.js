'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const normalizeTableDateColumn = async (tableName) => {
      await queryInterface.sequelize.query(`
        DECLARE @constraintName NVARCHAR(200);
        SELECT @constraintName = dc.name
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = OBJECT_ID('${tableName}') AND c.name = 'data';

        IF @constraintName IS NOT NULL
          EXEC('ALTER TABLE ${tableName} DROP CONSTRAINT ' + @constraintName);
      `);

      await queryInterface.addColumn(tableName, 'data_tmp', {
        type: Sequelize.STRING(10),
        allowNull: true,
      });

      await queryInterface.sequelize.query(`
        UPDATE ${tableName}
        SET data_tmp = CONVERT(
          varchar(10),
          COALESCE(
            TRY_CONVERT(date, data, 105),
            TRY_CONVERT(date, data, 23),
            TRY_CONVERT(date, data)
          ),
          105
        )
      `);

      await queryInterface.removeColumn(tableName, 'data');

      await queryInterface.renameColumn(tableName, 'data_tmp', 'data');

      await queryInterface.changeColumn(tableName, 'data', {
        type: Sequelize.STRING(10),
        allowNull: false,
      });

      await queryInterface.sequelize.query(`
        ALTER TABLE ${tableName}
        ADD CONSTRAINT DF_${tableName}_data DEFAULT CONVERT(varchar(10), GETDATE(), 105) FOR data
      `);
    };

    await normalizeTableDateColumn('Orders');
    await normalizeTableDateColumn('Proventos');
  },

  async down(queryInterface, Sequelize) {
    const rollbackTableDateColumn = async (tableName) => {
      await queryInterface.sequelize.query(`
        DECLARE @constraintName NVARCHAR(200);
        SELECT @constraintName = dc.name
        FROM sys.default_constraints dc
        INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = OBJECT_ID('${tableName}') AND c.name = 'data';

        IF @constraintName IS NOT NULL
          EXEC('ALTER TABLE ${tableName} DROP CONSTRAINT ' + @constraintName);
      `);

      await queryInterface.addColumn(tableName, 'data_tmp', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      });

      await queryInterface.sequelize.query(`
        UPDATE ${tableName}
        SET data_tmp = COALESCE(
          TRY_CONVERT(date, data, 105),
          TRY_CONVERT(date, data, 23),
          TRY_CONVERT(date, data),
          CAST(GETDATE() AS date)
        )
      `);

      await queryInterface.removeColumn(tableName, 'data');

      await queryInterface.renameColumn(tableName, 'data_tmp', 'data');

      await queryInterface.changeColumn(tableName, 'data', {
        type: Sequelize.DATEONLY,
        allowNull: false,
      });

      await queryInterface.sequelize.query(`
        ALTER TABLE ${tableName}
        ADD CONSTRAINT DF_${tableName}_data DEFAULT CAST(GETDATE() AS DATE) FOR data
      `);
    };

    await rollbackTableDateColumn('Orders');
    await rollbackTableDateColumn('Proventos');
  },
};
