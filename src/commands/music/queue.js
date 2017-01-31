'use strict';

import { escapeMarkdown, RichEmbed } from 'discord.js';
import { Command } from 'discord.js-commando';
import { getGuildQueue, timeStringToSecond, secondToTimeString } from '../../helper';

export default class queue extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'queue',
      memberName: 'queue',
      description: 'Display the current song queue.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run(message) {
    const currentQueue = getGuildQueue(message.guild);
    const queueMessage = new RichEmbed()
      .setColor('#0B7A75')
      .setAuthor(`${message.author.username}#${message.author.discriminator} (${message.author.id})`, message.author.avatarURL)
      .setTitle(`Currently ${currentQueue.songs.length} song${currentQueue.songs.length > 1 ? 's' : ''} in queue`);

    if (currentQueue.songs.length) {
      let queueField = '';
      currentQueue.songs.map((song, index) => {
        queueField += `\n${index + 1} - [${escapeMarkdown(song.title)}](${song.url}) (${song.duration}) - Requested by ${song.requester.username}`;
      });
      queueMessage.setDescription(queueField);

      const totalDuration = currentQueue.songs.reduce((acc, curr) => {
        return acc + timeStringToSecond(curr.duration);
      }, 0);
      queueMessage.addField('Total duration', secondToTimeString(totalDuration));

      return message.channel.sendEmbed(queueMessage);
    }

    return message.channel.sendMessage(`No songs in queue. Add a song with ${this.client.registry.resolveCommand('music:add').usage('<keywords || youtube url || soundcloud url>', message.guild ? message.guild.commandPrefix : null, this.client.user)}`);
  }
}
