'use strict';

import { Command } from 'discord.js-commando';
import { emptyQueue } from '../../helper';

export default class empty extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'empty',
      memberName: 'empty',
      description: 'Empty the song queue.',
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
    return new Promise(resolve => {
      emptyQueue(message.guild);
      return resolve(message.channel.sendMessage(`:ok_hand: Emptied the queue.`));
    });
  }
}
