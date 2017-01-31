'use strict';

import { Command } from 'discord.js-commando';
import { getGuildQueue, setGuildQueue } from '../../helper';

export default class resume extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'resume',
      memberName: 'resume',
      description: 'Resume the currently paused song.',
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
      const dispatcher = this.dispatchers.get(message.guild.id);

      if (!currentQueue.songs.length) return resolve(message.reply(':warning: The queue is empty!'));
      if (!dispatcher) return resolve(message.reply(':warning: I can\'t resume a song that hasn\'t actually begun playing yet.'));
      if (currentQueue.playing) return resolve(message.reply(':warning: Resuming a song that is isn\'t paused is not a brightest of ideas.'));

      dispatcher.resume();
      currentQueue.playing = true;
      setGuildQueue(message.guild, currentQueue);

      return resolve(message.channel.sendMessage('Resumed the music.'));
    });
  }

  get dispatchers() {
    if (!this._dispatchers) this._dispatchers = this.client.registry.resolveCommand('music:play').dispatchers;

    return this._dispatchers;
  }
}
