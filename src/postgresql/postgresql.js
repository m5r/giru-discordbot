import Sequelize from 'sequelize';
import winston from 'winston';

import { db } from '../../settings.json';

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});

export default class Database {
  constructor() {
    this.database = new Sequelize(db, { logging: false });
  }

  get db() {
    return this.database;
  }

  start() {
    this.database.authenticate()
      .then(() => { logger.info('Connection has been established successfully.'); })
      .catch(err => { logger.error(`Unable to connect to the database: ${err}`); });
  }
}
