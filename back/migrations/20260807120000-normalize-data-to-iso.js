'use strict';

const TABLE_NAMES = ['Orders', 'Proventos', 'OrderSellSnapshots'];

const buildMssqlNormalizationQuery = (tableName) => `
  UPDATE ${tableName}
  SET data = CONVERT(
    varchar(10),
    COALESCE(
      TRY_CONVERT(date, data, 105),
      TRY_CONVERT(date, data, 103),
      TRY_CONVERT(date, data, 23),
      TRY_CONVERT(date, data)
    ),
    23
  )
  WHERE TRY_CONVERT(date, data, 105) IS NOT NULL
     OR TRY_CONVERT(date, data, 103) IS NOT NULL
     OR TRY_CONVERT(date, data, 23) IS NOT NULL
     OR TRY_CONVERT(date, data) IS NOT NULL
`;

const buildSqliteNormalizedExpression = `
  CASE
    WHEN data LIKE '__-__-____' THEN substr(data, 7, 4) || '-' || substr(data, 4, 2) || '-' || substr(data, 1, 2)
    WHEN data LIKE '__/__/____' THEN substr(data, 7, 4) || '-' || substr(data, 4, 2) || '-' || substr(data, 1, 2)
    ELSE data
  END
`;

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    for (const tableName of TABLE_NAMES) {
      if (dialect === 'sqlite') {
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET data = ${buildSqliteNormalizedExpression}
        `);
      } else {
        await queryInterface.sequelize.query(buildMssqlNormalizationQuery(tableName));
      }
    }
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();

    for (const tableName of TABLE_NAMES) {
      if (dialect === 'sqlite') {
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET data = CASE
            WHEN data LIKE '____-__-__' THEN substr(data, 9, 2) || '-' || substr(data, 6, 2) || '-' || substr(data, 1, 4)
            ELSE data
          END
        `);
      } else {
        await queryInterface.sequelize.query(`
          UPDATE ${tableName}
          SET data = FORMAT(CAST(data AS DATE), 'dd-MM-yyyy')
        `);
      }
    }
  },
};