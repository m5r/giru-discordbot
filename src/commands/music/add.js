'use strict';

import { escapeMarkdown } from 'discord.js';
import { Command } from 'discord.js-commando';
import { getGuildQueue, addToQueue, timeStringToSecond, secondToTimeString } from '../../helper';
import ytdl from 'youtube-dl';
import axios from 'axios';
import config from '../../../settings.json';

export default class add extends Command {
  constructor(giru) {
    super(giru, {
      group: 'music',
      name: 'add',
      memberName: 'add',
      description: 'Add a song to the queue.',
      examples: ['add initial d heartbeat', 'add https://www.youtube.com/watch?v=youtubeId', 'add https://soundcloud.com/soundcloud-user/their-song'],
      guildOnly: true,
      args: [
        {
          key: 'song',
          prompt: 'What song do you want to listen to ?',
          type: 'string'
        }
      ],
      throttling: {
        usages: 2,
        duration: 3
      }
    });
    this.soundCloudRegex = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/gi; //eslint-disable-line
    this.ytVideoRegex = /https?:\/\/(?:youtu\.be\/|(?:[a-z]{2,3}\.)?youtube\.com\/watch(?:\?|#\!)v=)([\w-]{11}).*/gi; //eslint-disable-line
  }

  getSearchResult(keywords) {
    return new Promise(resolve => {
      let url = keywords;

      if (!keywords.match(this.soundCloudRegex) && !keywords.match(this.ytVideoRegex)) {
        url = axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keywords)}&key=${config.YouTubeAPIKey}`);
      }

      return resolve(url);
    });
  }

  async run(message, args) {
    return new Promise(resolve => {
      const currentQueue = getGuildQueue(message.guild);

      if (message.author.id !== this.client.options.owner) {
        const maxSongs = config.maxSongs;

        if (maxSongs > 0 && currentQueue.songs.reduce((prev, song) => prev + (song.requester.id === message.author.id), 0) >= maxSongs) {
          return resolve(message.reply(`👎 you already have ${maxSongs} songs in the queue. Don't hog all the airtime!`));
        }
      }

      this.getSearchResult(args.song)
        .then(response => {
          const url = response.data ? `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}` : response;
          const songQueued = currentQueue.songs.find(song => song.url === url);

          if (songQueued) {
            return resolve(message.channel.sendMessage(`👎 **${escapeMarkdown(songQueued.title)}** already queued.`));
          }

          ytdl.getInfo(url, (err, info) => {
            if (err) return message.channel.sendMessage(`:warning: ${err}`);

            addToQueue(message.guild, {
              url: url,
              title: info.title,
              duration: info.duration,
              thumbnail: info.thumbnail ? info.thumbnail : null,
              requester: {
                id: message.author.id,
                username: message.author.username,
                discriminator: message.author.discriminator,
                avatar: message.author.avatarURL || message.author.defaultAvatarURL
              }
            });
            return resolve(message.channel.sendMessage(`👍 Added **${escapeMarkdown(info.title)}** (${this.formatTimeString(info.duration)}) to the queue.`));
          });
        });
    });
  }

  formatTimeString(str) {
    const second = timeStringToSecond(str);

    return secondToTimeString(second);
  }
}
