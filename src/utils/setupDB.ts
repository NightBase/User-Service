import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { DATABASE_NAME } from './constants';

dotenv.config();

const dbName = DATABASE_NAME;

async function createDatabase() {
  const sequelize = new Sequelize({
    database: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialect: 'postgres',
    logging: false,
  });
  const isDbExists = await sequelize.query(
    `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
  );
  if (!isDbExists[0].length) {
    await sequelize.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database '${dbName}' created.`);
  } else {
    console.log(`Database '${dbName}' already exists.`);
  }
  await sequelize.close();
}

async function setupDB() {
  await createDatabase();
}

setupDB();
