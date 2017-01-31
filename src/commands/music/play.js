'use strict';

import { RichEmbed, escapeMarkdown } from 'discord.js';
import { Command } from 'discord.js-commando';
import { getGuildQueue, setGuildQueue, getGuildChannel, removeFromQueue } from '../../helper';
import ytdl from 'youtube-dl';
import ytdlcore from 'ytdl-core';
import winston from 'winston';

import { passes } from '../../../settings.json';

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

export default class play extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'play',
      memberName: 'play',
      description: 'Start playing the song queue. ギル will join your channel if he wasn\'t in one.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });

    this.dispatchers = new Map();
    this.ytVideoRegex = /https?:\/\/(?:youtu\.be\/|(?:[a-z]{2,3}\.)?youtube\.com\/watch(?:\?|#\!)v=)([\w-]{11}).*/gi; //eslint-disable-line
  }

  async run(message) {
    return new Promise(resolve => {
      const currentQueue = getGuildQueue(message.guild);
      const song = currentQueue.songs[0];
      const vc = getGuildChannel(message.guild);
      const currentDispatcher = this.dispatchers.get(message.guild.id);

      if (!song) {
        this.dispatchers.set(message.guild.id, null);
        currentQueue.playing = false;
        setGuildQueue(message.guild, currentQueue);
        return resolve(message.channel.sendMessage(`We've ran out of songs! 👀`));
      }
      if (!vc) return resolve(this.client.registry.resolveCommand('music:join').run(message).then(() => this.client.registry.resolveCommand('music:play').run(message)));
      if (currentDispatcher) return resolve(message.channel.sendMessage('A song is already playing! Have you tried to resume it?'));

      const playingMessage = new RichEmbed()
        .setColor('#0B7A75')
        .setAuthor(`${song.requester.username}#${song.requester.discriminator} (${song.requester.id})`, song.requester.avatar)
        .setImage(song.thumbnail)
        .setURL(song.url)
        .setTitle(`**${escapeMarkdown(song.title)}** (${song.duration})`);
      const playing = message.channel.sendEmbed(playingMessage);
      let streamError = false;
      let stream;
      /* Using ytdl-core instead of youtube-dl for youtube songs because youtube-dl can't handle them. lol. */
      if (song.url.match(this.ytVideoRegex)) {
        stream = ytdlcore(song.url, { audioonly: true });
      } else {
        stream = ytdl(song.url, ['--format=bestaudio']);
      }
      stream.on('error', err => {
        streamError = true;
        logger.error(`Error occurred when streaming video: ${err}`);
        playing.then(msg => {
          msg.edit(`❌ Couldn't play **${escapeMarkdown(song.title)}**.`);

          this.dispatchers.set(message.guild.id, null);

          currentQueue.playing = false;
          setGuildQueue(message.guild, currentQueue);
          removeFromQueue(message.guild);

          return resolve(this.client.registry.resolveCommand('music:play').run(message));
        });
      });

      const dispatcher = vc.connection.playStream(stream, { passes: passes })
        .on('end', () => {
          if (streamError) return;

          this.dispatchers.set(message.guild.id, null);

          currentQueue.playing = false;
          setGuildQueue(message.guild, currentQueue);
          removeFromQueue(message.guild);

          return resolve(this.client.registry.resolveCommand('music:play').run(message));
        })
        .on('error', err => {
          logger.error(`Error occurred in stream dispatcher: ${err}`);
        })
        .on('warn', warning => {
          logger.warn(warning);
        });
      dispatcher.setVolume(currentQueue.volume / 100);
      this.dispatchers.set(message.guild.id, dispatcher);
      currentQueue.playing = true;
      setGuildQueue(message.guild, currentQueue);
      resolve();
    });
  }
}
