'use strict';

const convertBrToIsoSql = (tableName) => `
  UPDATE ${tableName}
  SET data_tmp = substr(data, 7, 4) || '-' || substr(data, 4, 2) || '-' || substr(data, 1, 2)
`;

const TABLE_NAMES = ['Orders', 'Proventos', 'OrderSellSnapshots'];

async function migrateMssqlTable(queryInterface, Sequelize, tableName) {
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
    SET data_tmp = TRY_CONVERT(DATE, data, 105)
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
}

async function migrateSqliteTable(queryInterface, Sequelize, tableName, columns, pk) {
  await queryInterface.sequelize.query(`ALTER TABLE ${tableName} RENAME TO ${tableName}_old`);

  await queryInterface.createTable(tableName, columns);

  await queryInterface.sequelize.query(`
    INSERT INTO ${tableName} (${Object.keys(columns).join(', ')})
    SELECT ${Object.keys(columns).map(c => c === 'data'
      ? `substr("data", 7, 4) || '-' || substr("data", 4, 2) || '-' || substr("data", 1, 2)`
      : `"${c}"`
    ).join(', ')}
    FROM ${tableName}_old
  `);

  await queryInterface.sequelize.query(`DROP TABLE ${tableName}_old`);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'sqlite') {
      const ordersColumns = {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('NEWID()') },
        codigo: { type: Sequelize.STRING, allowNull: false },
        valor: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
        quantidade: { type: Sequelize.INTEGER, allowNull: false },
        data: { type: Sequelize.DATEONLY, allowNull: false },
        tipo: { type: Sequelize.STRING, allowNull: false },
        operacao: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: true },
        updatedAt: { type: Sequelize.DATE, allowNull: true },
      };

      const proventosColumns = {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('NEWID()') },
        codigo: { type: Sequelize.STRING, allowNull: false },
        data: { type: Sequelize.DATEONLY, allowNull: false },
        tipo: { type: Sequelize.STRING, allowNull: false },
        instituicao: { type: Sequelize.STRING, allowNull: false },
        quantidade: { type: Sequelize.INTEGER, allowNull: false },
        precoUnitario: { type: Sequelize.DECIMAL(18, 6), allowNull: false },
        valorLiquido: { type: Sequelize.DECIMAL(18, 2), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: true },
        updatedAt: { type: Sequelize.DATE, allowNull: true },
      };

      const snapshotsColumns = {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: Sequelize.literal('NEWID()') },
        orderId: { type: Sequelize.UUID, allowNull: false },
        codigo: { type: Sequelize.STRING, allowNull: false },
        precoMedioAtual: { type: Sequelize.FLOAT, allowNull: false },
        quantidade: { type: Sequelize.INTEGER, allowNull: false },
        valorAtualAcao: { type: Sequelize.FLOAT, allowNull: false },
        ganhos: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
        teveLucro: { type: Sequelize.BOOLEAN, allowNull: false },
        data: { type: Sequelize.DATEONLY, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: true },
        updatedAt: { type: Sequelize.DATE, allowNull: true },
      };

      await migrateSqliteTable(queryInterface, Sequelize, 'Orders', ordersColumns);
      await migrateSqliteTable(queryInterface, Sequelize, 'Proventos', proventosColumns);
      await migrateSqliteTable(queryInterface, Sequelize, 'OrderSellSnapshots', snapshotsColumns);
    } else {
      for (const tableName of TABLE_NAMES) {
        await migrateMssqlTable(queryInterface, Sequelize, tableName);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    const revertColumns = (type) => ({
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      codigo: { type: Sequelize.STRING, allowNull: false },
      valor: type === 'proventos' ? undefined : { type: Sequelize.DECIMAL(18, 2), allowNull: false },
      quantidade: { type: Sequelize.INTEGER, allowNull: false },
      data: { type: Sequelize.STRING(10), allowNull: false },
      tipo: { type: Sequelize.STRING, allowNull: false },
      operacao: type === 'orders' ? { type: Sequelize.STRING, allowNull: false } : undefined,
      instituicao: type === 'proventos' ? { type: Sequelize.STRING, allowNull: false } : undefined,
      precoUnitario: type === 'proventos' ? { type: Sequelize.DECIMAL(18, 6), allowNull: false } : undefined,
      valorLiquido: type === 'proventos' ? { type: Sequelize.DECIMAL(18, 2), allowNull: false } : undefined,
      precoMedioAtual: type === 'snapshots' ? { type: Sequelize.FLOAT, allowNull: false } : undefined,
      valorAtualAcao: type === 'snapshots' ? { type: Sequelize.FLOAT, allowNull: false } : undefined,
      ganhos: type === 'snapshots' ? { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 } : undefined,
      teveLucro: type === 'snapshots' ? { type: Sequelize.BOOLEAN, allowNull: false } : undefined,
      createdAt: { type: Sequelize.DATE, allowNull: true },
      updatedAt: { type: Sequelize.DATE, allowNull: true },
    });

    if (dialect === 'sqlite') {
      const ordersCols = revertColumns('orders');
      delete ordersCols.valor; delete ordersCols.instituicao; delete ordersCols.precoUnitario;
      delete ordersCols.valorLiquido; delete ordersCols.precoMedioAtual; delete ordersCols.valorAtualAcao;
      delete ordersCols.ganhos; delete ordersCols.teveLucro;
      ordersCols.valor = { type: Sequelize.DECIMAL(18, 2), allowNull: false };
      await migrateSqliteTable(queryInterface, Sequelize, 'Orders', ordersCols);

      const proventosCols = revertColumns('proventos');
      delete proventosCols.valor; delete proventosCols.operacao; delete proventosCols.precoMedioAtual;
      delete proventosCols.valorAtualAcao; delete proventosCols.ganhos; delete proventosCols.teveLucro;
      await migrateSqliteTable(queryInterface, Sequelize, 'Proventos', proventosCols);

      const snapshotsCols = revertColumns('snapshots');
      delete snapshotsCols.valor; delete snapshotsCols.operacao; delete snapshotsCols.instituicao;
      delete snapshotsCols.precoUnitario; delete snapshotsCols.valorLiquido;
      await migrateSqliteTable(queryInterface, Sequelize, 'OrderSellSnapshots', snapshotsCols);
    } else {
      for (const tableName of TABLE_NAMES) {
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
          SET data_tmp = FORMAT(CAST(data AS DATE), 'dd-MM-yyyy')
        `);

        await queryInterface.removeColumn(tableName, 'data');

        await queryInterface.renameColumn(tableName, 'data_tmp', 'data');

        await queryInterface.changeColumn(tableName, 'data', {
          type: Sequelize.STRING(10),
          allowNull: false,
        });

        await queryInterface.sequelize.query(`
          ALTER TABLE ${tableName}
          ADD CONSTRAINT DF_${tableName}_data DEFAULT FORMAT(GETDATE(), 'dd-MM-yyyy') FOR data
        `);
      }
    }
  },
};
