import dotenv from 'dotenv';
dotenv.config();

export const DATABASE_NAME = 'NightBase-User';

export const ACCOUNT_SERVICE_NAME = 'ACCOUNT_SERVICE_NAME';
export const ACCOUNT_QUEUE_NAME = 'NightBase:Account';

export const BROKERS = [
  `amqp://${process.env.BROKER_HOST}:${process.env.BROKER_PORT}`,
];
