'use strict';

import { escapeMarkdown } from 'discord.js';
import { Command } from 'discord.js-commando';
import { getGuildQueue, removeFromQueue } from '../../helper';

export default class remove extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'remove',
      memberName: 'remove',
      description: 'Remove a specific song from the song queue.',
      guildOnly: true,
      args: [
        {
          key: 'index',
          prompt: 'Which song do you want to remove from the queue ?',
          type: 'integer'
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
      const actualIndex = args.index - 1;
      const dispatcher = this.dispatchers.get(message.guild.id);

      if (!currentQueue.songs.length) return resolve(message.channel.sendMessage(':warning: The queue is empty!'));
      if (!currentQueue.songs[actualIndex]) return resolve(message.channel.sendMessage(`:warning: No song found at the index ${args.index}.`));

      const songRemoved = currentQueue.songs[actualIndex];

      if (currentQueue.playing && actualIndex === 0) {
        dispatcher.end();
      } else {
        removeFromQueue(message.guild, actualIndex);
      }
      return resolve(message.channel.sendMessage(`👍 Removed **${escapeMarkdown(songRemoved.title)}**.`));
    });
  }

  get dispatchers() {
    if (!this._dispatchers) this._dispatchers = this.client.registry.resolveCommand('music:play').dispatchers;

    return this._dispatchers;
  }
}
