import dotenv from 'dotenv';
dotenv.config();

export const ACCOUNT_SERVICE = 'ACCOUNT_SERVICE';

export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const BROKERS = [
  `amqp://${process.env.BROKER_HOST}:${process.env.BROKER_PORT}`,
];
