'use strict';

import Commando from 'discord.js-commando';
import path from 'path';
import Raven from 'raven';
import winston from 'winston';

import { getGuildChannel, userFilter } from './helper';
import Database from './postgresql/postgresql';
import SequelizeProvider from './postgresql/SequelizeProvider';

import config from '../settings.json';

Raven.config(config.ravenKey);
Raven.install();

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
const giru = new Commando.Client({
  owner: config.owner,
  unknownCommandResponse: false,
  commandPrefix: '!'
});
const database = new Database();
database.start();

giru.registry
  .registerGroups([
    ['owner', 'Bot owner'],
    ['music', 'Music player']
  ])
  .registerDefaults()
  .registerCommandsIn({
    dirname: path.join(__dirname, 'commands'),
    resolve: command => command.default ? command.default : command
  });

giru.once('ready', () => {
  giru.setProvider(new SequelizeProvider(database.db))
    .then(() => {
      giru.guilds.map(guild => {
        const vc = getGuildChannel(guild);
        if (vc) vc.join();
      });
    });

  logger.info(`${giru.user.username} is currently serving ${giru.users.filter(userFilter).size} user${giru.users.filter(userFilter).size > 1 ? 's' : ''} on ${giru.guilds.size} server${giru.guilds.size > 1 ? 's' : ''}.`);
  giru.user.setGame({ game: '🐙' });
});

giru.on('error', logger.error)
  .on('warn', logger.warn)
  .on('disconnect', () => { logger.warn('Disconnected!'); })
  .on('reconnect', () => { logger.warn('Reconnecting...'); })
  .on('commandRun', (cmd, promise, msg, args) => {
    logger.info(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) > ${msg.guild ? `${msg.guild.name} (${msg.guild.id})` : 'DM'} >> ${cmd.groupID}:${cmd.memberName} ${Object.values(args)[0] !== '' ? `>>> ${Object.values(args)}` : ''}`);
  })
  .on('commandError', (cmd, err) => {
    if (err instanceof Commando.FriendlyError) return;
    logger.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
  })
  .on('commandBlocked', (msg, reason) => {
    logger.info(`Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''} blocked; ${reason}`);
  })
  .on('commandPrefixChange', (guild, prefix) => {
    logger.info(`Prefix changed to ${prefix || 'the default'} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`);
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    logger.info(`Command ${command.groupID}:${command.memberName} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`);
  })
  .on('groupStatusChange', (guild, group, enabled) => {
    logger.info(`Group ${group.id} ${enabled ? 'enabled' : 'disabled'} ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.`);
  })
  .on('debug', message => () => { logger.debug(message); });

giru.login(config.token);

process.on('unhandledRejection', err => {
  logger.error(err);
});
