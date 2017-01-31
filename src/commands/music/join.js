'use strict';

import Discord from 'discord.js'; //eslint-disable-line
import { Command } from 'discord.js-commando';
import { setGuildChannel } from '../../helper';

export default class join extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'join',
      memberName: 'join',
      description: 'Join the voice channel you are currently in.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  hasPermission(message) {
    return message.member.hasPermission('MANAGE_CHANNEL');
  }

  async run(message) {
    return new Promise((resolve, reject) => {
      const voiceChannel = message.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== 'voice') return message.reply('I couldn\'t connect to your voice channel.');
      voiceChannel.join()
        .then(() => {
          setGuildChannel(message.guild, voiceChannel.id);
          return resolve();
        })
        .catch(err => reject(err));
    });
  }
}
