'use strict';

async function convertIdToUuid(queryInterface, Sequelize, tableName) {
  await queryInterface.addColumn(tableName, 'id_uuid', {
    type: Sequelize.UUID,
    allowNull: true,
    defaultValue: Sequelize.literal('NEWID()'),
  });

  await queryInterface.sequelize.query(`
    UPDATE [${tableName}]
    SET [id_uuid] = NEWID()
    WHERE [id_uuid] IS NULL
  `);

  await queryInterface.sequelize.query(`
    DECLARE @pkName NVARCHAR(128);

    SELECT @pkName = kc.name
    FROM sys.key_constraints kc
    INNER JOIN sys.tables t ON t.object_id = kc.parent_object_id
    WHERE kc.[type] = 'PK' AND t.name = '${tableName}';

    IF @pkName IS NOT NULL
      EXEC('ALTER TABLE [${tableName}] DROP CONSTRAINT [' + @pkName + ']');
  `);

  await queryInterface.removeColumn(tableName, 'id');

  await queryInterface.sequelize.query(
    `EXEC sp_rename '[${tableName}].[id_uuid]', 'id', 'COLUMN'`
  );

  await queryInterface.changeColumn(tableName, 'id', {
    type: Sequelize.UUID,
    allowNull: false,
  });

  await queryInterface.sequelize.query(`
    DECLARE @defaultName NVARCHAR(128);

    SELECT @defaultName = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    INNER JOIN sys.tables t ON t.object_id = c.object_id
    WHERE t.name = '${tableName}' AND c.name = 'id';

    IF @defaultName IS NOT NULL
      EXEC('ALTER TABLE [${tableName}] DROP CONSTRAINT [' + @defaultName + ']');
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE [${tableName}]
    ADD CONSTRAINT [DF_${tableName}_id] DEFAULT NEWID() FOR [id]
  `);

  await queryInterface.addConstraint(tableName, {
    fields: ['id'],
    type: 'primary key',
    name: `PK_${tableName}_id`,
  });
}

async function convertIdToInteger(queryInterface, Sequelize, tableName) {
  await queryInterface.addColumn(tableName, 'id_int', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.sequelize.query(`
    ;WITH ordered_rows AS (
      SELECT [id], ROW_NUMBER() OVER (ORDER BY [createdAt], [id]) AS rn
      FROM [${tableName}]
    )
    UPDATE t
    SET [id_int] = o.rn
    FROM [${tableName}] t
    INNER JOIN ordered_rows o ON o.[id] = t.[id]
  `);

  await queryInterface.sequelize.query(`
    DECLARE @pkName NVARCHAR(128);

    SELECT @pkName = kc.name
    FROM sys.key_constraints kc
    INNER JOIN sys.tables t ON t.object_id = kc.parent_object_id
    WHERE kc.[type] = 'PK' AND t.name = '${tableName}';

    IF @pkName IS NOT NULL
      EXEC('ALTER TABLE [${tableName}] DROP CONSTRAINT [' + @pkName + ']');
  `);

  await queryInterface.removeColumn(tableName, 'id');

  await queryInterface.sequelize.query(
    `EXEC sp_rename '[${tableName}].[id_int]', 'id', 'COLUMN'`
  );

  await queryInterface.changeColumn(tableName, 'id', {
    type: Sequelize.INTEGER,
    allowNull: false,
  });

  await queryInterface.addConstraint(tableName, {
    fields: ['id'],
    type: 'primary key',
    name: `PK_${tableName}_id`,
  });
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await convertIdToUuid(queryInterface, Sequelize, 'Orders');
    await convertIdToUuid(queryInterface, Sequelize, 'Proventos');
    await convertIdToUuid(queryInterface, Sequelize, 'Portfolios');
  },

  async down(queryInterface, Sequelize) {
    await convertIdToInteger(queryInterface, Sequelize, 'Portfolios');
    await convertIdToInteger(queryInterface, Sequelize, 'Proventos');
    await convertIdToInteger(queryInterface, Sequelize, 'Orders');
  },
};
