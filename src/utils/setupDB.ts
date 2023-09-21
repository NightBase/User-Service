import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { DATABASE_NAME } from './constants';

// Import your Sequelize models from separate files
import { Permission } from '../api/v1/Database/Models/role.model'; // Replace with the actual paths

dotenv.config();

const dbName = DATABASE_NAME;

let sequelize = new Sequelize({
  database: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialect: 'postgres',
});

// Create the database if it doesn't exist
sequelize
  .query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`)
  .then(([results]) => {
    if (!results.length) {
      return sequelize.query(`CREATE DATABASE "${dbName}"`);
    }
  })
  .then(() => {
    console.log(`Database '${dbName}' created or already exists.`);
  })
  .catch((err) => {
    console.error('Error creating database:', err);
  });

sequelize = new Sequelize({
  database: dbName,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialect: 'postgres',
});

// Pre defined datas

sequelize.addModels([Permission]);
sequelize.sync({ alter: true }).then(() => {
  Permission.destroy({ truncate: true });
  Permission.bulkCreate([
    {
      name: 'Read',
      description: 'To read data from the database',
      alias: 'READ',
    },
    {
      name: 'Write',
      description: 'To write data to the database',
      alias: 'WRITE',
    },
    {
      name: 'Update',
      description: 'To update data in the database',
      alias: 'UPDATE',
    },
    {
      name: 'Delete Data',
      description: 'To delete data from the database',
      alias: 'DELETE',
    },
    {
      name: 'Create Table',
      description: 'To create a new table in the database',
      alias: 'CREATE_TABLE',
    },
    {
      name: 'Drop Table',
      description: 'To drop a table from the database',
      alias: 'DROP_TABLE',
    },
  ]);
});
