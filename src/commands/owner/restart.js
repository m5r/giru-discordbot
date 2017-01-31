'use strict';

import Discord from 'discord.js'; //eslint-disable-line
import { Command } from 'discord.js-commando';

export default class restart extends Command {
  constructor(giru) {
    super(giru, {
      group: 'owner',
      name: 'restart',
      aliases: ['reboot', 'kill'],
      memberName: 'restart',
      description: 'Kill ギル so he shall rise again harder and stronger. What is dead may never die. 🐙'
    });
  }

  hasPermission(message) {
    return message.author.id === this.client.options.owner;
  }

  async run() {
    this.client.destroy();
    setTimeout(() => {
      console.log('Disconnected, exiting process...');
      process.exit();
    }, 1000);
  }
}
