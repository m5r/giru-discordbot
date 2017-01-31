'use strict';

import { Command } from 'discord.js-commando';
import { escapeMarkdown, RichEmbed } from 'discord.js';
import { getGuildQueue, secondToTimeString } from '../../helper';

export default class status extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'status',
      memberName: 'status',
      description: 'Display the current song\'s status.',
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
      const song = currentQueue.songs[0];

      if (!currentQueue.songs.length) return resolve(message.reply(':warning: The queue is empty!'));
      if (!dispatcher) return resolve(message.reply(':warning: No song is being played.'));

      const currentTime = secondToTimeString(parseInt(dispatcher.time / 1000, 10));
      const playingMessage = new RichEmbed()
        .setColor('#0B7A75')
        .addField('Music player status', dispatcher.paused ? 'Paused' : 'Playing')
        .addField('Volume', `${dispatcher.volume * 100}%`)
        .addField('Current song', escapeMarkdown(song.title))
        .addField('Time', `${currentTime} / ${song.duration}`)
        .setThumbnail(song.thumbnail);

      return resolve(message.channel.sendEmbed(playingMessage));
    });
  }

  get dispatchers() {
    if (!this._dispatchers) this._dispatchers = this.client.registry.resolveCommand('music:play').dispatchers;

    return this._dispatchers;
  }
}
