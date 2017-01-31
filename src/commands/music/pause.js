'use strict';

import { Command } from 'discord.js-commando';
import { getGuildQueue, setGuildQueue, getGuildChannel } from '../../helper';

export default class pause extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'pause',
      memberName: 'pause',
      description: 'Pause the currently playing song.',
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
      const voiceChannel = getGuildChannel(message.guild);

      if (!currentQueue.songs.length) return resolve(message.reply(':warning: The queue is empty!'));
      if (!dispatcher) return resolve(message.reply(':warning: I can\'t pause a song that hasn\'t even begun playing yet.'));
      if (!currentQueue.playing) return resolve(message.reply(':warning: Pausing a song that is already paused is not a brightest of ideas.'));
      if (!voiceChannel.members.has(message.author.id)) return resolve(message.reply('You\'re not in my voice channel.'));

      dispatcher.pause();
      currentQueue.playing = false;
      setGuildQueue(message.guild, currentQueue);

      return resolve(message.channel.sendMessage(`Paused the music. Use ${this.client.registry.resolveCommand('music:resume').usage('', message.guild ? message.guild.commandPrefix : null, this.client.user)} to continue playing.`));
    });
  }

  get dispatchers() {
    if (!this._dispatchers) this._dispatchers = this.client.registry.resolveCommand('music:play').dispatchers;

    return this._dispatchers;
  }
}
