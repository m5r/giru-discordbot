'use strict';

import { escapeMarkdown } from 'discord.js';
import { Command } from 'discord.js-commando';
import { getGuildQueue } from '../../helper';

export default class skip extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'skip',
      memberName: 'skip',
      description: 'Remove the first song from the song queue.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run(message) {
    return new Promise(resolve => {
      const currentQueue = getGuildQueue(message.guild);
      const songRemoved = currentQueue.songs[0];
      const dispatcher = this.dispatchers.get(message.guild.id);

      if (!currentQueue.songs.length) return resolve(message.channel.sendMessage(':warning: The queue is empty!'));

      dispatcher.end();

      return resolve(message.channel.sendMessage(`👍 Removed **${escapeMarkdown(songRemoved.title)}**.`));
    });
  }

  get dispatchers() {
    if (!this._dispatchers) this._dispatchers = this.client.registry.resolveCommand('music:play').dispatchers;

    return this._dispatchers;
  }
}
