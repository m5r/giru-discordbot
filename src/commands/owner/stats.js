'use strict';

import { RichEmbed } from 'discord.js';
import { Command } from 'discord.js-commando';
import moment from 'moment';
import 'moment-duration-format';
import { userFilter } from '../../helper';

export default class stats extends Command {
  constructor(giru) {
    super(giru, {
      group: 'owner',
      name: 'stats',
      aliases: ['bot', 'info'],
      memberName: 'stats',
      description: 'Get ギル\'s stats.'
    });
  }

  hasPermission(message) {
    return message.author.id === this.client.options.owner;
  }

  async run(message) {
    const giru = this.client;
    const embed = new RichEmbed()
      .setTitle('ギル (click here to add me on your server)')
      .setAuthor('Mokhtar Mial', 'https://secure.gravatar.com/avatar/9dfbdce6cf8a0977b4006207b1e48515', 'https://mokhtarmial.com')
      .setDescription(`${giru.user.username.toLocaleString()} is currently serving ${giru.users.filter(userFilter).size} user${giru.users.filter(userFilter).size > 1 ? 's' : ''} on ${giru.guilds.size} server${giru.guilds.size > 1 ? 's' : ''}.`)
      .setColor('#0B7A75')
      .addField('Uptime', moment.duration(giru.uptime).format('d[ days], h[ hours], m[ minutes, and ]s[ seconds]'), false)
      .addField('Servers', giru.guilds.size, true)
      .addField('Memory Used', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
      .setURL('https://discordapp.com/oauth2/authorize?&client_id=262717149204709376&scope=bot')
      .setThumbnail('https://mokhtarmial.com/giru.png')
      .setTimestamp();

    return message.channel.sendEmbed(embed);
  }
}
