const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('master', 'sa', 'Senha@123', {
  host: 'localhost',
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  }
});

async function createDatabase() {
  try {
    await sequelize.query(`IF NOT EXISTS (
      SELECT name FROM sys.databases WHERE name = 'AppDb'
    ) CREATE DATABASE AppDb`);
    console.log('Banco criado ou já existente');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createDatabase();
