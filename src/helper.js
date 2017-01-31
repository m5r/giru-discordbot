import { defaultVolume } from '../settings.json';

export const getGuildQueue = guild => {
  if (!guild.settings.get('queue')) {
    guild.settings.set('queue', { playing: false, volume: defaultVolume, songs: [] });
  }
  return guild.settings.get('queue');
};

export const setGuildQueue = (guild, queue) => {
  guild.settings.set('queue', queue);
};

export const getGuildChannel = (guild, channelType = 'voiceChannel') => {
  return guild.channels.get(guild.settings.get(channelType));
};

export const setGuildChannel = (guild, channelId, channelType = 'voiceChannel') => {
  guild.settings.set(channelType, channelId);
};

export const addToQueue = (guild, song) => {
  const currentQueue = getGuildQueue(guild);
  currentQueue.songs.push(song);
  guild.settings.set('queue', currentQueue);
};

export const removeFromQueue = (guild, index = 0) => {
  const currentQueue = getGuildQueue(guild);
  currentQueue.songs.splice(index, 1);
  guild.settings.set('queue', currentQueue);
};

export const emptyQueue = guild => {
  const currentQueue = getGuildQueue(guild);
  currentQueue.songs = [];
  guild.settings.set('queue', currentQueue);
};

export const userFilter = user => !user.bot && user.presence.status !== 'offline';

export const timeStringToSecond = str => {
  const duration = str.split(':');
  let sec = 0, min = 1;

  while (duration.length > 0) {
    sec += min * parseInt(duration.pop(), 10);
    min *= 60;
  }

  return sec;
};

export const secondToTimeString = seconds => {
  const parts = [];
  parts.push(`0${seconds % 60}`.slice(-2));
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) {
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      parts.push(`0${minutes % 60}`.slice(-2));
      parts.push(hours);
    } else {
      parts.push(minutes % 60);
    }
  } else {
    parts.push('0');
  }
  return parts.reverse().join(':');
};
