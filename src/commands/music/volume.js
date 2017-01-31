'use strict';

import { Command } from 'discord.js-commando';
import { getGuildQueue, setGuildQueue, getGuildChannel } from '../../helper';

export default class volume extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'volume',
      aliases: ['vol'],
      memberName: 'volume',
      description: 'Changes the volume.',
      details: 'The volume level ranges from 0-200. You may specify "up" or "down" to modify the volume level by 10.',
      guildOnly: true,
      args: [
        {
          key: 'level',
          prompt: 'What level should the player be at ?',
          type: 'string'
        }
      ],
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run(message, args) {
    return new Promise(resolve => {
      const currentQueue = getGuildQueue(message.guild);
      const dispatcher = this.dispatchers.get(message.guild.id);
      const voiceChannel = getGuildChannel(message.guild);

      if (!currentQueue.songs.length) return resolve(message.reply(':warning: The queue is empty!'));
      if (!dispatcher) return resolve(message.reply(':warning: No song is being played.'));
      if (!voiceChannel) return resolve(message.reply(':warning: I\' not in any voice channel.'));
      if (!voiceChannel.members.has(message.author.id)) return resolve(message.reply('You\'re not in my voice channel.'));

      let volumeLevel = parseInt(args.level, 10);
      if (isNaN(volumeLevel)) {
        volumeLevel = args.level.toLowerCase();
        switch (volumeLevel) {
        case 'up':
        case '+':
          volumeLevel = (dispatcher.volume * 100) + 10;
          break;
        case 'down':
        case '-':
          volumeLevel = (dispatcher.volume * 100) - 10;
          break;
        default:
          return resolve(message.reply('Invalid volume level.'));
        }
      }

      volumeLevel = Math.min(Math.max(volumeLevel, 0), 200);
      dispatcher.setVolume(volumeLevel / 100);
      currentQueue.volume = volumeLevel;
      setGuildQueue(message.guild, currentQueue);

      return resolve(message.channel.sendMessage(`Volume set to ${volumeLevel}%.`));
    });
  }

  get dispatchers() {
    if (!this._dispatchers) this._dispatchers = this.client.registry.resolveCommand('music:play').dispatchers;

    return this._dispatchers;
  }
}
