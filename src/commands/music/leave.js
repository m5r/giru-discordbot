'use strict';

import Discord from 'discord.js'; //eslint-disable-line
import { Command } from 'discord.js-commando';
import { getGuildChannel, setGuildChannel } from '../../helper';

export default class leave extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'leave',
      memberName: 'leave',
      description: 'Leave the voice channel ギル is currently in.',
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
    const voiceChannel = getGuildChannel(message.guild);
    const connection = voiceChannel ? voiceChannel.connection : null;

    if (!connection) {
      return message.channel.sendMessage('ギル is not in a channel!');
    }

    connection.disconnect();
    setGuildChannel(message.guild, null);
  }
}
